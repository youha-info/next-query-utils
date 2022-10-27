import { ChangeEventHandler } from "react";
import { usePagination } from "src/usePagination";

const getPageData = ({ limit, offset }: { limit: number; offset: number }) => {
    const res = [];
    for (let i = 0; i < limit; i++) res.push(offset + i);
    return res;
};

export default function PaginationTest() {
    const [{page, pageSize, limit, offset}, setPagination, changePageSize] = usePagination({ defaultPageSize: 20 });

    const pageData = getPageData({ limit, offset});

    const onPageChange: ChangeEventHandler<HTMLInputElement> = (e) => {
        const page = parseInt(e.currentTarget.value);
        if (!isNaN(page)) setPagination({ page }, { history: "push" });
    };

    const onPageSizeChange: ChangeEventHandler<HTMLSelectElement> = (e) => {
        const newPageSize = parseInt(e.currentTarget.value);
        changePageSize(newPageSize);
    };

    return (
        <div>
            <div>
                {pageData.map((v) => (
                    <span>{v} </span>
                ))}
            </div>
            <div>
                page: <input value={page} onChange={onPageChange} />
            </div>
            <div>
                page size:{" "}
                <select value={pageSize} onChange={onPageSizeChange}>
                    <option value="20">20</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                </select>
            </div>
        </div>
    );
}
