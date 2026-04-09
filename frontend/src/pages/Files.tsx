import DashboardLayout from "../components/layout/DashboardLayout";
import { useEffect, useState } from "react";
import { useFilter } from "../context/FilterContext";

export default function Files() {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { developer } = useFilter();

  useEffect(() => {
    fetch("http://localhost:5001/api/files/failure-prone")
      .then((res) => res.json())
      .then((raw) => {
        const formatted = raw.map((f: any) => ({
          file: f.path,
          failures: Number(f.failure_count),
          changes: Number(f.total_changes),
          developer: f.developer || null,
        }));
        setFiles(formatted);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filteredFiles = developer
  ? files.filter((f) => {
      if (!f.developer) return false;

      return (
        f.developer.toLowerCase().trim() ===
        developer.toLowerCase().trim()
      );
    })
  : files;
  // 🔹 simple top file (no sorting UI, just internal)
  const topFile =
    filteredFiles.length > 0
      ? filteredFiles.reduce((prev, curr) =>
          curr.failures > prev.failures ? curr : prev
        )
      : null;

  const truncate = (path: string) => {
    if (path.length < 50) return path;
    return "..." + path.slice(-45);
  };

  return (
    <DashboardLayout>
      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Failure-Prone Files
        </h2>
        <p className="text-white/50 text-sm mt-1">
          Files contributing most to system instability
        </p>
      </div>

      {/* INSIGHT */}
      {!loading && topFile && (
        <div className="mt-6 p-5 rounded-xl border border-white/10 bg-white/5">
          <p className="text-xs text-white/50">Highest Failure Impact</p>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-sm font-medium text-white/80">
              {truncate(topFile.file)}
            </p>
            <span className="text-sm font-semibold text-white">
              {topFile.failures}
            </span>
          </div>
        </div>
      )}

      {/* TABLE */}
      <div className="mt-6 border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-white/40 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-3">File</th>
              <th className="text-left px-4 py-3">Failures</th>
              <th className="text-left px-4 py-3">Changes</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={3} className="text-center py-6 text-white/50">
                  Loading...
                </td>
              </tr>
            )}

            {!loading && filteredFiles.length === 0 && (
              <tr>
                <td colSpan={3} className="text-center py-6 text-white/50">
                  No data available
                </td>
              </tr>
            )}

            {filteredFiles.map((f) => (
              <tr
                key={f.file}
                className="border-t border-white/10 hover:bg-white/5 transition"
              >
                {/* FILE */}
                <td className="px-4 py-3 font-mono text-xs text-white/80">
                  {truncate(f.file)}
                </td>

                {/* FAILURES */}
                <td className="px-4 py-3 text-white font-medium">
                  {f.failures}
                </td>

                {/* CHANGES */}
                <td className="px-4 py-3 text-white/70">
                  {f.changes}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}