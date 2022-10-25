import { HistoryOptions, queryTypes, UpdateOptions, useQueryStates } from "next-query-state";

type UsePaginationResult = [
    { page: number; pageSize: number; limit: number; offset: number },
    (payload: { page?: number; pageSize?: number }, options?: UpdateOptions) => void
];
export function usePagination({
    defaultPageSize = 20,
    history,
}: { defaultPageSize?: number; history?: HistoryOptions } = {}) {
    const [states, setStates] = useQueryStates(
        {
            page: queryTypes.integer.withDefault(1),
            pageSize: queryTypes.integer.withDefault(defaultPageSize),
        },
        { history }
    );

    return [
        {
            ...states,
            limit: states.pageSize,
            offset: states.pageSize * (states.page - 1),
        },
        setStates,
    ] as UsePaginationResult;
}
