import { NextFunction, Request, Response } from "express";
import { FilterQuery, PipelineStage, Types } from "mongoose";
import * as XLSX from "xlsx";

import {
    COURSE_FORMAT_OPTIONS,
    COURSE_OPTIONS,
    COURSE_TYPE_OPTIONS,
    STATUS_OPTIONS,
} from "../constants/application-options";
import { ApiError } from "../errors/api.error";
import { IApplication, IApplicationComment } from "../interfaces/application.interface";
import { Application } from "../models/application.model";
import { userRepository } from "../repositories/user.repositories";

const ITEMS_PER_PAGE = 25;
const SORTABLE_FIELDS = [
    "id",
    "name",
    "surname",
    "email",
    "phone",
    "age",
    "course",
    "course_format",
    "course_type",
    "status",
    "sum",
    "alreadyPaid",
    "group",
    "created_at",
    "manager",
] as const;
const DEFAULT_SORT_BY = "created_at";
const DEFAULT_SORT_ORDER = "desc";
const PERSON_NAME_REGEX = /^[\p{L}]+(?:[ '-][\p{L}]+)*$/u;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;

type SortableField = (typeof SORTABLE_FIELDS)[number];
type SortOrder = "asc" | "desc";

const normalizeManager = (value: string | null | undefined) => String(value || "").trim().toLowerCase();

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getTrimmedQueryValue = (value: unknown) => String(value || "").trim();

const isSortableField = (value: string): value is SortableField =>
    (SORTABLE_FIELDS as readonly string[]).includes(value);

const getSortField = (value: unknown): SortableField => {
    const normalizedValue = getTrimmedQueryValue(value);

    return isSortableField(normalizedValue) ? normalizedValue : DEFAULT_SORT_BY;
};

const getSortOrder = (value: unknown): SortOrder =>
    getTrimmedQueryValue(value).toLowerCase() === "asc" ? "asc" : DEFAULT_SORT_ORDER;

const buildExactMatch = (value: string) => new RegExp(`^${escapeRegex(value)}$`, "i");

const buildStringFieldFilter = (
    field: keyof Pick<IApplication, "name" | "surname" | "email" | "phone">,
    value: string
): FilterQuery<IApplication> => ({
    [field]: { $regex: escapeRegex(value), $options: "i" },
});

const buildNumericTextFilter = (field: "age", value: string): FilterQuery<IApplication> => ({
    $expr: {
        $regexMatch: {
            input: { $ifNull: [{ $toString: `$${field}` }, ""] },
            regex: escapeRegex(value),
            options: "i",
        },
    },
});

const buildCreatedAtFilter = (startDate: string, endDate: string): FilterQuery<IApplication> | null => {
    const createdAtFilter: Record<string, Date> = {};

    if (startDate) {
        createdAtFilter.$gte = new Date(`${startDate}T00:00:00.000Z`);
    }

    if (endDate) {
        createdAtFilter.$lte = new Date(`${endDate}T23:59:59.999Z`);
    }

    return Object.keys(createdAtFilter).length ? { created_at: createdAtFilter } : null;
};

const formatDateForExport = (value: Date | string | null | undefined) => {
    if (!value) {
        return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return date.toISOString().replace("T", " ").slice(0, 19);
};

const mapApplicationForExport = (application: IApplication) => ({
    id: application.id || application._id || "",
    name: application.name || "",
    surname: application.surname || "",
    email: application.email || "",
    phone: application.phone || "",
    age: application.age ?? "",
    course: application.course || "",
    course_format: application.course_format || "",
    course_type: application.course_type || "",
    status: application.status || "",
    sum: application.sum ?? "",
    alreadyPaid: application.alreadyPaid ?? application.already_paid ?? "",
    group: application.group || "",
    created_at: formatDateForExport(application.created_at),
    manager: application.manager || "",
});

const buildSortStage = (sortBy: SortableField, sortOrder: SortOrder): PipelineStage.Sort => {
    const direction = sortOrder === "asc" ? 1 : -1;

    if (sortBy === "id") {
        return {
            $sort: {
                sortableId: direction,
                _id: direction,
            },
        };
    }

    if (sortBy === "alreadyPaid") {
        return {
            $sort: {
                sortableAlreadyPaid: direction,
                _id: direction,
            },
        };
    }

    return {
        $sort: {
            [sortBy]: direction,
            _id: direction,
        },
    };
};

const buildApplicationsPipeline = (
    filter: FilterQuery<IApplication>,
    sortBy: SortableField,
    sortOrder: SortOrder,
    options?: { skip?: number; limit?: number }
): PipelineStage[] => {
    const pipeline: PipelineStage[] = [
        { $match: filter },
        {
            $addFields: {
                sortableId: {
                    $ifNull: ["$id", { $toString: "$_id" }],
                },
                sortableAlreadyPaid: {
                    $ifNull: ["$alreadyPaid", "$already_paid"],
                },
            },
        },
        buildSortStage(sortBy, sortOrder),
    ];

    if (typeof options?.skip === "number") {
        pipeline.push({ $skip: options.skip });
    }

    if (typeof options?.limit === "number") {
        pipeline.push({ $limit: options.limit });
    }

    pipeline.push({
        $project: {
            sortableId: 0,
            sortableAlreadyPaid: 0,
        },
    });

    return pipeline;
};

const buildApplicationsFilter = async (
    req: Request,
    currentUserId?: string
): Promise<FilterQuery<IApplication>> => {
    const name = getTrimmedQueryValue(req.query.name);
    const surname = getTrimmedQueryValue(req.query.surname);
    const email = getTrimmedQueryValue(req.query.email);
    const phone = getTrimmedQueryValue(req.query.phone);
    const age = getTrimmedQueryValue(req.query.age);
    const course = getTrimmedQueryValue(req.query.course);
    const courseFormat = getTrimmedQueryValue(req.query.course_format);
    const courseType = getTrimmedQueryValue(req.query.course_type);
    const status = getTrimmedQueryValue(req.query.status);
    const group = getTrimmedQueryValue(req.query.group);
    const startDate = getTrimmedQueryValue(req.query.startDate);
    const endDate = getTrimmedQueryValue(req.query.endDate);
    const my = getTrimmedQueryValue(req.query.my).toLowerCase() === "true";

    const filters: FilterQuery<IApplication>[] = [];

    if (name) {
        filters.push(buildStringFieldFilter("name", name));
    }

    if (surname) {
        filters.push(buildStringFieldFilter("surname", surname));
    }

    if (email) {
        filters.push(buildStringFieldFilter("email", email));
    }

    if (phone) {
        filters.push(buildStringFieldFilter("phone", phone));
    }

    if (age) {
        filters.push(buildNumericTextFilter("age", age));
    }

    if (course) {
        filters.push({ course: buildExactMatch(course) });
    }

    if (courseFormat) {
        filters.push({ course_format: buildExactMatch(courseFormat) });
    }

    if (courseType) {
        filters.push({ course_type: buildExactMatch(courseType) });
    }

    if (status) {
        filters.push({ status: buildExactMatch(status) });
    }

    if (group) {
        filters.push({ group: buildExactMatch(group) });
    }

    const createdAtFilter = buildCreatedAtFilter(startDate, endDate);

    if (createdAtFilter) {
        filters.push(createdAtFilter);
    }

    if (my) {
        if (!currentUserId) {
            throw new ApiError("Unauthorized", 401);
        }

        const currentUser = await userRepository.getById(currentUserId);

        if (!currentUser) {
            throw new ApiError("User not found", 404);
        }

        const currentUserSurname = getTrimmedQueryValue(currentUser.surname);

        if (!currentUserSurname) {
            throw new ApiError("Current user does not have a surname", 400);
        }

        filters.push({ manager: buildExactMatch(currentUserSurname) });
    }

    return filters.length ? { $and: filters } : {};
};

export const getAllApplications = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const parsedPage = Number(req.query.page) || 1;
        const parsedLimit = Number(req.query.limit) || ITEMS_PER_PAGE;
        const page = parsedPage > 0 ? parsedPage : 1;
        const limit = parsedLimit > 0 ? parsedLimit : ITEMS_PER_PAGE;
        const filter = await buildApplicationsFilter(req, res.locals.tokenPayload?.userId);
        const sortBy = getSortField(req.query.sortBy);
        const sortOrder = getSortOrder(req.query.sortOrder);

        const [totalItems, groups] = await Promise.all([
            Application.countDocuments(filter),
            Application.distinct("group", { group: { $nin: ["", null] } }),
        ]);

        const totalPages = Math.max(1, Math.ceil(totalItems / limit));
        const currentPage = Math.min(page, totalPages);
        const skip = (currentPage - 1) * limit;
        const applications = await Application.aggregate(
            buildApplicationsPipeline(filter, sortBy, sortOrder, {
                skip,
                limit,
            })
        ).collation({
            locale: "en",
            strength: 2,
            numericOrdering: true,
        });

        res.json({
            data: applications,
            page: currentPage,
            limit,
            totalItems,
            totalPages,
            sortBy,
            sortOrder,
            groups: groups
                .map((item) => String(item || "").trim())
                .filter(Boolean)
                .sort((left, right) => left.localeCompare(right)),
        });
    } catch (error) {
        next(error);
    }
};

export const exportApplications = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const filter = await buildApplicationsFilter(req, res.locals.tokenPayload?.userId);
        const sortBy = getSortField(req.query.sortBy);
        const sortOrder = getSortOrder(req.query.sortOrder);
        const applications = await Application.aggregate(
            buildApplicationsPipeline(filter, sortBy, sortOrder)
        ).collation({
            locale: "en",
            strength: 2,
            numericOrdering: true,
        });
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(applications.map(mapApplicationForExport));
        const fileName = `applications-${new Date().toISOString().slice(0, 10)}.xlsx`;

        XLSX.utils.book_append_sheet(workbook, worksheet, "Applications");

        const buffer = XLSX.write(workbook, {
            type: "buffer",
            bookType: "xlsx",
        });

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
        res.send(buffer);
    } catch (error) {
        next(error);
    }
};

