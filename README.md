# @youha-info/next-query-utils

Youha specific utilities for using [next-query-state](https://github.com/youha-info/next-query-state) to persist page's current state in the URL.

Contains code specific for Youha's API (`useFilter`).

## Installation

```sh
$ yarn add @youha-info/next-query-utils next-query-state
or
$ npm install @youha-info/next-query-utils next-query-state
```

## Documentation

## `usePagination`

Utility hook for pagination state control.

-   Save state in the URL as `"page"` and `"pageSize"` query parameters.
-   `page` and `pageSize` converted into `limit` and `offset` for easier API calls.
-   `page` and `pageSize` can be updated via `setPagination`.
-   Using `changePageSize` to update `pageSize` automatically changes `page` so that the first item remains visible on the screen.

```jsx
const [{ page, pageSize, limit, offset }, setPagination, changePageSize] = usePagination({
    defaultPageSize: 20,
});

const onPageChange = (e) => {
    setPagination({ page: parseInt(e.currentTarget.value) }, { history: "push" });
};

const onPageSizeChange = (e) => {
    changePageSize(parseInt(e.currentTarget.value));
};

return (
    <div>
        <div>
            page: <input value={page} onChange={onPageChange} />
        </div>
        <div>
            page size:
            <select value={pageSize} onChange={onPageSizeChange}>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
            </select>
        </div>
    </div>
);
```

## `useSort`

Utility hook for sort state control.

-   Returned value always starts with '+' or '-'.
-   Allowed values can be set with `allowed` parameter. '+' or '-' prefix only allows that sort direction, and no prefix allows both '+' and '-'.
-   `showPlus` option is for showing '+' in the URL or not. No prefix implies ascending order. Default is false because '+' gets percent encoded and makes URL look dirty in current implementation.
-   By default, `defaultSort` and `allowed` must not be changed. Set `dynamic` option to `true` to change those.

```jsx
const [sort, setSort] = useSort({
    defaultSort: ["+fieldA"],
    allowed: ["fieldB", "+fieldA"],
    history: "push",
    showPlus: true,
});

return (
    <div>
        {["+a", "-a", "+b", "-b"].map((field) => (
            <button key={field} onClick={() => setSort((p) => [...p, field as SortType])}>
                {field}
            </button>
        ))}
        {sort.map((v, i) => (
            <div key={i}>{v}</div>
        ))}
    </div>
);
```

## `useFilter`

Utility hook for constructing filter expression by reading from URL state.

-   Filter expression is a list of 3-tuple made up of field name, filter operator, and filter value.
    -   For example, `?rangeMin=12345&rangeMax=6431&search=foo&category=a&category=b` becomes:
        ```
        [["search","=","foo"],
         ["range","<=",6431],
         ["range",">=",12345],
         ["category","=",["a","b"]]]
        ```
-   `useFilter` takes a list of `FilterDef`, which is made up of Map of `Serializers<T>`, and a `transform` function that takes the parsed state object and creates a list of filter expression which will be concatenated.
-   `useFilter` returns the concatenated filter expression list.
-   `FilterDef` can be manually created, but a preset factory utility `filterDefFactory` and `filterTypes` is provided for convenience.

### Preset

Since `useFilter` takes a list of `FilterDef` instead of a map, a function to make map into list is needed, which is `filterDefFactory`.

When using preset and custom created `FilterDef` together, spread the return value of `filterDefFactory` like below.

```js
useFilter([
    ...filterDefFactory({
        search: filterTypes.nullable.string.equal(),
        range: filterTypes.integer.range(),
        category: filterTypes.enum(["a", "b", "c"]).in(),
    }),
    // Custom FilterDef
    {
        queryType: ...,
        transformer: ()=>{}
    }
])
```

`filterDefFactory` takes a map of `FilterGenerator`. its Key is the name of the field, and value is `FilterGenerator`. `FilterGenerator` can be easily constructed from `filterTypes`.

To use `filterTypes`, select the data type of the field, then select which kind of filter (equal, range, in) it is.

There are 5 types available, `string`, `float`, `integer`, `boolean`, `enum`.
You can also have `null` as a value like this: `filterTypes.nullable.string`, which the null value is represented in the URL as `%00`.

<br/>

Then, select which kind of filter is enabled.

`"equal"` only allows 1 value, which will result to filter expression like this: `[[field, "=", value]]`

`"range"` will read from 2 query params with postfix `"Min"` and `"Max"` (for example `?fieldMin=10&fieldMax=20`), and will result to filter expression like this: `[[field, ">=". fieldMin], [field, "<=", fieldMax]]`.
It includes the filter expression only if it's in the query string.

-   There is a boolean `excludeNull` option that adds `[field, "!=", null]` filter expression when min or max filter exists.

`"in"` allows many values, and will result to filter expression like this: `[[field, "=", values]]`

-   `delimiter` option can be used to set which delimiter should be used to separate multiple values in the URL.
    Default is `undefined` which doesn't use delimiter and uses duplicate query keys to express list of values. (`?field=a&field=b`)

<br/>

### Example: Read filter state in URL with `useFilter` to show filtered results

```jsx
function FilterResults() {
    const filters = useFilter(
        filterDefFactory({
            search: filterTypes.nullable.string.equal(),
            range: filterTypes.integer.range(),
            category: filterTypes.enum(["a", "b", "c"]).in(),
        })
    );

    // Send filters as API request to server and show its response.
    const data = getDataFromServer(filters)

    return (
        <div>
            {data.map((d)=><DataPresenter data={d}>)}
        </div>
    );
}
```

### Example: Control filter state with `useQueryState`

```jsx
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
```
