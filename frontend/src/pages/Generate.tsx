import DashboardLayout from "../components/layout/DashboardLayout";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Generate() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const generate = async (mode: "demo" | "random") => {
    setLoading(true);

    await fetch(`http://localhost:5001/api/generate-data?mode=${mode}`, {
      method: "POST",
    });

    setLoading(false);

    navigate("/dashboard");
    window.location.reload();
  };

  return (
    <DashboardLayout>
      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Generate Dataset
        </h2>
        <p className="text-white/50 text-sm mt-1">
          Create realistic data to explore failure patterns and system behavior
        </p>
      </div>

      {/* CARD */}
      <div className="mt-6 p-6 border border-white/10 rounded-xl bg-white/5 space-y-6">
        {/* DESCRIPTION */}
        <p className="text-white/60 text-sm max-w-xl">
          Choose how you want to generate data. Demo mode creates a clean,
          structured dataset for presentation. Random mode simulates real-world
          unpredictability.
        </p>

        {/* ACTIONS */}
        <div className="flex gap-4 flex-wrap">
          {/* DEMO BUTTON */}
          <button
            onClick={() => generate("demo")}
            disabled={loading}
            className="bg-white text-black px-6 py-3 rounded-md font-medium hover:bg-white/90 transition disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate Demo Data"}
          </button>

          {/* RANDOM BUTTON */}
          <button
            onClick={() => generate("random")}
            disabled={loading}
            className="border border-white/20 px-6 py-3 rounded-md text-white hover:bg-white/10 transition disabled:opacity-50"
          >
            Generate Random Data
          </button>
        </div>

        {/* HINT */}
        <div className="text-xs text-white/40">
          Tip: Use demo mode for presentations, random mode for exploration
        </div>
      </div>
    </DashboardLayout>
  );
}
