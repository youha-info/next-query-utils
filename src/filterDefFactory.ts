import { queryTypes, Serializers } from "next-query-state";
import { FilterDef } from "./useFilter";

/*
filterTypes.string.equal()
filterTypes.enum("a","b","c").in()
filterTypes.number.range()
*/

type FilterTypeParams = { queryType: Serializers<any> };

interface FilterGenerator {
    generate(key: string): FilterDef;
}

type BehaviorSelector = Readonly<{
    equal(): FilterTypeParams & FilterGenerator;
    in(): FilterTypeParams & FilterGenerator;
    range(options?: RangeOptions): FilterTypeParams & FilterGenerator;
}>;

type RangeOptions = {
    excludeNull?: boolean;
};

const selectBehavior: BehaviorSelector = {
    equal() {
        return {
            ...this,
            generate(key: string) {
                const { queryType } = this as FilterTypeParams;
                return {
                    queryTypes: { [key]: queryType },
                    transform: (states: any) => (states[key] !== undefined ? [[key, "=", states[key]]] : []),
                };
            },
        } as unknown as FilterTypeParams & FilterGenerator;
    },
    in() {
        return {
            ...this,
            generate(key: string) {
                const { queryType } = this as FilterTypeParams;
                return {
                    queryTypes: { [key]: queryTypes.array(queryType) },
                    transform: (states: any) => (states[key] !== undefined ? [[key, "=", states[key]]] : []),
                };
            },
        } as unknown as FilterTypeParams & FilterGenerator;
    },
    range({ excludeNull = false } = {}) {
        return {
            ...this,
            generate(key: string) {
                const { queryType } = this as FilterTypeParams;
                return {
                    queryTypes: { [key + "Max"]: queryType, [key + "Min"]: queryType },
                    transform: (states: any) => {
                        const result = [];
                        const max = states[key + "Max"];
                        const min = states[key + "Min"];
                        if (max !== undefined) result.push([key, "<=", max]);
                        if (min !== undefined) result.push([key, ">=", min]);
                        if (excludeNull && (min != undefined || max != undefined)) result.push([key, "!=", null]);
                        return result;
                    },
                };
            },
        } as unknown as FilterTypeParams & FilterGenerator;
    },
};

type FilterTypeSelector = Readonly<
    {
        [Key in "string" | "float" | "integer" | "boolean"]: BehaviorSelector;
    } & {
        enum: (values: string[]) => BehaviorSelector;
    }
>;

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
} as FilterTypeSelector;

export function filterDefFactory(filterParams: Record<string, FilterGenerator>): FilterDef[] {
    return Object.entries(filterParams).map(([key, generator]) => {
        return generator.generate(key);
    });
}
