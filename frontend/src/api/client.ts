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

export interface DateRange {
  min_date: string;
  max_date: string;
}

export type MapMetric = "cases" | "deaths";

export interface MapCasesRow {
  fips: string;
  cases: number;
  deaths: number;
  county: string;
  state: string;
}

export async function getMapDateRange(): Promise<DateRange> {
  const res = await fetch(`${BASE}/map/date-range`);
  if (!res.ok) throw new Error("Failed to fetch date range");
  return res.json();
}

export async function getMapCases(date: string): Promise<MapCasesRow[]> {
  const res = await fetch(`${BASE}/map/cases?date=${encodeURIComponent(date)}`);
  if (!res.ok) throw new Error("Failed to fetch map cases");
  return res.json();
}

export interface StateInfo {
  name: string;
  short: string;
  fips: string;
}

export async function getStates(): Promise<StateInfo[]> {
  const res = await fetch(`${BASE}/map/states`);
  if (!res.ok) throw new Error("Failed to fetch states");
  return res.json();
}

export async function getStateCases(date: string, stateFips: string): Promise<MapCasesRow[]> {
  const res = await fetch(`${BASE}/map/cases?date=${encodeURIComponent(date)}&state_fips=${stateFips}`);
  if (!res.ok) throw new Error("Failed to fetch state cases");
  return res.json();
}
