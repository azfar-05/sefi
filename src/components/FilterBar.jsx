import { useFilters } from "../context/FilterContext";

export default function FilterBar({
  developerOptions = [],
  fileOptions = [],
}) {
  const { filters, setFilters } = useFilters();

  const updateFilters = (partial) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  };

  return (
    <div className="flex flex-wrap items-end gap-4 mb-6">
      <div className="flex flex-col">
        <label className="text-sm text-gray-300 mb-1">Start date</label>
        <input
          className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm"
          type="date"
          value={filters.startDate ?? ""}
          onChange={(e) =>
            updateFilters({ startDate: e.target.value ? e.target.value : null })
          }
        />
      </div>

      <div className="flex flex-col">
        <label className="text-sm text-gray-300 mb-1">End date</label>
        <input
          className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm"
          type="date"
          value={filters.endDate ?? ""}
          onChange={(e) =>
            updateFilters({ endDate: e.target.value ? e.target.value : null })
          }
        />
      </div>

      <div className="flex flex-col">
        <label className="text-sm text-gray-300 mb-1">Developer</label>
        <select
          className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm"
          value={filters.developer ?? "all"}
          onChange={(e) => {
            const next = e.target.value === "all" ? null : e.target.value;
            updateFilters({ developer: next });
          }}
        >
          <option value="all">All developers</option>
          {developerOptions.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col">
        <label className="text-sm text-gray-300 mb-1">File</label>
        <select
          className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm"
          value={filters.file ?? "all"}
          onChange={(e) => {
            const next = e.target.value === "all" ? null : e.target.value;
            updateFilters({ file: next });
          }}
        >
          <option value="all">All files</option>
          {fileOptions.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}