export const addApplicationComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const applicationId = req.params.id;
        const commentText = String(req.body?.comment || "").trim();
        const userId = res.locals.tokenPayload?.userId;

        if (!commentText) {
            throw new ApiError("Comment is required", 400);
        }

        if (!userId) {
            throw new ApiError("Unauthorized", 401);
        }

        if (!Types.ObjectId.isValid(applicationId)) {
            throw new ApiError("Invalid application id", 400);
        }

        const [application, user] = await Promise.all([
            Application.findById(applicationId),
            userRepository.getById(userId),
        ]);

        if (!application) {
            throw new ApiError("Application not found", 404);
        }

        if (!user) {
            throw new ApiError("User not found", 404);
        }

        const userSurname = String(user.surname || "").trim();
        const userFullName = [user.name, user.surname].filter(Boolean).join(" ").trim();
        const currentManager = String(application.manager || "").trim();
        const currentManagerNormalized = normalizeManager(currentManager);
        const userSurnameNormalized = normalizeManager(userSurname);

        if (currentManager && currentManagerNormalized !== userSurnameNormalized) {
            throw new ApiError("This application is assigned to another manager", 403);
        }

        const newComment: IApplicationComment = {
            text: commentText,
            author: userFullName || user.email,
            createdAt: new Date(),
        };

        const rawStatus = application.status;
        const currentStatus = String(rawStatus || "").trim().toLowerCase();
        const shouldMoveToInWork =
            rawStatus === null ||
            rawStatus === undefined ||
            currentStatus === "" ||
            currentStatus === "new";

        const updatePayload: Record<string, unknown> = {
            manager: userSurname,
        };

        if (shouldMoveToInWork) {
            updatePayload.status = "In work";
        }

        const updatedApplication = await Application.findByIdAndUpdate(
            applicationId,
            {
                $set: updatePayload,
                $push: { comments: newComment },
            },
            {
                new: true,
            }
        );

        if (!updatedApplication) {
            throw new ApiError("Application not found", 404);
        }

        res.json({
            message: "Comment added successfully",
            data: updatedApplication,
        });
    } catch (error) {
        next(error);
    }
};

