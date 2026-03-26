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

export default function Files() {
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

    fetch(`${BASE_URL}/files/failure-prone${queryString}`)
      .then((res) => res.json())
      .then((next) => {
        if (cancelled) return;
        setData(next);
      })
      .catch(() => {
        if (cancelled) return;
        setError("Failed to load file data.");
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
    labels: data.map(f => f.file),
    datasets: [
      {
        label: "Failures",
        data: data.map(f => f.failures),
        backgroundColor: "orange"
      }
    ]
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl mb-4">Failure-Prone Files</h1>
      <Bar data={chartData} />
    </div>
  );
}