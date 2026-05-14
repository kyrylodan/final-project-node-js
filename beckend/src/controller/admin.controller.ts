import { randomUUID } from "node:crypto";

import { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";

import { STATUS_OPTIONS } from "../constants/application-options";
import { configs } from "../configs/config";
import { ApiError } from "../errors/api.error";
import { IUser } from "../interfaces/user.interface";
import { Application } from "../models/application.model";
import User from "../models/user.model";
import { userRepository } from "../repositories/user.repositories";
import { passwordService } from "../services/password.service";
import { tokenService } from "../services/token.service";

const MANAGERS_PER_PAGE = 4;
const MANAGER_ACTION_EXPIRES_IN = "30m";
const MANAGER_ACTION_EXPIRES_MS = 30 * 60 * 1000;

const normalizeValue = (value: string | null | undefined) => String(value || "").trim();

const getAdminEmails = () =>
    [configs.ADMIN_EMAIL, "admin@gmail.com"]
        .filter(Boolean)
        .map((email) => String(email).toLowerCase());

const isAdminAccount = (user: IUser) => getAdminEmails().includes(String(user.email).toLowerCase());

const buildActionLink = (req: Request, token: string) => {
    const origin = String(req.headers.origin || configs.FRONTEND_URL || "http://localhost:5173")
        .trim()
        .replace(/\/$/, "");

    return `${origin}/activate/${token}`;
};

const sanitizeManager = (
    manager: IUser,
    statsMap: Map<string, { total: number; inWork: number }>
) => {
    const managerKey = normalizeValue(manager.surname).toLowerCase();
    const managerStats = statsMap.get(managerKey) || { total: 0, inWork: 0 };

    return {
        _id: String(manager._id || ""),
        email: manager.email,
        name: manager.name,
        surname: manager.surname,
        role: manager.role,
        created_at: manager.created_at,
        last_login: manager.last_login ?? null,
        isActive: Boolean(manager.isActive),
        isBanned: Boolean(manager.isBanned),
        applicationsTotal: managerStats.total,
        applicationsInWork: managerStats.inWork,
    };
};

const buildManagerStatsMap = async (managers: IUser[]) => {
    const managerKeys = managers
        .map((manager) => normalizeValue(manager.surname).toLowerCase())
        .filter(Boolean);

    if (!managerKeys.length) {
        return new Map<string, { total: number; inWork: number }>();
    }

    const groupedApplications = await Application.aggregate<{
        _id: string;
        total: number;
        inWork: number;
    }>([
        {
            $project: {
                managerKey: { $toLower: { $ifNull: ["$manager", ""] } },
                isInWork: {
                    $cond: [
                        { $eq: [{ $toLower: { $ifNull: ["$status", ""] } }, "in work"] },
                        1,
                        0,
                    ],
                },
            },
        },
        {
            $match: {
                managerKey: { $in: managerKeys },
            },
        },
        {
            $group: {
                _id: "$managerKey",
                total: { $sum: 1 },
                inWork: { $sum: "$isInWork" },
            },
        },
    ]);

    return new Map(
        groupedApplications.map((item) => [
            item._id,
            { total: item.total, inWork: item.inWork },
        ])
    );
};

const createManagerActionLink = async (
    req: Request,
    res: Response,
    next: NextFunction,
    action: "activation" | "recovery"
) => {
    try {
        const managerId = req.params.id;

        if (!Types.ObjectId.isValid(managerId)) {
            throw new ApiError("Invalid manager id", 400);
        }

        const manager = await userRepository.getById(managerId);

        if (!manager || isAdminAccount(manager)) {
            throw new ApiError("Manager not found", 404);
        }

        if (action === "activation" && manager.isActive) {
            throw new ApiError("Manager is already activated", 400);
        }

        if (action === "recovery" && !manager.isActive) {
            throw new ApiError("Manager is not activated yet", 400);
        }

        const actionToken = tokenService.generateManagerActionToken(
            { userId: String(manager._id), action },
            MANAGER_ACTION_EXPIRES_IN
        );
        const expiresAt = new Date(Date.now() + MANAGER_ACTION_EXPIRES_MS);

        await userRepository.updateById(String(manager._id), {
            actionToken,
            actionTokenType: action,
            actionTokenExpiresAt: expiresAt,
        });

        res.status(200).json({
            message: "Action link generated successfully",
            link: buildActionLink(req, actionToken),
            expiresAt,
        });
    } catch (error) {
        next(error);
    }
};

export const getApplicationStatistics = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const [total, groupedStatuses] = await Promise.all([
            Application.countDocuments(),
            Application.aggregate<{ _id: string | null; count: number }>([
                {
                    $group: {
                        _id: "$status",
                        count: { $sum: 1 },
                    },
                },
            ]),
        ]);

        const groupedMap = new Map<string, number>();

        for (const item of groupedStatuses) {
            const status = normalizeValue(item._id);

            if (status) {
                groupedMap.set(status, item.count);
            }
        }

        res.json({
            total,
            statuses: STATUS_OPTIONS.map((status) => ({
                status,
                count: groupedMap.get(status) || 0,
            })),
        });
    } catch (error) {
        next(error);
    }
};

