import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { api } from "../api/SingIn.ts";
import type {
    IApplication,
    IApplicationMutationResponse,
    IApplicationsResponse,
} from "../models/IApplication.ts";
import type {
    ApplicationPaginationItem,
    ApplicationsSortField,
    ApplicationsSortOrder,
    ApplicationsTextFilterField,
    ApplicationsTextFilters,
    IApplicationEditForm,
    IApplicationFormErrors,
    IApplicationsFilters,
} from "../models/IApplicationPage.ts";
import { getCurrentUserSurnameNormalized } from "../utils/auth.ts";
import { ApplicationEditModal } from "./ApplicationEditModal.tsx";
import { ApplicationFilters } from "./ApplicationFilters.tsx";
import { ApplicationsPagination } from "./ApplicationsPagination.tsx";
import { ApplicationsTable } from "./ApplicationsTable.tsx";

const ITEMS_PER_PAGE = 25;
const SORTABLE_FIELDS: ApplicationsSortField[] = [
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
];
const DEFAULT_SORT_BY: ApplicationsSortField = "created_at";
const DEFAULT_SORT_ORDER: ApplicationsSortOrder = "desc";
const TEXT_FILTER_FIELDS: ApplicationsTextFilterField[] = [
    "name",
    "surname",
    "email",
    "phone",
    "age",
];

const createEmptyEditForm = (): IApplicationEditForm => ({
    name: "",
    surname: "",
    email: "",
    phone: "",
    age: "",
    course: "",
    course_format: "",
    course_type: "",
    status: "",
    sum: "",
    alreadyPaid: "",
    group: "",
});

const createDefaultFilters = (): IApplicationsFilters => ({
    name: "",
    surname: "",
    email: "",
    phone: "",
    age: "",
    course: "",
    course_format: "",
    course_type: "",
    status: "",
    group: "",
    startDate: "",
    endDate: "",
    my: false,
    sortBy: DEFAULT_SORT_BY,
    sortOrder: DEFAULT_SORT_ORDER,
});

const pickTextFilters = (filters: IApplicationsFilters): ApplicationsTextFilters => ({
    name: filters.name,
    surname: filters.surname,
    email: filters.email,
    phone: filters.phone,
    age: filters.age,
});

const getApplicationId = (application: IApplication) => application._id || application.id || "";

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

const getEditFormFromApplication = (application: IApplication): IApplicationEditForm => ({
    name: application.name ?? "",
    surname: application.surname ?? "",
    email: application.email ?? "",
    phone: application.phone ?? "",
    age: application.age === null || application.age === undefined ? "" : String(application.age),
    course: application.course ?? "",
    course_format: application.course_format ?? "",
    course_type: application.course_type ?? "",
    status: application.status ?? "",
    sum: application.sum === null || application.sum === undefined ? "" : String(application.sum),
    alreadyPaid:
        application.alreadyPaid === null || application.alreadyPaid === undefined
            ? application.already_paid === null || application.already_paid === undefined
                ? ""
                : String(application.already_paid)
            : String(application.alreadyPaid),
    group: application.group ?? "",
});

const buildEditPayload = (form: IApplicationEditForm) => ({
    name: form.name.trim(),
    surname: form.surname.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
    age: form.age.trim(),
    course: form.course,
    course_format: form.course_format,
    course_type: form.course_type,
    status: form.status,
    sum: form.sum.trim(),
    alreadyPaid: form.alreadyPaid.trim(),
    group: form.group.trim(),
});

const validateOptionalNumber = (value: string) => value === "" || /^\d+$/.test(value.trim());

const validateOptionalEmail = (value: string) => value === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

const validateOptionalPhone = (value: string) => value === "" || /^\d{10,15}$/.test(value.trim());

const isSortField = (value: string): value is ApplicationsSortField =>
    SORTABLE_FIELDS.includes(value as ApplicationsSortField);

const getSortField = (value: string | null): ApplicationsSortField =>
    value && isSortField(value) ? value : DEFAULT_SORT_BY;

