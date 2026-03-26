export function buildFiltersQuery(filters) {
  const params = new URLSearchParams();

  const startDate = filters?.startDate ?? null;
  const endDate = filters?.endDate ?? null;
  const developer = filters?.developer ?? null;
  const file = filters?.file ?? null;

  if (startDate && startDate !== "all") params.set("start_date", startDate);
  if (endDate && endDate !== "all") params.set("end_date", endDate);
  if (developer && developer !== "all") params.set("developer", developer);
  if (file && file !== "all") params.set("file", file);

  return params;
}

export function toQueryString(params) {
  const s = params.toString();
  return s ? `?${s}` : "";
}

