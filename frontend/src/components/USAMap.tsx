import { useState, useMemo } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { scaleSequentialLog } from "d3-scale";
import { interpolateYlOrRd, interpolatePurples } from "d3-scale-chromatic";
import type { MapCasesRow, MapMetric } from "../api/client";
import "./USAMap.css";

const COUNTIES_URL = "https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json";
const STATES_URL   = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

interface Props {
  data: Record<string, MapCasesRow>;
  maxValue: number;
  metric: MapMetric;
  isLoading: boolean;
}

interface Position { coordinates: [number, number]; zoom: number }
interface Tooltip  { x: number; y: number; content: string }

const LEGEND_STOPS = [1, 10, 100, 1_000, 10_000, 100_000];

export default function USAMap({ data, maxValue, metric, isLoading }: Props) {
  const [position, setPosition] = useState<Position>({ coordinates: [-96, 38], zoom: 1 });
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);

  const colorScale = useMemo(
    () => scaleSequentialLog(
      [1, Math.max(maxValue, 2)],
      metric === "cases" ? interpolateYlOrRd : interpolatePurples
    ),
    [maxValue, metric]
  );

  function getColor(value: number) {
    if (!value || value <= 0) return "#e5e7eb";
    return colorScale(value);
  }

  function handleZoom(delta: number) {
    setPosition((p) => ({ ...p, zoom: Math.min(12, Math.max(1, p.zoom + delta)) }));
  }

  return (
    <div className="usa-map-wrapper">
      {isLoading && <div className="map-loading">Loading county data...</div>}

      <div className="map-controls">
        <button className="zoom-btn" onClick={() => handleZoom(1.5)}>+</button>
        <button className="zoom-btn" onClick={() => handleZoom(-1.5)}>−</button>
        <button className="zoom-btn reset" onClick={() => setPosition({ coordinates: [-96, 38], zoom: 1 })}>⌂</button>
      </div>

      <ComposableMap projection="geoAlbersUsa" style={{ width: "100%", height: "100%" }}>
        <ZoomableGroup
          zoom={position.zoom}
          center={position.coordinates}
          onMoveEnd={(pos) => setPosition(pos as Position)}
        >
          <Geographies geography={COUNTIES_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const fips = String(geo.id).padStart(5, "0");
                const row = data[fips];
                const value = metric === "cases" ? (row?.cases ?? 0) : (row?.deaths ?? 0);
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={getColor(value)}
                    stroke="#6b7280"
                    strokeWidth={0.3 / position.zoom}
                    style={{ outline: "none" }}
                    onMouseEnter={(e: React.MouseEvent) => {
                      setTooltip({
                        x: e.clientX,
                        y: e.clientY,
                        content: row
                          ? `${row.county}, ${row.state} — ${value.toLocaleString()} ${metric}`
                          : "No data",
                      });
                    }}
                    onMouseMove={(e: React.MouseEvent) => {
                      setTooltip((prev) => prev ? { ...prev, x: e.clientX, y: e.clientY } : null);
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  />
                );
              })
            }
          </Geographies>

          <Geographies geography={STATES_URL}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="none"
                  stroke="#111"
                  strokeWidth={0.8 / position.zoom}
                  style={{ outline: "none", pointerEvents: "none" }}
                />
              ))
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {tooltip && (
        <div className="map-tooltip" style={{ left: tooltip.x + 14, top: tooltip.y - 36 }}>
          {tooltip.content}
        </div>
      )}

      <div className="map-legend">
        <span className="legend-label">{metric === "cases" ? "Cases" : "Deaths"}</span>
        <div className={`legend-gradient ${metric === "deaths" ? "legend-gradient-deaths" : ""}`} />
        <div className="legend-ticks">
          {LEGEND_STOPS.map((v) => (
            <span key={v}>{v >= 1000 ? `${v / 1000}K` : v}</span>
          ))}
        </div>
        <span className="legend-label">No data</span>
        <div className="legend-nodata" />
      </div>
    </div>
  );
}
