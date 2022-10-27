import { queryTypes, Serializers, useQueryState } from "next-query-state";
import { useMemo } from "react";

export type SortType = `${"+" | "-"}${string}`;

const sortSerializer: (
    allowed: string[] | undefined,
    showPlus?: boolean
) => Serializers<SortType | null> = (allowed, showPlus = false) => ({
    parse: (v) => {
        const sort = (["+", "-"].includes((v as string)[0]) ? v : `+${v}`) as SortType;
        if (allowed && !allowed.includes(sort)) return null;
        return sort;
    },
    serialize: showPlus ? (v) => v : (v) => (v !== null && v[0] === "+" ? v.slice(1) : v),
});

type UseSortOptions = {
    defaultSort?: SortType[];
    allowed?: string[];
    /** Can `defaultSort` and `allowed` be changed after first render? Defaults to `false`.  */
    dynamic?: boolean;
    /** Show '+' in URL. Defaults to false, and '+' character is omitted in URL. */
    showPlus?: boolean;
} & Parameters<typeof useQueryState>[2];

export function useSort({ defaultSort = [], allowed, showPlus, ...options }: UseSortOptions = {}) {
    const serializer = useMemo(
        () =>
            queryTypes
                .delimitedArray(
                    sortSerializer(allowed && generateAvailableSort(allowed), showPlus),
                    "_"
                )
                .withDefault(defaultSort),
        options.dynamic ? [allowed?.join(), defaultSort.join()] : [null, null]
    );

    return useQueryState("sort", serializer, options);
}

function generateAvailableSort(allowed: string[]) {
    const res = [];
    for (const field of allowed)
        if (field[0] === "+" || field[0] === "-") res.push(field);
        else res.push(`+${field}`, `-${field}`);
    return res;
}
