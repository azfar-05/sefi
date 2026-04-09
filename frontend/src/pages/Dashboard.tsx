import DashboardLayout from "../components/layout/DashboardLayout";
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function Dashboard() {
  const [data, setData] = useState<any[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [mttr, setMttr] = useState<string>("--");

  // 📊 FAILURE TRENDS
  useEffect(() => {
    fetch("http://localhost:5001/api/ci/failure-trends")
      .then((res) => res.json())
      .then((raw) => {
        const formatted = raw.map((d: any) => ({
          rawDate: d.day,
          date: new Date(d.day).toLocaleDateString(),
          failures: Number(d.failed_runs),
        }));
        setData(formatted);
      })
      .catch((err) => console.error(err));
  }, []);

  // 🛠️ MTTR (REAL)
  useEffect(() => {
    fetch("http://localhost:5001/api/bugs/resolution-times")
      .then((res) => res.json())
      .then((raw) => {
        if (!raw.length) {
          setMttr("--");
          return;
        }

        const avg =
          raw.reduce(
            (sum: number, b: any) =>
              sum + Number(b.resolution_time_days),
            0
          ) / raw.length;

        setMttr(avg.toFixed(1) + " days");
      })
      .catch((err) => {
        console.error(err);
        setMttr("--");
      });
  }, []);

  // ✅ FILTER
  const filteredData = data.filter((d) => {
    if (!startDate || !endDate) return true;

    return (
      new Date(d.rawDate) >= new Date(startDate) &&
      new Date(d.rawDate) <= new Date(endDate)
    );
  });

  const totalFailures = filteredData.reduce((sum, d) => sum + d.failures, 0);

  const totalRuns = filteredData.length;

  const successRate =
    totalRuns === 0
      ? 0
      : (((totalRuns - totalFailures) / totalRuns) * 100).toFixed(1);

  return (
    <DashboardLayout>
      {/* HEADER */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Overview</h2>
          <p className="text-white/50 text-sm mt-1">
            Monitor failures, trends, and system health
          </p>
        </div>

        {/* FILTERS */}
        <div className="flex gap-3">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-2 rounded-md">
            <span className="text-white/40 text-xs">From</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent text-sm outline-none text-white [color-scheme:dark]"
            />
          </div>

          <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-2 rounded-md">
            <span className="text-white/40 text-xs">To</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent text-sm outline-none text-white [color-scheme:dark]"
            />
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="p-5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition">
          <p className="text-xs text-white/50">Total Failures</p>
          <h3 className="text-3xl font-semibold mt-2 text-red-400">
            {totalFailures}
          </h3>
        </div>

        <div className="p-5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition">
          <p className="text-xs text-white/50">Success Rate</p>
          <h3 className="text-3xl font-semibold mt-2 text-green-400">
            {successRate}%
          </h3>
        </div>

        <div className="p-5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition">
          <p className="text-xs text-white/50">Avg MTTR</p>
          <h3 className="text-3xl font-semibold mt-2">
            {mttr}
          </h3>
        </div>
      </div>

      {/* CHART */}
      <div className="mt-10 p-6 rounded-xl border border-white/10 bg-white/5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold tracking-tight">
            Failure Trends
          </h3>
          <span className="text-xs text-white/40">
            {filteredData.length} data points
          </span>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filteredData}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" />

              <XAxis dataKey="date" stroke="#777" fontSize={12} />

              <YAxis stroke="#777" fontSize={12} />

              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f0f0f",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                }}
              />

              <Line
                type="monotone"
                dataKey="failures"
                stroke="#a78bfa"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </DashboardLayout>
  );
}