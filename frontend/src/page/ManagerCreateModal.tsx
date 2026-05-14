interface ManagerCreateModalProps {
    email: string;
    name: string;
    surname: string;
    submitting: boolean;
    onClose: () => void;
    onEmailChange: (value: string) => void;
    onNameChange: (value: string) => void;
    onSubmit: () => void;
    onSurnameChange: (value: string) => void;
}

export const ManagerCreateModal = ({
    email,
    name,
    surname,
    submitting,
    onClose,
    onEmailChange,
    onNameChange,
    onSubmit,
    onSurnameChange,
}: ManagerCreateModalProps) => (
    <div className="admin-modal-backdrop" onClick={onClose}>
        <div className="admin-modal" onClick={(event) => event.stopPropagation()}>
            <div className="admin-modal-grid">
                <label className="admin-field">
                    <span>Email</span>
                    <input
                        onChange={(event) => onEmailChange(event.target.value)}
                        placeholder="Email"
                        type="email"
                        value={email}
                    />
                </label>

                <label className="admin-field">
                    <span>Name</span>
                    <input
                        onChange={(event) => onNameChange(event.target.value)}
                        placeholder="Name"
                        value={name}
                    />
                </label>

                <label className="admin-field">
                    <span>Surname</span>
                    <input
                        onChange={(event) => onSurnameChange(event.target.value)}
                        placeholder="Surname"
                        value={surname}
                    />
                </label>
            </div>

            <div className="admin-modal-actions">
                <button
                    className="admin-submit-button admin-submit-button--secondary"
                    disabled={submitting}
                    onClick={onClose}
                    type="button"
                >
                    Cancel
                </button>

                <button
                    className="admin-submit-button"
                    disabled={submitting}
                    onClick={onSubmit}
                    type="button"
                >
                    {submitting ? "Creating..." : "Create"}
                </button>
            </div>
        </div>
    </div>
);
