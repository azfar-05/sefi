/* eslint react-hooks/set-state-in-effect: off */
import { useEffect, useState } from "react";
import { useFilters } from "../context/FilterContext";
import FilterBar from "../components/FilterBar";
import { buildFiltersQuery, toQueryString } from "../utils/filtersToQuery";

const BASE_URL = "http://localhost:8000";

export default function Dashboard() {
  const { filters } = useFilters();
  const { startDate, endDate, developer, file } = filters;

  const [trend, setTrend] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [developerOptions, setDeveloperOptions] = useState([]);
  const [fileOptions, setFileOptions] = useState([]);

  useEffect(() => {
    const queryString = toQueryString(
      buildFiltersQuery({ startDate, endDate, developer: null, file: null }),
    );

    let cancelled = false;
    Promise.all([
      fetch(`${BASE_URL}/developers/failure-rate${queryString}`).then((r) => r.json()),
      fetch(`${BASE_URL}/files/failure-prone${queryString}`).then((r) => r.json()),
    ])
      .then(([devData, fileData]) => {
        if (cancelled) return;
        setDeveloperOptions(devData.map((d) => d.developer));
        setFileOptions(fileData.map((f) => f.file));
      })
      .catch(() => {
        // Keep dropdowns as-is if options load fails; dashboard data still works.
      });

    return () => {
      cancelled = true;
    };
  }, [startDate, endDate]);

  useEffect(() => {
    const queryString = toQueryString(
      buildFiltersQuery({ startDate, endDate, developer, file }),
    );

    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([
      fetch(`${BASE_URL}/ci/failure-trend${queryString}`).then((r) => r.json()),
      fetch(`${BASE_URL}/build/summary${queryString}`).then((r) => r.json()),
    ])
      .then(([trendData, summaryData]) => {
        if (cancelled) return;
        setTrend(trendData);
        setSummary(summaryData);
      })
      .catch(() => {
        if (cancelled) return;
        setError("Failed to load dashboard data.");
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [startDate, endDate, developer, file]);

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl mb-4">Dashboard</h1>

      <FilterBar developerOptions={developerOptions} fileOptions={fileOptions} />

      <div className="mb-6">
        <h2 className="text-xl mb-2">Build Summary</h2>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-400">{error}</p>
        ) : summary ? (
          <div>
            Passed: {summary.passed_builds}
            <br />
            Failed: {summary.failed_builds}
          </div>
        ) : (
          <p>No summary data.</p>
        )}
      </div>

      <div>
        <h2 className="text-xl mb-2">CI Failure Trend</h2>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-400">{error}</p>
        ) : trend.length === 0 ? (
          <p>No data for selected filters.</p>
        ) : (
          trend.map((d, i) => (
            <div key={i}>
              {d.date} — {d.failures}/{d.total_builds}
            </div>
          ))
        )}
      </div>
    </div>
  );
}