const getSortOrder = (value: string | null): ApplicationsSortOrder =>
    value === "asc" ? "asc" : DEFAULT_SORT_ORDER;

const validateEditForm = (editForm: IApplicationEditForm): IApplicationFormErrors => {
    const errors: IApplicationFormErrors = {};

    if (!validateOptionalEmail(editForm.email)) {
        errors.email = "Invalid email";
    }

    if (!validateOptionalPhone(editForm.phone)) {
        errors.phone = "Phone must contain 10-15 digits";
    }

    if (!validateOptionalNumber(editForm.age)) {
        errors.age = "Age must be numeric";
    }

    if (!validateOptionalNumber(editForm.sum)) {
        errors.sum = "Sum must be numeric";
    }

    if (!validateOptionalNumber(editForm.alreadyPaid)) {
        errors.alreadyPaid = "Already paid must be numeric";
    }

    return errors;
};

const getFiltersFromSearchParams = (searchParams: URLSearchParams): IApplicationsFilters => ({
    name: searchParams.get("name") || "",
    surname: searchParams.get("surname") || "",
    email: searchParams.get("email") || "",
    phone: searchParams.get("phone") || "",
    age: searchParams.get("age") || "",
    course: searchParams.get("course") || "",
    course_format: searchParams.get("course_format") || "",
    course_type: searchParams.get("course_type") || "",
    status: searchParams.get("status") || "",
    group: searchParams.get("group") || "",
    startDate: searchParams.get("startDate") || "",
    endDate: searchParams.get("endDate") || "",
    my: searchParams.get("my") === "true",
    sortBy: getSortField(searchParams.get("sortBy")),
    sortOrder: getSortOrder(searchParams.get("sortOrder")),
});

const areTextFiltersEqual = (left: ApplicationsTextFilters, right: ApplicationsTextFilters) =>
    TEXT_FILTER_FIELDS.every((field) => left[field] === right[field]);

