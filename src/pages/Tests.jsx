/* eslint react-hooks/set-state-in-effect: off */
import { useEffect, useState } from "react";
import { useFilters } from "../context/FilterContext";
import { buildFiltersQuery, toQueryString } from "../utils/filtersToQuery";

const BASE_URL = "http://localhost:8000";

export default function Tests() {
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

    fetch(`${BASE_URL}/tests/flaky${queryString}`)
      .then((res) => res.json())
      .then((next) => {
        if (cancelled) return;
        setData(next);
      })
      .catch(() => {
        if (cancelled) return;
        setError("Failed to load test data.");
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
    return <p className="text-white p-6">No flaky tests for selected filters.</p>;
  }

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl mb-4">Flaky Tests</h1>

      <table className="table-auto border border-gray-500 w-full">
        <thead>
          <tr>
            <th className="border px-4 py-2">Test</th>
            <th className="border px-4 py-2">Failures</th>
            <th className="border px-4 py-2">Passes</th>
          </tr>
        </thead>
        <tbody>
          {data.map((t, i) => (
            <tr key={i}>
              <td className="border px-4 py-2">{t.test}</td>
              <td className="border px-4 py-2">{t.failures}</td>
              <td className="border px-4 py-2">{t.passes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}