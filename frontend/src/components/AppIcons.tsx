interface IconProps {
    className?: string;
}

export const AdminIcon = ({ className = "app-icon" }: IconProps) => (
    <svg
        aria-hidden="true"
        className={className}
        fill="none"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d="M16 11C17.933 11 19.5 9.433 19.5 7.5C19.5 5.567 17.933 4 16 4C14.067 4 12.5 5.567 12.5 7.5C12.5 9.433 14.067 11 16 11Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
        />
        <path
            d="M8 12C9.933 12 11.5 10.433 11.5 8.5C11.5 6.567 9.933 5 8 5C6.067 5 4.5 6.567 4.5 8.5C4.5 10.433 6.067 12 8 12Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
        />
        <path
            d="M3.5 18.5C3.5 16.29 5.29 14.5 7.5 14.5H8.5C10.71 14.5 12.5 16.29 12.5 18.5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
        />
        <path
            d="M11.5 18.5C11.5 16.567 13.067 15 15 15H17C18.933 15 20.5 16.567 20.5 18.5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
        />
    </svg>
);

export const LogoutIcon = ({ className = "app-icon" }: IconProps) => (
    <svg
        aria-hidden="true"
        className={className}
        fill="none"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d="M9 4.75H7.75C6.50736 4.75 5.5 5.75736 5.5 7V17C5.5 18.2426 6.50736 19.25 7.75 19.25H9"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
        />
        <path
            d="M13 8L18 12L13 16"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
        />
        <path
            d="M10 12H18"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
        />
    </svg>
);

export const ResetIcon = ({ className = "app-icon" }: IconProps) => (
    <svg
        aria-hidden="true"
        className={className}
        fill="none"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d="M20 11.5C20 15.9183 16.4183 19.5 12 19.5C7.58172 19.5 4 15.9183 4 11.5C4 7.08172 7.58172 3.5 12 3.5C14.6114 3.5 16.9304 4.75187 18.3906 6.6875"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
        />
        <path
            d="M18.5 3.75V7.75H14.5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
        />
    </svg>
);

export const ExportIcon = ({ className = "app-icon" }: IconProps) => (
    <svg
        aria-hidden="true"
        className={className}
        fill="none"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d="M8 3.75H14.5L19 8.25V18C19 19.2426 17.9926 20.25 16.75 20.25H8C6.75736 20.25 5.75 19.2426 5.75 18V6C5.75 4.75736 6.75736 3.75 8 3.75Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
        />
        <path
            d="M14 3.75V8.5H18.75"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
        />
        <path
            d="M12.25 10V16"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
        />
        <path
            d="M9.75 13.5L12.25 16L14.75 13.5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
        />
    </svg>
);
