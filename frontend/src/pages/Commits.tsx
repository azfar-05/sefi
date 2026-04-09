import DashboardLayout from "../components/layout/DashboardLayout";
import { useEffect, useState } from "react";

export default function Commits() {
  const [commits, setCommits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5001/api/commits/regressions")
      .then((res) => res.json())
      .then((raw) => {
        const formatted = (raw || []).map((c: any) => ({
          id: c?.commit_id ?? "",
          message: c?.message ?? "",
          developer: c?.developer ?? "—",
          rawTime: c?.commit_time ?? null,
          time: c?.commit_time
            ? new Date(c.commit_time).toLocaleDateString()
            : "—",
        }));

        setCommits(formatted);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // latest commit
  const latestCommit =
    commits.length > 0
      ? commits.reduce((prev, curr) => {
          const prevTime = prev.rawTime ? new Date(prev.rawTime) : new Date(0);
          const currTime = curr.rawTime ? new Date(curr.rawTime) : new Date(0);
          return currTime > prevTime ? curr : prev;
        })
      : null;

  // SAFE helpers
  const shortId = (id?: any) =>
  id !== undefined && id !== null
    ? String(id).slice(0, 7)
    : "—";

  const truncateMsg = (msg?: string) => {
    if (!msg) return "—";
    if (msg.length < 80) return msg;
    return msg.slice(0, 75) + "...";
  };

  return (
    <DashboardLayout>
      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Regression Commits
        </h2>
        <p className="text-white/50 text-sm mt-1">
          Commits that introduced failures into the system
        </p>
      </div>

      {/* INSIGHT */}
      {!loading && latestCommit && (
        <div className="mt-6 p-5 rounded-xl border border-white/10 bg-white/5">
          <p className="text-xs text-white/50">Latest Regression</p>
          <div className="mt-2 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-mono text-white/80">
                {shortId(latestCommit.id)}
              </p>
              <p className="text-sm text-white/60 mt-1">
                {truncateMsg(latestCommit.message)}
              </p>
            </div>
            <span className="text-xs text-white/40">
              {latestCommit.time}
            </span>
          </div>
        </div>
      )}

      {/* TABLE */}
      <div className="mt-6 border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-white/40 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-3">Commit</th>
              <th className="text-left px-4 py-3">Message</th>
              <th className="text-left px-4 py-3">Developer</th>
              <th className="text-left px-4 py-3">Date</th>
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

            {!loading && commits.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-6 text-white/50">
                  No data available
                </td>
              </tr>
            )}

            {commits.map((c, i) => (
              <tr
                key={c.id || i}
                className="border-t border-white/10 hover:bg-white/5 transition"
              >
                <td className="px-4 py-3 font-mono text-xs text-white/70">
                  {shortId(c.id)}
                </td>

                <td className="px-4 py-3 text-white/80">
                  {truncateMsg(c.message)}
                </td>

                <td className="px-4 py-3 text-white/60">
                  {c.developer}
                </td>

                <td className="px-4 py-3 text-white/50">
                  {c.time}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}