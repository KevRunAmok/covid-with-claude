import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMapDateRange, getMapCases } from "../api/client";
import type { MapMetric } from "../api/client";
import USAMap from "../components/USAMap";
import "./MapPage.css";

export default function MapPage() {
  const [selectedDate, setSelectedDate] = useState("");
  const [metric, setMetric] = useState<MapMetric>("cases");

  const { data: dateRange } = useQuery({
    queryKey: ["map-date-range"],
    queryFn: getMapDateRange,
  });

  useEffect(() => {
    if (dateRange?.max_date && !selectedDate) setSelectedDate(dateRange.max_date);
  }, [dateRange, selectedDate]);

  const { data: rows, isFetching } = useQuery({
    queryKey: ["map-cases", selectedDate],
    queryFn: () => getMapCases(selectedDate),
    enabled: !!selectedDate,
  });

  const dataMap = useMemo(() => {
    if (!rows) return {};
    return Object.fromEntries(rows.map((r) => [r.fips, r]));
  }, [rows]);

  const maxValue = useMemo(() => {
    if (!rows || rows.length === 0) return 1;
    return Math.max(...rows.map((r) => metric === "cases" ? r.cases : r.deaths));
  }, [rows, metric]);

  const total = useMemo(() => {
    if (!rows) return 0;
    return rows.reduce((sum, r) => sum + (metric === "cases" ? r.cases : r.deaths), 0);
  }, [rows, metric]);

  return (
    <div className="map-page">
      <div className="map-page-header">
        <div>
          <h1 className="map-page-title">US COVID-19 by County</h1>
          <p className="map-page-sub">Scroll or pinch to zoom · Drag to pan</p>
        </div>

        <div className="map-controls-bar">
          <div className="date-picker-group">
            <label>Metric</label>
            <div className="metric-toggle">
              <button
                className={`metric-btn ${metric === "cases" ? "active" : ""}`}
                onClick={() => setMetric("cases")}
              >
                Cases
              </button>
              <button
                className={`metric-btn deaths ${metric === "deaths" ? "active" : ""}`}
                onClick={() => setMetric("deaths")}
              >
                Deaths
              </button>
            </div>
          </div>

          <div className="date-picker-group">
            <label htmlFor="date-picker">Date</label>
            <input
              id="date-picker"
              type="date"
              value={selectedDate}
              min={dateRange?.min_date}
              max={dateRange?.max_date}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          {rows && (
            <div className="map-stat">
              <span className="map-stat-label">Total {metric} on date</span>
              <span className="map-stat-value">{total.toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>

      <USAMap data={dataMap} maxValue={maxValue} metric={metric} isLoading={isFetching} />
    </div>
  );
}
