import { useNavigate } from "react-router-dom"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  return (
    <div className="flex min-h-screen bg-black text-white">

      {/* SIDEBAR */}
      <aside className="w-64 border-r border-white/10 p-6 space-y-6">
        <h1 className="text-lg font-semibold">SEFI</h1>

        <nav className="space-y-2 text-sm text-white/70">
          <div className="hover:text-white cursor-pointer">Overview</div>
         <div onClick={() => navigate("/files")} className="hover:text-white cursor-pointer">
  Files
</div>
          <div className="hover:text-white cursor-pointer">Failures</div>
          <div className="hover:text-white cursor-pointer">Tests</div>
          <div className="hover:text-white cursor-pointer">Commits</div>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8">
        {children}
      </main>

    </div>
  )
}