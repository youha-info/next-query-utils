import { useQueryStates, UseQueryStatesKeyMap } from "next-query-state";

type FilterOperators = "=" | "!=" | "<" | ">" | "<=" | ">=";
type FilterExpression = [string, FilterOperators, any];

export type FilterDef<Map = any> = {
    queryTypes: UseQueryStatesKeyMap<Map>; // TODO
    transform: (state: { [Key in keyof Map]: Map[Key] }) => FilterExpression[] | [];
};

export function useFilter(filterDefs: FilterDef[]) {
    const [states] = useQueryStates(
        Object.fromEntries(filterDefs.flatMap((filter) => Object.entries(filter.queryTypes)))
    );
    const transforms = filterDefs.map((filterDef) => filterDef.transform);

    return transforms.flatMap((transform) => transform(states));
}
