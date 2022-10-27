import { useQueryState, queryTypes } from "next-query-state";
import { nullableQueryTypes } from "next-query-state/nullableQueryTypes";
import { filterDefFactory, filterTypes } from "src/filterDefFactory";
import { useFilter } from "src/useFilter";

export default function FilterTest() {
    return (
        <>
            <FilterPanel />
            <FilterResults />
        </>
    );
}

export function FilterResults() {
    const filters = useFilter(
        filterDefFactory({
            search: filterTypes.nullable.string.equal(),
            range: filterTypes.integer.range(),
            category: filterTypes.enum(["a", "b", "c"]).in(),
        })
    );

    return (
        <div>
            <div>current filters:</div>
            {filters.map((filter, i) => (
                <div key={i}>{JSON.stringify(filter)}</div>
            ))}
        </div>
    );
}

const s = nullableQueryTypes.stringEnum(["a", "b", "c"]);

function FilterPanel() {
    const [search, setSearch] = useQueryState("search", queryTypes.string);
    const [rangeMin, setRangeMin] = useQueryState("rangeMin", queryTypes.integer);
    const [rangeMax, setrangeMax] = useQueryState("rangeMax", queryTypes.integer);
    const [categories, setCategories] = useQueryState(
        "category",
        queryTypes.array(queryTypes.stringEnum(["a", "b", "c"])).withDefault([])
    );

    return (
        <div>
            <div>
                search:
                <input
                    value={search ?? ""}
                    onChange={(e) => setSearch(e.currentTarget.value || null)}
                />
            </div>
            <div>
                range:
                <input
                    value={rangeMin ?? ""}
                    onChange={(e) => setRangeMin(parseIntOrNull(e.currentTarget.value))}
                />
                <input
                    value={rangeMax ?? ""}
                    onChange={(e) => setrangeMax(parseIntOrNull(e.currentTarget.value))}
                />
            </div>
            <div>
                categories:
                {["a", "b", "c"].map((v) => (
                    <span key={v}>
                        <input
                            type="checkbox"
                            id={v}
                            checked={categories.includes(v)}
                            onChange={(e) =>
                                e.currentTarget.checked
                                    ? setCategories([...categories, v])
                                    : setCategories(categories.filter((c) => c !== v))
                            }
                        />
                        <label htmlFor={v}>{v}</label>
                    </span>
                ))}
            </div>
        </div>
    );
}

function parseIntOrNull(s: string) {
    const int = parseInt(s);
    return isNaN(int) ? null : int;
}
