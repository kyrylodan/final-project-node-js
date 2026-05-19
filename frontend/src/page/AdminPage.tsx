import { useEffect, useMemo, useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";

import { api } from "../api/SingIn.ts";
import type { IAdminStatisticsResponse } from "../models/IAdmin.ts";
import type {
    IManagerActionLinkResponse,
    IManagerAdminItem,
    IManagerMutationResponse,
    IManagersResponse,
} from "../models/IManager.ts";
import type { ApplicationPaginationItem } from "../models/IApplicationPage.ts";
import { getStoredUser, isAdminUser } from "../utils/auth.ts";
import { ApplicationsPagination } from "./ApplicationsPagination.tsx";
import { ManagerCreateModal } from "./ManagerCreateModal.tsx";

const MANAGERS_PER_PAGE = 4;
const PERSON_NAME_REGEX = /^[\p{L}]+(?:[ '-][\p{L}]+)*$/u;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;

const buildPagination = (currentPage: number, totalPages: number): ApplicationPaginationItem[] => {
    const items: ApplicationPaginationItem[] = [];

    if (totalPages <= 8) {
        for (let page = 1; page <= totalPages; page += 1) {
            items.push(page);
        }

        return items;
    }

    const middlePage = Math.ceil(totalPages / 2);

    if (currentPage <= middlePage) {
        for (let page = 1; page <= 7; page += 1) {
            items.push(page);
        }

        items.push("dots-right", totalPages);
        return items;
    }

    items.push(1, "dots-left");

    for (let page = Math.max(totalPages - 6, 2); page <= totalPages; page += 1) {
        items.push(page);
    }

    return items;
};

const formatDateTime = (value?: string | null) => {
    if (!value) {
        return "null";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const createEmptyManagerForm = () => ({
    email: "",
    name: "",
    surname: "",
});

const createEmptyManagerFormErrors = () => ({
    email: "",
    name: "",
    surname: "",
    general: "",
});

const copyTextToClipboard = async (value: string) => {
    if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
        return;
    }

    const textArea = document.createElement("textarea");
    textArea.value = value;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
};

export const AdminPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const user = useMemo(() => getStoredUser(), []);
    const isAdmin = isAdminUser(user);
    const [statistics, setStatistics] = useState<IAdminStatisticsResponse | null>(null);
    const [managers, setManagers] = useState<IManagerAdminItem[]>([]);
    const [statisticsLoading, setStatisticsLoading] = useState(true);
    const [managersLoading, setManagersLoading] = useState(true);
    const [managersFetching, setManagersFetching] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createSubmitting, setCreateSubmitting] = useState(false);
    const [totalPages, setTotalPages] = useState(1);
    const [actionLoadingId, setActionLoadingId] = useState("");
    const [managerForm, setManagerForm] = useState(createEmptyManagerForm());
    const [managerFormErrors, setManagerFormErrors] = useState(createEmptyManagerFormErrors());
    const searchParamsKey = searchParams.toString();
    const currentPageFromQuery = Number(searchParams.get("page") || 1);
    const currentPage = currentPageFromQuery > 0 ? currentPageFromQuery : 1;

    const paginationItems = useMemo(
        () => buildPagination(currentPage, totalPages),
        [currentPage, totalPages]
    );

    const updateSearchParams = (updates: Record<string, string>, options?: { replace?: boolean }) => {
        const nextSearchParams = new URLSearchParams(searchParams);

        Object.entries(updates).forEach(([key, value]) => {
            const normalizedValue = String(value || "").trim();

            if (!normalizedValue) {
                nextSearchParams.delete(key);
                return;
            }

            nextSearchParams.set(key, normalizedValue);
        });

        if (!nextSearchParams.get("page")) {
            nextSearchParams.set("page", "1");
        }

        setSearchParams(nextSearchParams, {
            replace: options?.replace,
            preventScrollReset: true,
        });
    };

    const loadStatistics = async () => {
        try {
            setStatisticsLoading(true);
            const { data } = await api.get<IAdminStatisticsResponse>("/admin/stats");
            setStatistics(data);
        } catch (requestError: any) {
            setError(requestError.response?.data?.message || "Failed to load statistics");
        } finally {
            setStatisticsLoading(false);
        }
    };

    const loadManagers = async (page = currentPage) => {
        try {
            setManagersFetching(true);
            const { data } = await api.get<IManagersResponse>(
                `/admin/managers?page=${page}&limit=${MANAGERS_PER_PAGE}`
            );
            setManagers(data.data);
            setTotalPages(data.totalPages);

            if (data.page !== page) {
                updateSearchParams({ page: String(data.page) }, { replace: true });
            }
        } catch (requestError: any) {
            setError(requestError.response?.data?.message || "Failed to load managers");
        } finally {
            setManagersLoading(false);
            setManagersFetching(false);
        }
    };

    useEffect(() => {
        if (isAdmin) {
            loadStatistics();
        }
    }, [isAdmin]);

    useEffect(() => {
        if (searchParams.get("page") !== String(currentPage)) {
            updateSearchParams({ page: String(currentPage) }, { replace: true });
            return;
        }

        if (!isAdmin) {
            return;
        }

        loadManagers(currentPage);
    }, [currentPage, isAdmin, searchParamsKey]);

    if (!isAdmin) {
        return <Navigate replace to="/applications?page=1" />;
    }

    const changePage = (page: number) => {
        updateSearchParams({ page: String(page) });
    };

    const handleManagerFormChange = (
        field: "email" | "name" | "surname",
        value: string
    ) => {
        setManagerForm((current) => ({
            ...current,
            [field]: value,
        }));

        setManagerFormErrors((current) => ({
            ...current,
            [field]: "",
            general: "",
        }));
    };

    const validateManagerForm = () => {
        const normalizedEmail = managerForm.email.trim();
        const normalizedName = managerForm.name.trim();
        const normalizedSurname = managerForm.surname.trim();
        const nextErrors = createEmptyManagerFormErrors();

        if (!normalizedEmail) {
            nextErrors.email = "Email is required";
        } else if (!EMAIL_REGEX.test(normalizedEmail)) {
            nextErrors.email = "Invalid email";
        }

        if (!normalizedName) {
            nextErrors.name = "Name is required";
        } else if (!PERSON_NAME_REGEX.test(normalizedName)) {
            nextErrors.name = "Name must contain only letters";
        }

        if (!normalizedSurname) {
            nextErrors.surname = "Surname is required";
        } else if (!PERSON_NAME_REGEX.test(normalizedSurname)) {
            nextErrors.surname = "Surname must contain only letters";
        }

        return nextErrors;
    };

    const handleCreateManager = async () => {
        const validationErrors = validateManagerForm();

        if (Object.values(validationErrors).some(Boolean)) {
            setManagerFormErrors(validationErrors);
            return;
        }

        try {
            setCreateSubmitting(true);
            setManagerFormErrors(createEmptyManagerFormErrors());
            setMessage("");

            const payload = {
                email: managerForm.email.trim(),
                name: managerForm.name.trim(),
                surname: managerForm.surname.trim(),
            };

            const { data } = await api.post<IManagerMutationResponse>("/admin/managers", payload);

            setMessage(`${data.data.email} created successfully`);
            setManagerForm(createEmptyManagerForm());
            setManagerFormErrors(createEmptyManagerFormErrors());
            setShowCreateModal(false);
            await loadStatistics();

            if (currentPage !== 1) {
                changePage(1);
            } else {
                await loadManagers(1);
            }
        } catch (requestError: any) {
            setManagerFormErrors((current) => ({
                ...current,
                general: requestError.response?.data?.message || "Failed to create manager",
            }));
        } finally {
            setCreateSubmitting(false);
        }
    };

    const handleGenerateActionLink = async (
        managerId: string,
        action: "activation" | "recovery"
    ) => {
        try {
            setActionLoadingId(`${managerId}-${action}`);
            setError("");
            const route =
                action === "activation"
                    ? `/admin/managers/${managerId}/activate-link`
                    : `/admin/managers/${managerId}/recovery-link`;
            const { data } = await api.post<IManagerActionLinkResponse>(route);
            await copyTextToClipboard(data.link);
            setMessage(
                `${action === "activation" ? "Activation" : "Recovery"} link copied to clipboard`
            );
        } catch (requestError: any) {
            setError(requestError.response?.data?.message || "Failed to generate action link");
        } finally {
            setActionLoadingId("");
        }
    };

    const handleBanStatusChange = async (managerId: string, isBanned: boolean) => {
        try {
            setActionLoadingId(`${managerId}-${isBanned ? "ban" : "unban"}`);
            setError("");
            setMessage("");

            const { data } = await api.patch<IManagerMutationResponse>(
                `/admin/managers/${managerId}/ban`,
                { isBanned }
            );

            setManagers((current) =>
                current.map((item) => (item._id === managerId ? data.data : item))
            );
            setMessage(isBanned ? "Manager banned" : "Manager unbanned");
        } catch (requestError: any) {
            setError(requestError.response?.data?.message || "Failed to update manager status");
        } finally {
            setActionLoadingId("");
        }
    };

    return (
        <div className="admin-page">
            <div className="admin-panel">
                <div className="admin-toolbar">
                    <button
                        className="admin-create-button"
                        onClick={() => {
                            setShowCreateModal(true);
                            setManagerForm(createEmptyManagerForm());
                            setManagerFormErrors(createEmptyManagerFormErrors());
                            setMessage("");
                            setError("");
                        }}
                        type="button"
                    >
                        Create
                    </button>

                    {message && <p className="admin-message">{message}</p>}
                    {error && <p className="admin-error">{error}</p>}
                    {managersFetching && !managersLoading && (
                        <p className="applications-state">Updating managers...</p>
                    )}
                </div>

                <div className="admin-stats">
                    {statisticsLoading && <p className="applications-state">Loading statistics...</p>}

                    {!statisticsLoading && statistics && (
                        <>
                            <div className="admin-stat-card admin-stat-card--accent">
                                <span>Total applications</span>
                                <strong>{statistics.total}</strong>
                            </div>

                            {statistics.statuses.map((item) => (
                                <div className="admin-stat-card" key={item.status}>
                                    <span>{item.status}</span>
                                    <strong>{item.count}</strong>
                                </div>
                            ))}
                        </>
                    )}
                </div>

                <div className="manager-list">
                    {managersLoading && <p className="applications-state">Loading managers...</p>}

                    {!managersLoading &&
                        managers.map((manager) => (
                            <article className="manager-card" key={manager._id}>
                                <div className="manager-card__header">
                                    <div>
                                        <p className="manager-card__id">id: {manager._id}</p>
                                        <p className="manager-card__email">email: {manager.email}</p>
                                    </div>

                                    <div className="manager-card__totals">
                                        <span>total: {manager.applicationsTotal}</span>
                                        <span>in work: {manager.applicationsInWork}</span>
                                    </div>
                                </div>

                                <div className="manager-card__body">
                                    <div className="manager-card__info">
                                        <p>name: {manager.name}</p>
                                        <p>surname: {manager.surname}</p>
                                        <p>role: {manager.role}</p>
                                        <p>status: {manager.isActive ? "active" : "inactive"}</p>
                                        <p>banned: {manager.isBanned ? "yes" : "no"}</p>
                                        <p>created: {formatDateTime(manager.created_at)}</p>
                                        <p>last_login: {formatDateTime(manager.last_login)}</p>
                                    </div>

                                    <div className="manager-card__actions">
                                        {manager.role === "admin" ? (
                                            <span className="manager-card__admin-badge">
                                                Admin account
                                            </span>
                                        ) : (
                                            <>
                                                <button
                                                    className="manager-action-button"
                                                    disabled={actionLoadingId === `${manager._id}-${manager.isActive ? "recovery" : "activation"}`}
                                                    onClick={() =>
                                                        handleGenerateActionLink(
                                                            manager._id,
                                                            manager.isActive ? "recovery" : "activation"
                                                        )
                                                    }
                                                    type="button"
                                                >
                                                    {actionLoadingId ===
                                                    `${manager._id}-${manager.isActive ? "recovery" : "activation"}`
                                                        ? "..."
                                                        : manager.isActive
                                                          ? "Recovery password"
                                                          : "Activate"}
                                                </button>

                                                <button
                                                    className="manager-action-button"
                                                    disabled={manager.isBanned || actionLoadingId === `${manager._id}-ban`}
                                                    onClick={() => handleBanStatusChange(manager._id, true)}
                                                    type="button"
                                                >
                                                    {actionLoadingId === `${manager._id}-ban` ? "..." : "Ban"}
                                                </button>

                                                <button
                                                    className="manager-action-button"
                                                    disabled={!manager.isBanned || actionLoadingId === `${manager._id}-unban`}
                                                    onClick={() => handleBanStatusChange(manager._id, false)}
                                                    type="button"
                                                >
                                                    {actionLoadingId === `${manager._id}-unban` ? "..." : "Unban"}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </article>
                        ))}

                    {!managersLoading && !managers.length && (
                        <p className="applications-state">No managers found</p>
                    )}
                </div>

                <ApplicationsPagination
                    currentPage={currentPage}
                    paginationItems={paginationItems}
                    totalPages={totalPages}
                    onChangePage={changePage}
                />
            </div>

            {showCreateModal && (
                <ManagerCreateModal
                    email={managerForm.email}
                    errors={managerFormErrors}
                    name={managerForm.name}
                    onClose={() => {
                        if (createSubmitting) {
                            return;
                        }

                        setShowCreateModal(false);
                        setManagerFormErrors(createEmptyManagerFormErrors());
                    }}
                    onEmailChange={(value) => handleManagerFormChange("email", value)}
                    onNameChange={(value) => handleManagerFormChange("name", value)}
                    onSubmit={handleCreateManager}
                    onSurnameChange={(value) => handleManagerFormChange("surname", value)}
                    submitting={createSubmitting}
                    surname={managerForm.surname}
                />
            )}
        </div>
    );
};
