import { HistoryOptions, queryTypes, UpdateOptions, useQueryStates } from "next-query-state";
import { getNewPageNumberOnPageSizeChange } from "./helpers";

export function usePagination({
    defaultPageSize = 20,
    history,
}: { defaultPageSize?: number; history?: HistoryOptions } = {}) {
    const [pagination, setPagination] = useQueryStates(
        {
            page: queryTypes.integer.withDefault(1),
            pageSize: queryTypes.integer.withDefault(defaultPageSize),
        },
        { history }
    );

    const changePageSize = (newPageSize: number, options?: UpdateOptions) =>
        setPagination(
            {
                page: getNewPageNumberOnPageSizeChange(
                    pagination.page,
                    pagination.pageSize,
                    newPageSize
                ),
                pageSize: newPageSize,
            },
            options
        );

    return [
        {
            ...pagination,
            limit: pagination.pageSize,
            offset: pagination.pageSize * (pagination.page - 1),
        } as { page: number; pageSize: number; limit: number; offset: number },
        setPagination,
        changePageSize,
    ] as const;
}