export const updateApplication = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const applicationId = req.params.id;
        const userId = res.locals.tokenPayload?.userId;

        if (!userId) {
            throw new ApiError("Unauthorized", 401);
        }

        if (!Types.ObjectId.isValid(applicationId)) {
            throw new ApiError("Invalid application id", 400);
        }

        const [application, user] = await Promise.all([
            Application.findById(applicationId),
            userRepository.getById(userId),
        ]);

        if (!application) {
            throw new ApiError("Application not found", 404);
        }

        if (!user) {
            throw new ApiError("User not found", 404);
        }

        const currentManager = String(application.manager || "").trim();
        const currentManagerNormalized = normalizeManager(currentManager);
        const userSurname = String(user.surname || "").trim();
        const userSurnameNormalized = normalizeManager(userSurname);

        if (currentManager && currentManagerNormalized !== userSurnameNormalized) {
            throw new ApiError("This application is assigned to another manager", 403);
        }

        const editableFields = [
            "name",
            "surname",
            "email",
            "phone",
            "age",
            "course",
            "course_format",
            "course_type",
            "status",
            "sum",
            "alreadyPaid",
            "already_paid",
            "group",
        ] as const;

        const updatePayload: Record<string, unknown> = {};

        for (const field of editableFields) {
            if (!(field in req.body)) {
                continue;
            }

            const value = req.body[field];

            if (["age", "sum", "alreadyPaid", "already_paid"].includes(field)) {
                if (field === "age") {
                    if (value === "" || value === null || value === undefined) {
                        throw new ApiError("Age is required", 400);
                    }

                    const normalizedValue = String(value).trim();

                    if (!/^\d+$/.test(normalizedValue)) {
                        throw new ApiError("Age must be numeric", 400);
                    }

                    const numericValue = Number(normalizedValue);

                    if (numericValue < 1 || numericValue > 120) {
                        throw new ApiError("Age must be between 1 and 120", 400);
                    }

                    updatePayload[field] = numericValue;
                    continue;
                }

                if (value === "" || value === null || value === undefined) {
                    updatePayload[field] = null;
                    continue;
                }

                const numericValue = Number(value);

                if (Number.isNaN(numericValue)) {
                    throw new ApiError(`Invalid value for ${field}`, 400);
                }

                updatePayload[field] = numericValue;
                continue;
            }

            if (value === null || value === undefined) {
                if (field === "name" || field === "surname" || field === "email") {
                    throw new ApiError(
                        `${field === "name" ? "Name" : field === "surname" ? "Surname" : "Email"} is required`,
                        400
                    );
                }

                updatePayload[field] = "";
                continue;
            }

            const normalizedValue = String(value).trim();

            if (field === "name" || field === "surname") {
                if (!normalizedValue) {
                    throw new ApiError(`${field === "name" ? "Name" : "Surname"} is required`, 400);
                }

                if (!PERSON_NAME_REGEX.test(normalizedValue)) {
                    throw new ApiError(
                        `${field === "name" ? "Name" : "Surname"} must contain only letters`,
                        400
                    );
                }
            }

            if (
                field === "status" &&
                normalizedValue &&
                !(STATUS_OPTIONS as readonly string[]).includes(normalizedValue)
            ) {
                throw new ApiError("Invalid status value", 400);
            }

            if (
                field === "course" &&
                normalizedValue &&
                !(COURSE_OPTIONS as readonly string[]).includes(normalizedValue)
            ) {
                throw new ApiError("Invalid course value", 400);
            }

            if (
                field === "course_type" &&
                normalizedValue &&
                !(COURSE_TYPE_OPTIONS as readonly string[]).includes(normalizedValue)
            ) {
                throw new ApiError("Invalid course type value", 400);
            }

            if (
                field === "course_format" &&
                normalizedValue &&
                !(COURSE_FORMAT_OPTIONS as readonly string[]).includes(normalizedValue)
            ) {
                throw new ApiError("Invalid course format value", 400);
            }

            if (field === "email") {
                if (!normalizedValue) {
                    throw new ApiError("Email is required", 400);
                }

                if (!EMAIL_REGEX.test(normalizedValue)) {
                    throw new ApiError("Invalid email value", 400);
                }
            }

            if (field === "phone" && normalizedValue && !/^\d{10,15}$/.test(normalizedValue)) {
                throw new ApiError("Invalid phone value", 400);
            }

            updatePayload[field] = normalizedValue;
        }

        const nextStatus = String(
            updatePayload.status ?? application.status ?? ""
        ).trim();
        updatePayload.manager = nextStatus === "New" ? null : userSurname;

        const updatedApplication = await Application.findByIdAndUpdate(
            applicationId,
            { $set: updatePayload },
            { new: true }
        );

        if (!updatedApplication) {
            throw new ApiError("Application not found", 404);
        }

        res.json({
            message: "Application updated successfully",
            data: updatedApplication,
        });
    } catch (error) {
        next(error);
    }
};