export const Application = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [applications, setApplications] = useState<IApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFetching, setIsFetching] = useState(false);
    const [error, setError] = useState("");
    const [expandedId, setExpandedId] = useState("");
    const [submittingId, setSubmittingId] = useState("");
    const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [availableGroups, setAvailableGroups] = useState<string[]>([]);
    const [editingApplicationId, setEditingApplicationId] = useState("");
    const [editForm, setEditForm] = useState<IApplicationEditForm>(createEmptyEditForm());
    const [editSubmitting, setEditSubmitting] = useState(false);
    const [newGroupName, setNewGroupName] = useState("");
    const [formErrors, setFormErrors] = useState<IApplicationFormErrors>({});
    const [exportLoading, setExportLoading] = useState(false);

    const searchParamsKey = searchParams.toString();
    const filters = getFiltersFromSearchParams(searchParams);
    const [textFilters, setTextFilters] = useState<ApplicationsTextFilters>(() =>
        pickTextFilters(filters)
    );
    const currentPageFromQuery = Number(searchParams.get("page") || 1);
    const currentPage = currentPageFromQuery > 0 ? currentPageFromQuery : 1;
    const currentUserSurnameNormalized = getCurrentUserSurnameNormalized();

    const resetEditState = () => {
        setEditingApplicationId("");
        setEditForm(createEmptyEditForm());
        setNewGroupName("");
        setFormErrors({});
    };

    const updateSearchParams = (
        updates: Partial<Record<keyof IApplicationsFilters | "page", string | boolean>>,
        options?: { replace?: boolean; resetPage?: boolean }
    ) => {
        const nextSearchParams = new URLSearchParams(searchParams);

        Object.entries(updates).forEach(([key, rawValue]) => {
            const value =
                typeof rawValue === "boolean" ? (rawValue ? "true" : "") : String(rawValue || "");

            if (!value) {
                nextSearchParams.delete(key);
                return;
            }

            nextSearchParams.set(key, value);
        });

        if (options?.resetPage) {
            nextSearchParams.set("page", "1");
        } else if (!nextSearchParams.get("page")) {
            nextSearchParams.set("page", "1");
        }

        setSearchParams(nextSearchParams, {
            replace: options?.replace,
            preventScrollReset: true,
        });
    };

    useEffect(() => {
        const nextTextFilters = pickTextFilters(filters);

        setTextFilters((current) =>
            areTextFiltersEqual(current, nextTextFilters) ? current : nextTextFilters
        );
    }, [filters.age, filters.email, filters.name, filters.phone, filters.surname]);

    useEffect(() => {
        const nextSearchParams = new URLSearchParams(searchParams);
        let shouldReplace = false;

        if (searchParams.get("page") !== String(currentPage)) {
            nextSearchParams.set("page", String(currentPage));
            shouldReplace = true;
        }

        if (searchParams.get("sortBy") !== filters.sortBy) {
            nextSearchParams.set("sortBy", filters.sortBy);
            shouldReplace = true;
        }

        if (searchParams.get("sortOrder") !== filters.sortOrder) {
            nextSearchParams.set("sortOrder", filters.sortOrder);
            shouldReplace = true;
        }

        if (shouldReplace) {
            setSearchParams(nextSearchParams, {
                replace: true,
                preventScrollReset: true,
            });
        }
    }, [currentPage, filters.sortBy, filters.sortOrder, searchParamsKey, setSearchParams]);

    useEffect(() => {
        const appliedTextFilters = pickTextFilters(filters);

        if (areTextFiltersEqual(textFilters, appliedTextFilters)) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            updateSearchParams(textFilters, { replace: true, resetPage: true });
        }, 800);

        return () => window.clearTimeout(timeoutId);
    }, [
        filters.age,
        filters.email,
        filters.name,
        filters.phone,
        filters.surname,
        searchParamsKey,
        textFilters,
    ]);

    useEffect(() => {
        const fetchApplications = async () => {
            setIsFetching(true);
            setError("");

            try {
                const requestSearchParams = new URLSearchParams(searchParams);
                requestSearchParams.set("page", String(currentPage));
                requestSearchParams.set("limit", String(ITEMS_PER_PAGE));

                const { data } = await api.get<IApplicationsResponse>(
                    `/applications?${requestSearchParams.toString()}`
                );

                setApplications(data.data);
                setTotalItems(data.totalItems);
                setTotalPages(data.totalPages);
                setAvailableGroups(data.groups);

                if (data.page !== currentPage) {
                    const nextSearchParams = new URLSearchParams(searchParams);
                    nextSearchParams.set("page", String(data.page));

                    setSearchParams(nextSearchParams, {
                        replace: true,
                        preventScrollReset: true,
                    });
                }
            } catch (requestError) {
                console.log(requestError);
                setError("Failed to load applications");
            } finally {
                setLoading(false);
                setIsFetching(false);
            }
        };

        fetchApplications();
    }, [currentPage, searchParamsKey, setSearchParams]);

    const paginationItems = useMemo(
        () => buildPagination(currentPage, totalPages),
        [currentPage, totalPages]
    );

    const groupOptions = useMemo(() => {
        const uniqueGroups = new Set(availableGroups);

        const selectedGroup = filters.group.trim();
        const editGroup = editForm.group.trim();

        if (selectedGroup) {
            uniqueGroups.add(selectedGroup);
        }

        if (editGroup) {
            uniqueGroups.add(editGroup);
        }

        return Array.from(uniqueGroups).sort((left, right) => left.localeCompare(right));
    }, [availableGroups, editForm.group, filters.group]);

    const changePage = (page: number) => {
        updateSearchParams({ page: String(page) });
    };

    const handleSortChange = (field: ApplicationsSortField) => {
        const nextOrder: ApplicationsSortOrder =
            filters.sortBy === field && filters.sortOrder === "asc" ? "desc" : "asc";

        updateSearchParams(
            {
                sortBy: field,
                sortOrder: nextOrder,
            },
            { resetPage: true }
        );
    };

    const handleToggleExpanded = (applicationId: string) => {
        setExpandedId((current) => (current === applicationId ? "" : applicationId));
    };

    const handleDraftChange = (applicationId: string, value: string) => {
        setCommentDrafts((current) => ({
            ...current,
            [applicationId]: value,
        }));
    };

    const handleCommentSubmit = async (application: IApplication) => {
        const applicationId = getApplicationId(application);

        if (!applicationId) {
            return;
        }

        const comment = String(commentDrafts[applicationId] || "").trim();

        if (!comment) {
            return;
        }

        try {
            setSubmittingId(applicationId);

            const { data } = await api.patch<IApplicationMutationResponse>(
                `/applications/${applicationId}/comment`,
                { comment }
            );

            setApplications((current) =>
                current.map((item) => (getApplicationId(item) === applicationId ? data.data : item))
            );

            setCommentDrafts((current) => ({
                ...current,
                [applicationId]: "",
            }));
        } catch (requestError: any) {
            alert(requestError.response?.data?.message || "Failed to save comment");
        } finally {
            setSubmittingId("");
        }
    };

    const handleEditInputChange = (field: keyof IApplicationEditForm, value: string) => {
        setEditForm((current) => ({
            ...current,
            [field]: value,
        }));

        setFormErrors((current) => ({
            ...current,
            [field]: "",
        }));
    };

    const handleOpenEditModal = (application: IApplication) => {
        const manager = String(application.manager || "").trim().toLowerCase();
        const canEdit = !manager || manager === currentUserSurnameNormalized;

        if (!canEdit) {
            alert("You can edit only your application or an unassigned application");
            return;
        }

        setEditingApplicationId(getApplicationId(application));
        setEditForm(getEditFormFromApplication(application));
        setNewGroupName("");
        setFormErrors({});
    };

    const handleCloseEditModal = () => {
        if (editSubmitting) {
            return;
        }

        resetEditState();
    };

    const handleNewGroupNameChange = (value: string) => {
        setNewGroupName(value);
        setFormErrors((current) => ({
            ...current,
            newGroup: "",
        }));
    };

    const handleAddGroup = () => {
        const trimmedGroupName = newGroupName.trim();

        if (!trimmedGroupName) {
            setFormErrors((current) => ({
                ...current,
                newGroup: "Enter a group name",
            }));
            return;
        }

        const groupExists = groupOptions.some(
            (group) => group.toLowerCase() === trimmedGroupName.toLowerCase()
        );

        if (groupExists) {
            setFormErrors((current) => ({
                ...current,
                newGroup: "Group name must be unique",
            }));
            return;
        }

        setEditForm((current) => ({
            ...current,
            group: trimmedGroupName,
        }));
        setNewGroupName("");
        setFormErrors((current) => ({
            ...current,
            newGroup: "",
            group: "",
        }));
    };

    const handleSelectGroup = () => {
        const trimmedGroupName = newGroupName.trim();

        if (!trimmedGroupName) {
            setFormErrors((current) => ({
                ...current,
                newGroup: "Enter a group name",
            }));
            return;
        }

        const matchedGroup = groupOptions.find(
            (group) => group.toLowerCase() === trimmedGroupName.toLowerCase()
        );

        if (!matchedGroup) {
            setFormErrors((current) => ({
                ...current,
                newGroup: "Group does not exist",
            }));
            return;
        }

        setEditForm((current) => ({
            ...current,
            group: matchedGroup,
        }));
        setNewGroupName(matchedGroup);
        setFormErrors((current) => ({
            ...current,
            newGroup: "",
            group: "",
        }));
    };

    const handleEditSubmit = async () => {
        if (!editingApplicationId) {
            return;
        }

        const errors = validateEditForm(editForm);

        if (Object.keys(errors).length) {
            setFormErrors(errors);
            return;
        }

        try {
            setEditSubmitting(true);

            const { data } = await api.patch<IApplicationMutationResponse>(
                `/applications/${editingApplicationId}`,
                buildEditPayload(editForm)
            );

            setApplications((current) =>
                current.map((item) =>
                    getApplicationId(item) === editingApplicationId ? data.data : item
                )
            );

            resetEditState();
        } catch (requestError: any) {
            alert(requestError.response?.data?.message || "Failed to update application");
        } finally {
            setEditSubmitting(false);
        }
    };

    const handleTextFilterChange = (field: ApplicationsTextFilterField, value: string) => {
        setTextFilters((current) => ({
            ...current,
            [field]: value,
        }));
    };

    const handleSelectFilterChange = (
        field:
            | "course"
            | "course_format"
            | "course_type"
            | "status"
            | "group"
            | "startDate"
            | "endDate",
        value: string
    ) => {
        updateSearchParams({ [field]: value }, { resetPage: true });
    };

    const handleToggleMy = (checked: boolean) => {
        updateSearchParams({ my: checked }, { resetPage: true });
    };

    const handleResetFilters = () => {
        const nextFilters = createDefaultFilters();
        setTextFilters(pickTextFilters(nextFilters));
        setSearchParams(new URLSearchParams({ page: "1" }), {
            replace: true,
            preventScrollReset: true,
        });
    };

    const handleExport = async () => {
        try {
            setExportLoading(true);
            const requestSearchParams = new URLSearchParams(searchParams);
            requestSearchParams.delete("page");
            requestSearchParams.delete("limit");

            const response = await api.get<Blob>(
                `/applications/export?${requestSearchParams.toString()}`,
                {
                    responseType: "blob",
                }
            );

            const contentDisposition = String(response.headers["content-disposition"] || "");
            const matchedFileName = contentDisposition.match(/filename="?([^"]+)"?/i);
            const fileName = matchedFileName?.[1] || "applications.xlsx";
            const blob = new Blob([response.data], {
                type:
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = downloadUrl;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);
        } catch (requestError: any) {
            alert(requestError.response?.data?.message || "Failed to export applications");
        } finally {
            setExportLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="applications-page">
                <div className="applications-card">
                    <p className="applications-state">Loading applications...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="applications-page">
                <div className="applications-card">
                    <p className="applications-state applications-state--error">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="applications-page">
            <div className="applications-card">
                <div className="applications-header">
                    <span className="applications-count">Total: {totalItems}</span>
                    {isFetching && <span className="applications-count">Updating...</span>}
                </div>

                <ApplicationFilters
                    exportLoading={exportLoading}
                    filters={filters}
                    groupOptions={groupOptions}
                    onExport={handleExport}
                    onReset={handleResetFilters}
                    onSelectChange={handleSelectFilterChange}
                    onTextChange={handleTextFilterChange}
                    onToggleMy={handleToggleMy}
                    textFilters={textFilters}
                />

                <ApplicationsTable
                    applications={applications}
                    commentDrafts={commentDrafts}
                    currentSortBy={filters.sortBy}
                    currentSortOrder={filters.sortOrder}
                    currentUserSurnameNormalized={currentUserSurnameNormalized}
                    expandedId={expandedId}
                    submittingId={submittingId}
                    onCommentDraftChange={handleDraftChange}
                    onCommentSubmit={handleCommentSubmit}
                    onOpenEditModal={handleOpenEditModal}
                    onSortChange={handleSortChange}
                    onToggleExpanded={handleToggleExpanded}
                />

                {!applications.length && <p className="applications-state">No applications found</p>}

                <ApplicationsPagination
                    currentPage={currentPage}
                    paginationItems={paginationItems}
                    totalPages={totalPages}
                    onChangePage={changePage}
                />
            </div>

            {editingApplicationId && (
                <ApplicationEditModal
                    editForm={editForm}
                    editSubmitting={editSubmitting}
                    formErrors={formErrors}
                    groupOptions={groupOptions}
                    newGroupName={newGroupName}
                    onAddGroup={handleAddGroup}
                    onClose={handleCloseEditModal}
                    onInputChange={handleEditInputChange}
                    onNewGroupNameChange={handleNewGroupNameChange}
                    onSelectGroup={handleSelectGroup}
                    onSubmit={handleEditSubmit}
                />
            )}
        </div>
    );
};
