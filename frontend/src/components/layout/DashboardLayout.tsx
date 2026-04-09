import { useNavigate } from "react-router-dom";
import { useFilter } from "../../context/FilterContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const { developer, setDeveloper } = useFilter();

  return (
    <div className="flex min-h-screen bg-black text-white">
      {/* SIDEBAR */}
      <aside className="w-64 border-r border-white/10 p-6 space-y-6">
        <button
          onClick={() => navigate("/")}
          className="text-xl font-semibold tracking-tight hover:opacity-80 transition text-left"
        >
          SEFI
        </button>

        <nav className="space-y-2 text-sm text-white/70">
          <div
            onClick={() => navigate("/dashboard")}
            className="hover:text-white cursor-pointer"
          >
            Overview
          </div>

          <div
            onClick={() => navigate("/files")}
            className="hover:text-white cursor-pointer"
          >
            Files
          </div>

          <div
            onClick={() => navigate("/tests")}
            className="hover:text-white cursor-pointer"
          >
            Tests
          </div>

          <div
            onClick={() => navigate("/commits")}
            className="hover:text-white cursor-pointer"
          >
            Commits
          </div>

          <div
            onClick={() => navigate("/chain")}
            className="hover:text-white cursor-pointer"
          >
            Commit Chain
          </div>
          <div
            onClick={() => navigate("/mttr")}
            className="hover:text-white cursor-pointer"
          >
            MTTR
          </div>
          <div
  onClick={() => navigate("/generate")}
  className="hover:text-white cursor-pointer"
>
  Generate Data
</div>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8">
        {/* GLOBAL FILTER BAR */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-sm text-white/50">
            {developer ? `Filtered by: ${developer}` : "All Developers"}
          </h2>

          <select
            value={developer}
            onChange={(e) => setDeveloper(e.target.value)}
            className="bg-white/5 border border-white/10 px-3 py-2 rounded-md text-sm"
          >
            <option value="">All</option>
            <option value="Alice">Alice</option>
            <option value="Bob">Bob</option>
          </select>
        </div>

        {children}
      </main>
    </div>
  );
}
