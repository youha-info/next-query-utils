import { queryTypes, Serializers } from "next-query-state";
import { nullableQueryTypes } from "next-query-state/nullableQueryTypes";
import { FilterDef } from "./useFilter";

/*
filterTypes.string.equal()
filterTypes.enum("a","b","c").in()
filterTypes.number.range()
*/

type FilterTypeParams = { queryType: Serializers<any>; nullable?: boolean };

interface FilterGenerator {
    generate(key: string): FilterDef;
}

type BehaviorSelector = Readonly<{
    equal(): FilterTypeParams & FilterGenerator;
    in(options?: InOptions): FilterTypeParams & FilterGenerator;
    range(options?: RangeOptions): FilterTypeParams & FilterGenerator;
}>;

type InOptions = {
    delimiter?: string;
};
type RangeOptions = {
    excludeNull?: boolean;
};

const selectBehavior: BehaviorSelector = {
    equal() {
        return {
            ...this,
            generate(key: string) {
                const { queryType, nullable } = this as FilterTypeParams;
                return {
                    queryTypes: { [key]: queryType },
                    transform: (states: any) =>
                        states[key] !== (nullable ? undefined : null)
                            ? [[key, "=", states[key]]]
                            : [],
                };
            },
        } as unknown as FilterTypeParams & FilterGenerator;
    },
    in({ delimiter } = {}) {
        return {
            ...this,
            generate(key: string) {
                const { queryType, nullable } = this as FilterTypeParams;
                const qTypes = nullable ? nullableQueryTypes : queryTypes;
                return {
                    queryTypes: {
                        [key]: delimiter
                            ? qTypes.delimitedArray(queryType, delimiter)
                            : qTypes.array(queryType),
                    },
                    transform: (states: any) =>
                        states[key] !== (nullable ? undefined : null)
                            ? [[key, "=", states[key]]]
                            : [],
                };
            },
        } as unknown as FilterTypeParams & FilterGenerator;
    },
    range({ excludeNull = false } = {}) {
        return {
            ...this,
            generate(key: string) {
                const { queryType, nullable } = this as FilterTypeParams;
                return {
                    queryTypes: { [key + "Max"]: queryType, [key + "Min"]: queryType },
                    transform: (states: any) => {
                        const result = [];
                        const max = states[key + "Max"];
                        const min = states[key + "Min"];
                        const nonValue = nullable ? undefined : null;
                        if (max !== nonValue) result.push([key, "<=", max]);
                        if (min !== nonValue) result.push([key, ">=", min]);
                        if (excludeNull && (min != null || max != null))
                            result.push([key, "!=", null]);
                        return result;
                    },
                };
            },
        } as unknown as FilterTypeParams & FilterGenerator;
    },
};

type FilterTypeSelectorBase = Readonly<
    {
        [Key in "string" | "float" | "integer" | "boolean"]: BehaviorSelector;
    } & {
        enum: (values: string[]) => BehaviorSelector;
    }
>;

type FilterTypeSelector = FilterTypeSelectorBase & { nullable: FilterTypeSelectorBase };

export const filterTypes = {
    string: {
        queryType: queryTypes.string,
        ...selectBehavior,
    },
    float: {
        queryType: queryTypes.float,
        ...selectBehavior,
    },
    integer: {
        queryType: queryTypes.integer,
        ...selectBehavior,
    },
    boolean: {
        queryType: queryTypes.boolean,
        ...selectBehavior,
    },
    enum(values: string[]) {
        return {
            queryType: queryTypes.stringEnum(values),
            ...selectBehavior,
        };
    },
    nullable: {
        string: {
            queryType: nullableQueryTypes.string,
            nullable: true,
            ...selectBehavior,
        },
        float: {
            queryType: nullableQueryTypes.float,
            nullable: true,
            ...selectBehavior,
        },
        integer: {
            queryType: nullableQueryTypes.integer,
            nullable: true,
            ...selectBehavior,
        },
        boolean: {
            queryType: nullableQueryTypes.boolean,
            nullable: true,
            ...selectBehavior,
        },
        enum(values: string[]) {
            return {
                queryType: nullableQueryTypes.stringEnum(values),
                nullable: true,
                ...selectBehavior,
            };
        },
    },
} as FilterTypeSelector;

export function filterDefFactory(filterParams: Record<string, FilterGenerator>): FilterDef[] {
    return Object.entries(filterParams).map(([key, generator]) => {
        return generator.generate(key);
    });
}
