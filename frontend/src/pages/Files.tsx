import DashboardLayout from "../components/layout/DashboardLayout";
import { useEffect, useState } from "react";

export default function Files() {
  const [files, setFiles] = useState<any[]>([]);
  const [sortKey, setSortKey] = useState<"failures" | "changes">("failures");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5001/api/files/failure-prone")
      .then((res) => res.json())
      .then((raw) => {
        const formatted = raw.map((f: any) => ({
          file: f.path,
          failures: Number(f.failure_count),
          changes: Number(f.total_changes),
        }));
        setFiles(formatted);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const sortedFiles = [...files].sort((a, b) => {
    const valueA = a[sortKey];
    const valueB = b[sortKey];

    if (sortOrder === "asc") return valueA - valueB;
    return valueB - valueA;
  });

  return (
    <DashboardLayout>
      <h2 className="text-2xl font-semibold">Failure-Prone Files</h2>

      {/* LOADING STATE */}
      {loading && (
        <p className="text-white/50 mt-4">Loading...</p>
      )}

      <div className="mt-6 border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-white/60">
            <tr>
              <th className="text-left px-4 py-3">File</th>

              {/* FAILURES */}
              <th
                className="text-left px-4 py-3 cursor-pointer hover:text-white"
                onClick={() => {
                  if (sortKey === "failures") {
                    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
                  } else {
                    setSortKey("failures");
                    setSortOrder("desc");
                  }
                }}
              >
                Failures{" "}
                {sortKey === "failures" &&
                  (sortOrder === "asc" ? "↑" : "↓")}
              </th>

              {/* CHANGES */}
              <th
                className="text-left px-4 py-3 cursor-pointer hover:text-white"
                onClick={() => {
                  if (sortKey === "changes") {
                    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
                  } else {
                    setSortKey("changes");
                    setSortOrder("desc");
                  }
                }}
              >
                Change Count{" "}
                {sortKey === "changes" &&
                  (sortOrder === "asc" ? "↑" : "↓")}
              </th>
            </tr>
          </thead>

          <tbody>
            {/* EMPTY STATE */}
            {!loading && sortedFiles.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="text-center py-6 text-white/50"
                >
                  No data available
                </td>
              </tr>
            )}

            {sortedFiles.map((f) => (
              <tr
                key={f.file}
                className="border-t border-white/10 hover:bg-white/5"
              >
                <td className="px-4 py-3">{f.file}</td>

                <td className="px-4 py-3 text-red-400">
                  {f.failures > 10 ? "🔥 " : ""}
                  {f.failures}
                </td>

                <td className="px-4 py-3">{f.changes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}