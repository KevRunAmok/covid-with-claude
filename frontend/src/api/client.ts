const BASE = "http://localhost:8000/api";

export interface CountySearchResult {
  usa_counties_id: number;
  usa_counties_name: string;
  usa_states_name: string;
  usa_states_short: string;
}

export type CountyDetail = Record<string, string | number | null>;

export async function searchCounties(search: string): Promise<CountySearchResult[]> {
  const res = await fetch(`${BASE}/counties?search=${encodeURIComponent(search)}`);
  if (!res.ok) throw new Error("Failed to fetch counties");
  return res.json();
}

export async function getCounty(id: number): Promise<CountyDetail> {
  const res = await fetch(`${BASE}/counties/${id}`);
  if (!res.ok) throw new Error("Failed to fetch county");
  return res.json();
}

export interface TimeseriesRow {
  date: string;
  total_cases: number | null;
  cases_7day_avg: number | null;
  active_cases: number | null;
  total_deaths: number | null;
  deaths_7day_avg: number | null;
}

export async function getCountyTimeseries(id: number): Promise<TimeseriesRow[]> {
  const res = await fetch(`${BASE}/counties/${id}/timeseries`);
  if (!res.ok) throw new Error("Failed to fetch timeseries");
  return res.json();
}
