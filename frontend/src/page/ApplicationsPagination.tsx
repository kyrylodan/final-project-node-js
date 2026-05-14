import type { ApplicationPaginationItem } from "../models/IApplicationPage.ts";

interface ApplicationsPaginationProps {
    currentPage: number;
    totalPages: number;
    paginationItems: ApplicationPaginationItem[];
    onChangePage: (page: number) => void;
}

/// Компонент пагінації для сторінки заявок.
export const ApplicationsPagination = ({
    currentPage,
    totalPages,
    paginationItems,
    onChangePage,
}: ApplicationsPaginationProps) => {
    if (totalPages <= 1) {
        return null;
    }

    return (
        <div className="pagination">
            {currentPage > 1 && (
                <button
                    className="pagination-button pagination-button--nav"
                    onClick={() => onChangePage(currentPage - 1)}
                    type="button"
                >
                    {"<"}
                </button>
            )}

            {paginationItems.map((item, index) => {
                if (typeof item !== "number") {
                    return (
                        <span
                            key={`${item}-${index}`}
                            className="pagination-button pagination-button--dots"
                        >
                            ...
                        </span>
                    );
                }

                return (
                    <button
                        key={item}
                        className={`pagination-button ${item === currentPage ? "pagination-button--active" : ""}`}
                        onClick={() => onChangePage(item)}
                        type="button"
                    >
                        {item}
                    </button>
                );
            })}

            {currentPage < totalPages && (
                <button
                    className="pagination-button pagination-button--nav"
                    onClick={() => onChangePage(currentPage + 1)}
                    type="button"
                >
                    {">"}
                </button>
            )}
        </div>
    );
};
