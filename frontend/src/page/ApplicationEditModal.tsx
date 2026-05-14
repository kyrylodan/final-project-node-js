import type {
    IApplicationEditForm,
    IApplicationFormErrors,
} from "../models/IApplicationPage.ts";
import {
    COURSE_FORMAT_OPTIONS,
    COURSE_OPTIONS,
    COURSE_TYPE_OPTIONS,
    STATUS_OPTIONS,
} from "../utils/applicationOptions.ts";

interface ApplicationEditModalProps {
    editForm: IApplicationEditForm;
    editSubmitting: boolean;
    formErrors: IApplicationFormErrors;
    groupOptions: string[];
    newGroupName: string;
    onAddGroup: () => void;
    onClose: () => void;
    onInputChange: (field: keyof IApplicationEditForm, value: string) => void;
    onNewGroupNameChange: (value: string) => void;
    onSelectGroup: () => void;
    onSubmit: () => void;
}

export const ApplicationEditModal = ({
    editForm,
    editSubmitting,
    formErrors,
    groupOptions,
    newGroupName,
    onAddGroup,
    onClose,
    onInputChange,
    onNewGroupNameChange,
    onSelectGroup,
    onSubmit,
}: ApplicationEditModalProps) => (
    <div className="application-modal-backdrop" onClick={onClose}>
        <div className="application-modal" onClick={(event) => event.stopPropagation()}>
            <div className="application-modal-grid">
                <div className="application-modal-field">
                    <span>Group</span>
                    <div className="application-group-add">
                        <input
                            list="application-groups"
                            onChange={(event) => onNewGroupNameChange(event.target.value)}
                            placeholder="Group"
                            value={newGroupName}
                        />
                        <datalist id="application-groups">
                            {groupOptions.map((group) => (
                                <option key={group} value={group} />
                            ))}
                        </datalist>
                        <button onClick={onAddGroup} type="button">
                            Add
                        </button>
                        <button onClick={onSelectGroup} type="button">
                            Select
                        </button>
                    </div>
                    {formErrors.newGroup && (
                        <span className="application-field-error">{formErrors.newGroup}</span>
                    )}
                </div>

                <label className="application-modal-field">
                    <span>Status</span>
                    <select
                        onChange={(event) => onInputChange("status", event.target.value)}
                        value={editForm.status}
                    >
                        <option value="">Select status</option>
                        {STATUS_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                    {formErrors.status && (
                        <span className="application-field-error">{formErrors.status}</span>
                    )}
                </label>

                <label className="application-modal-field">
                    <span>Name</span>
                    <input
                        onChange={(event) => onInputChange("name", event.target.value)}
                        value={editForm.name}
                    />
                </label>

                <label className="application-modal-field">
                    <span>Sum</span>
                    <input
                        onChange={(event) => onInputChange("sum", event.target.value)}
                        value={editForm.sum}
                    />
                    {formErrors.sum && (
                        <span className="application-field-error">{formErrors.sum}</span>
                    )}
                </label>

                <label className="application-modal-field">
                    <span>Surname</span>
                    <input
                        onChange={(event) => onInputChange("surname", event.target.value)}
                        value={editForm.surname}
                    />
                </label>

                <label className="application-modal-field">
                    <span>Already paid</span>
                    <input
                        onChange={(event) => onInputChange("alreadyPaid", event.target.value)}
                        value={editForm.alreadyPaid}
                    />
                    {formErrors.alreadyPaid && (
                        <span className="application-field-error">{formErrors.alreadyPaid}</span>
                    )}
                </label>

                <label className="application-modal-field">
                    <span>Email</span>
                    <input
                        onChange={(event) => onInputChange("email", event.target.value)}
                        value={editForm.email}
                    />
                    {formErrors.email && (
                        <span className="application-field-error">{formErrors.email}</span>
                    )}
                </label>

                <label className="application-modal-field">
                    <span>Course</span>
                    <select
                        onChange={(event) => onInputChange("course", event.target.value)}
                        value={editForm.course}
                    >
                        <option value="">Select course</option>
                        {COURSE_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                    {formErrors.course && (
                        <span className="application-field-error">{formErrors.course}</span>
                    )}
                </label>

                <label className="application-modal-field">
                    <span>Phone</span>
                    <input
                        onChange={(event) => onInputChange("phone", event.target.value)}
                        value={editForm.phone}
                    />
                    {formErrors.phone && (
                        <span className="application-field-error">{formErrors.phone}</span>
                    )}
                </label>

                <label className="application-modal-field">
                    <span>Course format</span>
                    <select
                        onChange={(event) => onInputChange("course_format", event.target.value)}
                        value={editForm.course_format}
                    >
                        <option value="">Select format</option>
                        {COURSE_FORMAT_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                    {formErrors.course_format && (
                        <span className="application-field-error">{formErrors.course_format}</span>
                    )}
                </label>

                <label className="application-modal-field">
                    <span>Age</span>
                    <input
                        onChange={(event) => onInputChange("age", event.target.value)}
                        value={editForm.age}
                    />
                    {formErrors.age && (
                        <span className="application-field-error">{formErrors.age}</span>
                    )}
                </label>

                <label className="application-modal-field">
                    <span>Course type</span>
                    <select
                        onChange={(event) => onInputChange("course_type", event.target.value)}
                        value={editForm.course_type}
                    >
                        <option value="">Select type</option>
                        {COURSE_TYPE_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                    {formErrors.course_type && (
                        <span className="application-field-error">{formErrors.course_type}</span>
                    )}
                </label>
            </div>

            <div className="application-modal-actions">
                <button
                    className="application-modal-button application-modal-button--secondary"
                    disabled={editSubmitting}
                    onClick={onClose}
                    type="button"
                >
                    Close
                </button>
                <button
                    className="application-modal-button"
                    disabled={editSubmitting}
                    onClick={onSubmit}
                    type="button"
                >
                    {editSubmitting ? "..." : "Submit"}
                </button>
            </div>
        </div>
    </div>
);
