import { queryTypes, Serializers, useQueryState } from "next-query-state";

// TODO
export function firstParam(v: string | string[]): string;
export function firstParam(v: string | string[] | undefined): string | undefined;
export function firstParam(v: string | string[] | undefined): string | undefined {
    return Array.isArray(v) ? v[0] : v;
}

// TODO: validation 통해 맞는것만 가야 할지, +는 인코딩되니 url에서는 뺄지 등등

export type SortType = `${"+" | "-"}${string}`;

const sortSerealizer: Serializers<SortType | null> = {
    parse: (v) => {
        const str = firstParam(v);
        return ["+", "-"].includes(str?.charAt(0) ?? "") ? (str as SortType) : null;
    },
    serialize: (v) => `${v}`,
};

type UseSortOptions = {
    defaultSort?: SortType[];
} & Parameters<typeof useQueryState>[2];

export function useSort({ defaultSort = [], ...options }: UseSortOptions = {}) {
    return useQueryState(
        "sort",
        queryTypes.array(sortSerealizer).withDefault(defaultSort),
        options
    );
}
