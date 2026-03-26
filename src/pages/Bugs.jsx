/* eslint react-hooks/set-state-in-effect: off */
import { useEffect, useState } from "react";
import { useFilters } from "../context/FilterContext";
import { buildFiltersQuery, toQueryString } from "../utils/filtersToQuery";

const BASE_URL = "http://localhost:8000";

export default function Bugs() {
  const [mttr, setMttr] = useState(null);
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

    fetch(`${BASE_URL}/bugs/mttr${queryString}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setMttr(data.mttr);
      })
      .catch(() => {
        if (cancelled) return;
        setError("Failed to load bug metrics.");
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
      <h1 className="text-2xl mb-4">Bug Metrics</h1>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-400">{error}</p>
      ) : mttr === null ? (
        <p>No bug data for selected filters.</p>
      ) : (
        <div className="bg-gray-800 p-6 rounded-xl text-center">
          <p className="text-lg">Mean Time To Repair</p>
          <p className="text-3xl font-bold mt-2">{mttr}</p>
        </div>
      )}
    </div>
  );
}