import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMapDateRange, getStates, getStateCases } from "../api/client";
import type { MapMetric } from "../api/client";
import StateMap from "../components/StateMap";
import "./MapPage.css";
import "./StateMapPage.css";

export default function StateMapPage() {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedFips, setSelectedFips] = useState("");
  const [metric, setMetric] = useState<MapMetric>("cases");

  const { data: dateRange } = useQuery({
    queryKey: ["map-date-range"],
    queryFn: getMapDateRange,
  });

  const { data: states = [] } = useQuery({
    queryKey: ["states"],
    queryFn: getStates,
  });

  useEffect(() => {
    if (dateRange?.max_date && !selectedDate) setSelectedDate(dateRange.max_date);
  }, [dateRange, selectedDate]);

  useEffect(() => {
    if (states.length > 0 && !selectedFips) setSelectedFips(states[0].fips);
  }, [states, selectedFips]);

  const { data: rows, isFetching } = useQuery({
    queryKey: ["state-cases", selectedDate, selectedFips],
    queryFn: () => getStateCases(selectedDate, selectedFips),
    enabled: !!selectedDate && !!selectedFips,
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

  const selectedState = states.find((s) => s.fips === selectedFips);

  return (
    <div className="map-page">
      <div className="map-page-header">
        <div>
          <h1 className="map-page-title">
            {selectedState ? `${selectedState.name} — County ${metric === "cases" ? "Cases" : "Deaths"}` : "State Map"}
          </h1>
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
            <label htmlFor="state-select">State</label>
            <select
              id="state-select"
              className="state-select"
              value={selectedFips}
              onChange={(e) => setSelectedFips(e.target.value)}
            >
              {states.map((s) => (
                <option key={s.fips} value={s.fips}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="date-picker-group">
            <label htmlFor="state-date-picker">Date</label>
            <input
              id="state-date-picker"
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

      {selectedFips && (
        <StateMap
          data={dataMap}
          maxValue={maxValue}
          metric={metric}
          stateFips={selectedFips}
          isLoading={isFetching}
        />
      )}
    </div>
  );
}
