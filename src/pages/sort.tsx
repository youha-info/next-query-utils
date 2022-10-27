import { SortType, useSort } from "src/useSort";

export default function SortTest() {
    const [sort, setSort] = useSort({
        defaultSort: ["+fieldA"],
        allowed: ["fieldB", "+fieldA"],
        history: "push",
        showPlus: true,
    });

    console.log(sort);

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
}
