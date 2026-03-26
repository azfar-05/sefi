/* eslint react-hooks/set-state-in-effect: off */
import { useEffect, useState } from "react";
import { useFilters } from "../context/FilterContext";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { buildFiltersQuery, toQueryString } from "../utils/filtersToQuery";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

const BASE_URL = "http://localhost:8000";

export default function Developers() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { filters } = useFilters();
  const { startDate, endDate, developer, file } = filters;

  useEffect(() => {
    const queryString = toQueryString(
      buildFiltersQuery({ startDate, endDate, developer, file }),
    );

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`${BASE_URL}/developers/failure-rate${queryString}`)
      .then((res) => res.json())
      .then((next) => {
        if (cancelled) return;
        setData(next);
      })
      .catch(() => {
        if (cancelled) return;
        setError("Failed to load developer data.");
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [startDate, endDate, developer, file]);

  if (loading) return <p className="text-white p-6">Loading...</p>;
  if (error) return <p className="text-red-400 p-6">{error}</p>;
  if (data.length === 0) {
    return <p className="text-white p-6">No data for selected filters.</p>;
  }

  const chartData = {
    labels: data.map(d => d.developer),
    datasets: [
      {
        label: "Failure Rate (%)",
        data: data.map(d => d.failure_rate),
        backgroundColor: "rgba(59, 130, 246, 0.7)"
      }
    ]
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl mb-4">Developer Failure Rate</h1>
      <Bar data={chartData} />
    </div>
  );
}