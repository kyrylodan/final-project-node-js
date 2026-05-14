import { Fragment } from "react";

import type { IApplication, IApplicationComment } from "../models/IApplication.ts";
import type {
    ApplicationsSortField,
    ApplicationsSortOrder,
} from "../models/IApplicationPage.ts";

const TOTAL_COLUMNS = 15;

const getApplicationId = (application: IApplication) => application._id || application.id || "";

const getMessageValue = (application: IApplication) =>
    application.msg ?? application.message ?? application.messageText ?? null;

const getUtmValue = (application: IApplication) =>
    application.utm ?? application.utm_source ?? application.utmSource ?? null;

const formatValue = (value: string | number | null | undefined) => {
    if (value === null || value === undefined || value === "") {
        return "null";
    }

    return value;
};

const formatDate = (value: string) => {
    if (!value) {
        return "null";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString("en-US", {
        month: "long",
        day: "2-digit",
        year: "numeric",
    });
};

const formatDateTime = (value: string) => {
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

interface SortableHeaderProps {
    field: ApplicationsSortField;
    label: string;
    currentSortBy: ApplicationsSortField;
    currentSortOrder: ApplicationsSortOrder;
    onSortChange: (field: ApplicationsSortField) => void;
}

const SortableHeader = ({
    field,
    label,
    currentSortBy,
    currentSortOrder,
    onSortChange,
}: SortableHeaderProps) => {
    const isActive = currentSortBy === field;
    const ariaSort = isActive
        ? currentSortOrder === "asc"
            ? "ascending"
            : "descending"
        : "none";

    return (
        <th aria-sort={ariaSort}>
            <button
                className={`applications-table-sort-button ${isActive ? "applications-table-sort-button--active" : ""}`}
                onClick={() => onSortChange(field)}
                type="button"
            >
                <span>{label}</span>
                {isActive && (
                    <span className="applications-table-sort-indicator">
                        {currentSortOrder === "asc" ? "↑" : "↓"}
                    </span>
                )}
            </button>
        </th>
    );
};

interface ApplicationsTableProps {
    applications: IApplication[];
    commentDrafts: Record<string, string>;
    currentSortBy: ApplicationsSortField;
    currentSortOrder: ApplicationsSortOrder;
    currentUserSurnameNormalized: string;
    expandedId: string;
    submittingId: string;
    onCommentDraftChange: (applicationId: string, value: string) => void;
    onCommentSubmit: (application: IApplication) => void;
    onOpenEditModal: (application: IApplication) => void;
    onSortChange: (field: ApplicationsSortField) => void;
    onToggleExpanded: (applicationId: string) => void;
}

export const ApplicationsTable = ({
    applications,
    commentDrafts,
    currentSortBy,
    currentSortOrder,
    currentUserSurnameNormalized,
    expandedId,
    submittingId,
    onCommentDraftChange,
    onCommentSubmit,
    onOpenEditModal,
    onSortChange,
    onToggleExpanded,
}: ApplicationsTableProps) => (
    <div className="applications-table-wrapper">
        <table className="applications-table">
            <thead>
                <tr>
                    <SortableHeader
                        currentSortBy={currentSortBy}
                        currentSortOrder={currentSortOrder}
                        field="id"
                        label="id"
                        onSortChange={onSortChange}
                    />
                    <SortableHeader
                        currentSortBy={currentSortBy}
                        currentSortOrder={currentSortOrder}
                        field="name"
                        label="name"
                        onSortChange={onSortChange}
                    />
                    <SortableHeader
                        currentSortBy={currentSortBy}
                        currentSortOrder={currentSortOrder}
                        field="surname"
                        label="surname"
                        onSortChange={onSortChange}
                    />
                    <SortableHeader
                        currentSortBy={currentSortBy}
                        currentSortOrder={currentSortOrder}
                        field="email"
                        label="email"
                        onSortChange={onSortChange}
                    />
                    <SortableHeader
                        currentSortBy={currentSortBy}
                        currentSortOrder={currentSortOrder}
                        field="phone"
                        label="phone"
                        onSortChange={onSortChange}
                    />
                    <SortableHeader
                        currentSortBy={currentSortBy}
                        currentSortOrder={currentSortOrder}
                        field="age"
                        label="age"
                        onSortChange={onSortChange}
                    />
                    <SortableHeader
                        currentSortBy={currentSortBy}
                        currentSortOrder={currentSortOrder}
                        field="course"
                        label="course"
                        onSortChange={onSortChange}
                    />
                    <SortableHeader
                        currentSortBy={currentSortBy}
                        currentSortOrder={currentSortOrder}
                        field="course_format"
                        label="course_format"
                        onSortChange={onSortChange}
                    />
                    <SortableHeader
                        currentSortBy={currentSortBy}
                        currentSortOrder={currentSortOrder}
                        field="course_type"
                        label="course_type"
                        onSortChange={onSortChange}
                    />
                    <SortableHeader
                        currentSortBy={currentSortBy}
                        currentSortOrder={currentSortOrder}
                        field="status"
                        label="status"
                        onSortChange={onSortChange}
                    />
                    <SortableHeader
                        currentSortBy={currentSortBy}
                        currentSortOrder={currentSortOrder}
                        field="sum"
                        label="sum"
                        onSortChange={onSortChange}
                    />
                    <SortableHeader
                        currentSortBy={currentSortBy}
                        currentSortOrder={currentSortOrder}
                        field="alreadyPaid"
                        label="alreadyPaid"
                        onSortChange={onSortChange}
                    />
                    <SortableHeader
                        currentSortBy={currentSortBy}
                        currentSortOrder={currentSortOrder}
                        field="group"
                        label="group"
                        onSortChange={onSortChange}
                    />
                    <SortableHeader
                        currentSortBy={currentSortBy}
                        currentSortOrder={currentSortOrder}
                        field="created_at"
                        label="created_at"
                        onSortChange={onSortChange}
                    />
                    <SortableHeader
                        currentSortBy={currentSortBy}
                        currentSortOrder={currentSortOrder}
                        field="manager"
                        label="manager"
                        onSortChange={onSortChange}
                    />
                </tr>
            </thead>
            <tbody>
                {applications.map((application) => {
                    const applicationId = getApplicationId(application);
                    const isExpanded = expandedId === applicationId;
                    const manager = String(application.manager || "").trim();
                    const canComment =
                        !manager || manager.toLowerCase() === currentUserSurnameNormalized;
                    const canEdit =
                        !manager || manager.toLowerCase() === currentUserSurnameNormalized;
                    const comments: IApplicationComment[] = Array.isArray(application.comments)
                        ? application.comments
                        : [];
                    const draft = commentDrafts[applicationId] || "";

                    return (
                        <Fragment key={applicationId}>
                            <tr
                                className={`applications-row ${isExpanded ? "applications-row--expanded" : ""}`}
                                onClick={() => onToggleExpanded(applicationId)}
                            >
                                <td>{application.id || application._id || "null"}</td>
                                <td>{formatValue(application.name)}</td>
                                <td>{formatValue(application.surname)}</td>
                                <td>{formatValue(application.email)}</td>
                                <td>{formatValue(application.phone)}</td>
                                <td>{formatValue(application.age)}</td>
                                <td>{formatValue(application.course)}</td>
                                <td>{formatValue(application.course_format)}</td>
                                <td>{formatValue(application.course_type)}</td>
                                <td>{formatValue(application.status)}</td>
                                <td>{formatValue(application.sum)}</td>
                                <td>{formatValue(application.already_paid ?? application.alreadyPaid)}</td>
                                <td>{formatValue(application.group)}</td>
                                <td>{formatDate(application.created_at)}</td>
                                <td>{formatValue(application.manager)}</td>
                            </tr>

                            {isExpanded && (
                                <tr className="applications-expanded-row">
                                    <td colSpan={TOTAL_COLUMNS}>
                                        <div className="application-details">
                                            <div className="application-meta">
                                                <p>
                                                    <span>Message:</span>{" "}
                                                    {formatValue(getMessageValue(application))}
                                                </p>
                                                <p>
                                                    <span>UTM:</span>{" "}
                                                    {formatValue(getUtmValue(application))}
                                                </p>
                                                <p>
                                                    <span>Manager:</span>{" "}
                                                    {formatValue(application.manager)}
                                                </p>
                                                <p>
                                                    <span>Group:</span>{" "}
                                                    {formatValue(application.group)}
                                                </p>
                                            </div>

                                            <div
                                                className="application-comments"
                                                onClick={(event) => event.stopPropagation()}
                                            >
                                                <div className="application-comments-list">
                                                    {comments.length ? (
                                                        comments.map((commentItem, index) => (
                                                            <div
                                                                className="application-comment"
                                                                key={`${commentItem.createdAt}-${index}`}
                                                            >
                                                                <p className="application-comment__text">
                                                                    {commentItem.text}
                                                                </p>
                                                                <div className="application-comment__meta">
                                                                    <span>{commentItem.author}</span>
                                                                    <span>
                                                                        {formatDateTime(
                                                                            commentItem.createdAt
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p className="application-comments-empty">
                                                            No comments yet
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="application-comment-form">
                                                    <div className="application-comment-form-main">
                                                        <input
                                                            className="application-comment-input"
                                                            disabled={!canComment || submittingId === applicationId}
                                                            onChange={(event) =>
                                                                onCommentDraftChange(
                                                                    applicationId,
                                                                    event.target.value
                                                                )
                                                            }
                                                            placeholder={
                                                                canComment
                                                                    ? "Comment"
                                                                    : "Only the assigned manager can comment"
                                                            }
                                                            value={draft}
                                                        />

                                                        <button
                                                            className="application-comment-button"
                                                            disabled={
                                                                !canComment ||
                                                                !draft.trim() ||
                                                                submittingId === applicationId
                                                            }
                                                            onClick={() => onCommentSubmit(application)}
                                                            type="button"
                                                        >
                                                            {submittingId === applicationId ? "..." : "Submit"}
                                                        </button>
                                                    </div>

                                                    <button
                                                        className="application-edit-button"
                                                        disabled={!canEdit}
                                                        onClick={() => onOpenEditModal(application)}
                                                        type="button"
                                                    >
                                                        Edit
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </Fragment>
                    );
                })}
            </tbody>
        </table>
    </div>
);
