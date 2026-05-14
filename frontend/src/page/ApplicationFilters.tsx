import type {
    ApplicationsTextFilterField,
    ApplicationsTextFilters,
    IApplicationsFilters,
} from "../models/IApplicationPage.ts";
import {
    COURSE_FORMAT_OPTIONS,
    COURSE_OPTIONS,
    COURSE_TYPE_OPTIONS,
    STATUS_OPTIONS,
} from "../utils/applicationOptions.ts";
import { ExportIcon, ResetIcon } from "../components/AppIcons.tsx";

interface ApplicationFiltersProps {
    exportLoading: boolean;
    filters: IApplicationsFilters;
    groupOptions: string[];
    textFilters: ApplicationsTextFilters;
    onExport: () => void;
    onReset: () => void;
    onSelectChange: (
        field:
            | "course"
            | "course_format"
            | "course_type"
            | "status"
            | "group"
            | "startDate"
            | "endDate",
        value: string
    ) => void;
    onTextChange: (field: ApplicationsTextFilterField, value: string) => void;
    onToggleMy: (checked: boolean) => void;
}

export const ApplicationFilters = ({
    exportLoading,
    filters,
    groupOptions,
    textFilters,
    onExport,
    onReset,
    onSelectChange,
    onTextChange,
    onToggleMy,
}: ApplicationFiltersProps) => (
    <div className="applications-filters">
        <div className="applications-filters-grid">
            <label className="applications-filter-field">
                <span>Name</span>
                <input
                    onChange={(event) => onTextChange("name", event.target.value)}
                    placeholder="Name"
                    value={textFilters.name}
                />
            </label>

            <label className="applications-filter-field">
                <span>Surname</span>
                <input
                    onChange={(event) => onTextChange("surname", event.target.value)}
                    placeholder="Surname"
                    value={textFilters.surname}
                />
            </label>

            <label className="applications-filter-field">
                <span>Email</span>
                <input
                    onChange={(event) => onTextChange("email", event.target.value)}
                    placeholder="Email"
                    value={textFilters.email}
                />
            </label>

            <label className="applications-filter-field">
                <span>Phone</span>
                <input
                    onChange={(event) => onTextChange("phone", event.target.value)}
                    placeholder="Phone"
                    value={textFilters.phone}
                />
            </label>

            <label className="applications-filter-field">
                <span>Age</span>
                <input
                    onChange={(event) => onTextChange("age", event.target.value)}
                    placeholder="Age"
                    value={textFilters.age}
                />
            </label>

            <label className="applications-filter-field">
                <span>Course</span>
                <select
                    onChange={(event) => onSelectChange("course", event.target.value)}
                    value={filters.course}
                >
                    <option value="">All courses</option>
                    {COURSE_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
            </label>

            <label className="applications-filter-field">
                <span>Format</span>
                <select
                    onChange={(event) => onSelectChange("course_format", event.target.value)}
                    value={filters.course_format}
                >
                    <option value="">All formats</option>
                    {COURSE_FORMAT_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
            </label>

            <label className="applications-filter-field">
                <span>Type</span>
                <select
                    onChange={(event) => onSelectChange("course_type", event.target.value)}
                    value={filters.course_type}
                >
                    <option value="">All types</option>
                    {COURSE_TYPE_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
            </label>

            <label className="applications-filter-field">
                <span>Status</span>
                <select
                    onChange={(event) => onSelectChange("status", event.target.value)}
                    value={filters.status}
                >
                    <option value="">All statuses</option>
                    {STATUS_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
            </label>

            <label className="applications-filter-field">
                <span>Group</span>
                <select
                    onChange={(event) => onSelectChange("group", event.target.value)}
                    value={filters.group}
                >
                    <option value="">All groups</option>
                    {groupOptions.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
            </label>

            <label className="applications-filter-field">
                <span>Start date</span>
                <input
                    onChange={(event) => onSelectChange("startDate", event.target.value)}
                    type="date"
                    value={filters.startDate}
                />
            </label>

            <label className="applications-filter-field">
                <span>End date</span>
                <input
                    onChange={(event) => onSelectChange("endDate", event.target.value)}
                    type="date"
                    value={filters.endDate}
                />
            </label>
        </div>

        <div className="applications-filter-actions">
            <label className="applications-filter-checkbox">
                <input
                    checked={filters.my}
                    onChange={(event) => onToggleMy(event.target.checked)}
                    type="checkbox"
                />
                <span>My</span>
            </label>

            <button
                aria-label="Reset filters"
                className="applications-filter-button applications-filter-button--icon"
                onClick={onReset}
                title="Reset filters"
                type="button"
            >
                <ResetIcon />
                <span className="sr-only">Reset filters</span>
            </button>

            <button
                aria-label={exportLoading ? "Exporting" : "Export XLSX"}
                className="applications-filter-button applications-filter-button--icon applications-filter-button--secondary"
                disabled={exportLoading}
                onClick={onExport}
                title={exportLoading ? "Exporting" : "Export XLSX"}
                type="button"
            >
                <ExportIcon />
                <span className="sr-only">
                    {exportLoading ? "Exporting..." : "Export XLSX"}
                </span>
            </button>
        </div>
    </div>
);
