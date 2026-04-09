import DashboardLayout from "../components/layout/DashboardLayout";
import { useEffect, useState } from "react";

export default function MTTR() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5001/api/bugs/resolution-times")
      .then((res) => res.json())
      .then((raw) => {
        const formatted = (raw || []).map((b: any) => ({
          id: b?.id ?? "",
          title: b?.title ?? "—",
          time: Number(b?.resolution_time_days ?? 0),
        }));
        setData(formatted);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // ✅ Average MTTR
  const avgMTTR =
    data.length === 0
      ? "—"
      : (
          data.reduce((sum, d) => sum + d.time, 0) / data.length
        ).toFixed(1);

  // 🔥 Slowest bug
  const slowestBug =
    data.length > 0
      ? data.reduce((prev, curr) =>
          curr.time > prev.time ? curr : prev
        )
      : null;

  const truncate = (text: string) => {
    if (!text) return "—";
    if (text.length < 60) return text;
    return text.slice(0, 55) + "...";
  };

  return (
    <DashboardLayout>
      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          MTTR (Mean Time to Resolution)
        </h2>
        <p className="text-white/50 text-sm mt-1">
          Measure how quickly issues are resolved
        </p>
      </div>

      {/* LOADING */}
      {loading && <p className="text-white/50 mt-4">Loading...</p>}

      {/* METRIC */}
      {!loading && (
        <div className="mt-6 p-6 rounded-xl border border-white/10 bg-white/5">
          <p className="text-xs text-white/50">
            Average Resolution Time
          </p>
          <h3 className="text-4xl font-semibold mt-2">
            {avgMTTR} <span className="text-lg text-white/60">days</span>
          </h3>
        </div>
      )}

      {/* 🔥 INSIGHT */}
      {!loading && slowestBug && (
        <div className="mt-4 p-5 rounded-xl border border-white/10 bg-white/5">
          <p className="text-xs text-white/50">Slowest Resolution</p>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-sm text-white/80">
              {truncate(slowestBug.title)}
            </p>
            <span className="text-yellow-400 font-semibold text-sm">
              {slowestBug.time} days
            </span>
          </div>
        </div>
      )}

      {/* TABLE */}
      <div className="mt-8 border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-white/40 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-3">Bug</th>
              <th className="text-left px-4 py-3">Resolution Time</th>
            </tr>
          </thead>

          <tbody>
            {!loading && data.length === 0 && (
              <tr>
                <td colSpan={2} className="text-center py-6 text-white/50">
                  No data available
                </td>
              </tr>
            )}

            {data.map((d) => (
              <tr
                key={d.id}
                className="border-t border-white/10 hover:bg-white/5 transition"
              >
                {/* BUG TITLE */}
                <td className="px-4 py-3 text-white/80">
                  {truncate(d.title)}
                </td>

                {/* TIME */}
                <td className="px-4 py-3 text-yellow-400 font-medium">
                  {d.time} days
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}