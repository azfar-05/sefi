import DashboardLayout from "../components/layout/DashboardLayout";
import { useEffect, useState } from "react";

export default function Tests() {
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5001/api/tests/flaky")
      .then((res) => res.json())
      .then((raw) => {
        const formatted = raw.map((t: any) => {
          const passed = Number(t.passed_count);
          const failed = Number(t.failed_count);

          return {
            name: t.name,
            runs: passed + failed,
            failures: failed,
            flakiness: Number(t.failure_rate_percentage),
          };
        });

        setTests(formatted);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // 🔥 TOP INSIGHT (most flaky test)
  const worstTest =
    tests.length > 0
      ? tests.reduce((prev, curr) =>
          curr.flakiness > prev.flakiness ? curr : prev
        )
      : null;

  const truncate = (name: string) => {
    if (name.length < 60) return name;
    return name.slice(0, 55) + "...";
  };

  return (
    <DashboardLayout>
      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Flaky Tests
        </h2>
        <p className="text-white/50 text-sm mt-1">
          Identify unstable tests across multiple runs
        </p>
      </div>

      {/* 🔥 INSIGHT */}
      {!loading && worstTest && (
        <div className="mt-6 p-5 rounded-xl border border-white/10 bg-white/5">
          <p className="text-xs text-white/50">Most Flaky Test</p>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-sm font-medium text-white/80">
              {truncate(worstTest.name)}
            </p>
            <span className="text-yellow-400 font-semibold text-sm">
              {worstTest.flakiness}%
            </span>
          </div>
        </div>
      )}

      {/* TABLE */}
      <div className="mt-6 border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-white/40 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-3">Test</th>
              <th className="text-left px-4 py-3">Runs</th>
              <th className="text-left px-4 py-3">Failures</th>
              <th className="text-left px-4 py-3">Flakiness</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={4} className="text-center py-6 text-white/50">
                  Loading...
                </td>
              </tr>
            )}

            {!loading && tests.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-6 text-white/50">
                  No data available
                </td>
              </tr>
            )}

            {tests.map((t, i) => (
              <tr
                key={i}
                className="border-t border-white/10 hover:bg-white/5 transition"
              >
                {/* TEST NAME */}
                <td className="px-4 py-3 text-white/80 font-mono text-xs">
                  {truncate(t.name)}
                </td>

                {/* RUNS */}
                <td className="px-4 py-3 text-white/70">
                  {t.runs}
                </td>

                {/* FAILURES */}
                <td className="px-4 py-3 text-red-400 font-medium">
                  {t.failures}
                </td>

                {/* FLAKINESS */}
                <td className="px-4 py-3 text-yellow-400 font-medium">
                  {t.flakiness}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}