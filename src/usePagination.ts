import { HistoryOptions, queryTypes, TransitionOptions, useQueryStates } from "next-query-state";

type UsePaginationResult = [
    { page: number; pageSize: number; limit: number; offset: number },
    (
        payload: { page?: number; pageSize?: number },
        options?: { history?: HistoryOptions } & TransitionOptions // TODO
    ) => void
];
export function usePagination({
    defaultPageSize = 20,
}: { defaultPageSize?: number } = {}) {
    const [states, setStates] = useQueryStates({
        page: queryTypes.integer.withDefault(1),
        pageSize: queryTypes.integer.withDefault(defaultPageSize),
    });

    return [
        {
            ...states,
            limit: states.pageSize,
            offset: states.pageSize * (states.page - 1),
        },
        setStates
    ] as UsePaginationResult;
}