export const getManagers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const parsedPage = Number(req.query.page) || 1;
        const parsedLimit = Number(req.query.limit) || MANAGERS_PER_PAGE;
        const page = parsedPage > 0 ? parsedPage : 1;
        const limit = parsedLimit > 0 ? parsedLimit : MANAGERS_PER_PAGE;
        const managerFilter = {
            email: {
                $nin: getAdminEmails(),
            },
        };

        const totalItems = await User.countDocuments(managerFilter);
        const totalPages = Math.max(1, Math.ceil(totalItems / limit));
        const currentPage = Math.min(page, totalPages);
        const skip = (currentPage - 1) * limit;
        const managers = await User.find(managerFilter)
            .sort({ created_at: -1 })
            .skip(skip)
            .limit(limit);
        const statsMap = await buildManagerStatsMap(managers);

        res.status(200).json({
            data: managers.map((manager) => sanitizeManager(manager, statsMap)),
            page: currentPage,
            limit,
            totalItems,
            totalPages,
        });
    } catch (error) {
        next(error);
    }
};

export const createManager = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const name = normalizeValue(req.body?.name);
        const surname = normalizeValue(req.body?.surname);
        const email = normalizeValue(req.body?.email).toLowerCase();

        if (!name || !surname || !email) {
            throw new ApiError("Name, surname and email are required", 400);
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            throw new ApiError("Invalid email", 400);
        }

        const existingManager = await userRepository.getByEmail(email);

        if (existingManager) {
            throw new ApiError("User with this email already exists", 409);
        }

        const hashedPassword = await passwordService.hashPassword(randomUUID());
        const createdManager = await userRepository.create({
            name,
            surname,
            email,
            password: hashedPassword,
            role: "manager",
            phone: "0000000000",
            age: 0,
            course: "none",
            course_format: "none",
            course_type: "none",
            isActive: false,
            isBanned: false,
            last_login: null,
            actionToken: null,
            actionTokenType: null,
            actionTokenExpiresAt: null,
        });

        res.status(201).json({
            message: "Manager created successfully",
            data: sanitizeManager(createdManager, new Map()),
        });
    } catch (error: any) {
        if (error?.code === 11000) {
            next(new ApiError("User with this email already exists", 409));
            return;
        }

        next(error);
    }
};

export const createManagerActivationLink = async (
    req: Request,
    res: Response,
    next: NextFunction
) => createManagerActionLink(req, res, next, "activation");

export const createManagerRecoveryLink = async (
    req: Request,
    res: Response,
    next: NextFunction
) => createManagerActionLink(req, res, next, "recovery");

export const updateManagerBanStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const managerId = req.params.id;
        const isBanned = Boolean(req.body?.isBanned);

        if (!Types.ObjectId.isValid(managerId)) {
            throw new ApiError("Invalid manager id", 400);
        }

        const manager = await userRepository.getById(managerId);

        if (!manager || isAdminAccount(manager)) {
            throw new ApiError("Manager not found", 404);
        }

        const updatedManager = await userRepository.updateById(managerId, { isBanned });

        if (!updatedManager) {
            throw new ApiError("Manager not found", 404);
        }

        const statsMap = await buildManagerStatsMap([updatedManager]);

        res.status(200).json({
            message: isBanned ? "Manager banned successfully" : "Manager unbanned successfully",
            data: sanitizeManager(updatedManager, statsMap),
        });
    } catch (error) {
        next(error);
    }
};
