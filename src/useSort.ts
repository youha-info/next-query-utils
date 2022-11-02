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
    /** Can options be changed after first render? Defaults to `false`.  */
    dynamic?: boolean;
    /** Show '+' in URL. Defaults to false, and '+' character is omitted in URL. */
    showPlus?: boolean;
    /** Delimiter to use for multiple sort items */
    delimiter?: string | null;
} & Parameters<typeof useQueryState>[2];

export function useSort({
    defaultSort = [],
    allowed,
    showPlus,
    delimiter = "_",
    ...options
}: UseSortOptions = {}) {
    const serializer = useMemo(
        () =>
            delimiter
                ? queryTypes
                      .delimitedArray(
                          sortSerializer(allowed && generateAvailableSort(allowed), showPlus),
                          delimiter
                      )
                      .withDefault(defaultSort)
                : queryTypes
                      .array(sortSerializer(allowed && generateAvailableSort(allowed), showPlus))
                      .withDefault(defaultSort),
        options.dynamic
            ? [allowed?.join(), defaultSort.join(), showPlus, delimiter]
            : [null, null, showPlus, delimiter]
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
