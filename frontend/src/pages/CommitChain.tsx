import DashboardLayout from "../components/layout/DashboardLayout";
import { useState } from "react";

export default function CommitChain() {
  const [commitId, setCommitId] = useState("");
  const [chain, setChain] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchChain = () => {
    if (!commitId.trim()) return;

    setLoading(true);

    fetch(`http://localhost:5001/api/commits/chain/${commitId}`)
      .then((res) => res.json())
      .then((raw) => {
        const formatted = (raw || []).map((c: any) => ({
          id: String(c?.id ?? ""),
          message: c?.message ?? "—",
        }));
        setChain(formatted);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const shortId = (id: string) => (id ? id.slice(0, 7) : "—");

  return (
    <DashboardLayout>
      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Commit Chain
        </h2>
        <p className="text-white/50 text-sm mt-1">
          Trace commit ancestry to identify failure origins
        </p>
      </div>

      {/* INPUT */}
      <div className="mt-6 flex gap-3 items-center">
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-2 rounded-md">
          <span className="text-white/40 text-xs">Commit</span>
          <input
            value={commitId}
            onChange={(e) => setCommitId(e.target.value)}
            placeholder="e.g. 12"
            className="bg-transparent text-sm outline-none w-24 text-white"
          />
        </div>

        <button
          onClick={fetchChain}
          className="bg-white text-black px-5 py-2 rounded-md text-sm font-medium hover:bg-white/90 transition"
        >
          {loading ? "Tracing..." : "Trace"}
        </button>
      </div>

      {/* INFO */}
      {!loading && chain.length > 0 && (
        <p className="text-white/40 text-sm mt-4">
          Showing ancestry (latest → oldest)
        </p>
      )}

      {/* EMPTY STATE */}
      {!loading && chain.length === 0 && commitId && (
        <p className="text-white/40 text-sm mt-6">
          No commit chain found
        </p>
      )}

      {/* CHAIN */}
      <div className="mt-8 space-y-6">
        {chain.map((c, i) => {
          const isStart = i === 0;

          return (
            <div key={i} className="flex items-start gap-4">
              {/* CONNECTOR */}
              <div className="flex flex-col items-center mt-2">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    isStart ? "bg-red-400" : "bg-purple-400"
                  }`}
                />
                {i !== chain.length - 1 && (
                  <div className="w-px h-12 bg-white/10" />
                )}
              </div>

              {/* CARD */}
              <div
                className={`p-4 rounded-xl border w-full transition ${
                  isStart
                    ? "border-red-400/40 bg-red-500/10"
                    : "border-white/10 bg-white/5 hover:bg-white/10"
                }`}
              >
                <p className="text-xs text-white/50 font-mono">
                  {shortId(c.id)} {isStart && "• selected"}
                </p>

                <p className="text-sm mt-1 text-white/80 font-medium">
                  {c.message}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}