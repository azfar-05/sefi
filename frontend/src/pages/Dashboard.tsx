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

  useEffect(() => {
    fetch("http://localhost:5001/api/ci/failure-trends")
      .then((res) => res.json())
      .then((raw) => {
        const formatted = raw.map((d: any) => ({
          date: new Date(d.day).toLocaleDateString(),
          failures: Number(d.failed_runs),
        }));
        setData(formatted);
      })
      .catch((err) => console.error(err));
  }, []);

  const filteredData = data.filter((d) => {
    if (!startDate || !endDate) return true;

    const current = new Date(d.date);
    return current >= new Date(startDate) && current <= new Date(endDate);
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
      <div>
        <h2 className="text-2xl font-semibold">Overview</h2>
        <p className="text-white/60 text-sm mt-1">
          Monitor failures, trends, and system health
        </p>
      </div>

      <div className="mt-6 flex gap-4 items-center">

  <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-2 rounded-md">
    <span className="text-white/50 text-sm">From</span>
    <input
      type="date"
      value={startDate}
      onChange={(e) => setStartDate(e.target.value)}
      className="bg-transparent text-sm outline-none text-white [color-scheme:dark]"
    />
  </div>

  <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-2 rounded-md">
    <span className="text-white/50 text-sm">To</span>
    <input
      type="date"
      value={endDate}
      onChange={(e) => setEndDate(e.target.value)}
      className="bg-transparent text-sm outline-none text-white [color-scheme:dark]"
    />
  </div>

</div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="p-5 rounded-xl border border-white/10 bg-white/5">
          <p className="text-sm text-white/60">Total Failures</p>
          <h3 className="text-2xl font-semibold mt-2 text-red-400">
            {totalFailures}
          </h3>
        </div>

        <div className="p-5 rounded-xl border border-white/10 bg-white/5">
          <p className="text-sm text-white/60">Success Rate</p>
          <h3 className="text-2xl font-semibold mt-2 text-green-400">
            {successRate}%
          </h3>
        </div>

        <div className="p-5 rounded-xl border border-white/10 bg-white/5">
          <p className="text-sm text-white/60">Avg MTTR</p>
          <h3 className="text-2xl font-semibold mt-2">--</h3>
        </div>
      </div>

      {/* CHART SECTION */}
      <div className="mt-10 p-6 rounded-xl border border-white/10 bg-white/5">
        <h3 className="text-lg font-semibold mb-4">Failure Trends</h3>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filteredData}>
              <CartesianGrid stroke="rgba(255,255,255,0.1)" />

              <XAxis dataKey="date" stroke="#888" fontSize={12} />

              <YAxis stroke="#888" fontSize={12} />

              <Tooltip
                contentStyle={{
                  backgroundColor: "#111",
                  border: "1px solid rgba(255,255,255,0.1)",
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
