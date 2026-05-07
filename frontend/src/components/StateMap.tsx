import { useState, useMemo } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { scaleSequentialLog } from "d3-scale";
import { interpolateYlOrRd, interpolatePurples } from "d3-scale-chromatic";
import type { MapCasesRow, MapMetric } from "../api/client";
import "./USAMap.css";

const COUNTIES_URL = "https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json";
const STATES_URL   = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

// [lng, lat, zoom] for each state by 2-digit FIPS
const STATE_VIEWS: Record<string, [number, number, number]> = {
  "01": [-86.9,  32.8,  8  ], // Alabama
  "02": [-153.4, 64.2,  2.5], // Alaska
  "04": [-111.5, 34.3,  6  ], // Arizona
  "05": [-92.4,  34.9,  8  ], // Arkansas
  "06": [-119.4, 36.8,  5  ], // California
  "08": [-105.5, 39.1,  6  ], // Colorado
  "09": [-72.7,  41.6,  20 ], // Connecticut
  "10": [-75.5,  38.9,  22 ], // Delaware
  "11": [-77.0,  38.9,  50 ], // DC
  "12": [-82.5,  28.6,  6  ], // Florida
  "13": [-83.6,  32.7,  7  ], // Georgia
  "15": [-157.5, 20.2,  7  ], // Hawaii
  "16": [-114.7, 44.5,  6  ], // Idaho
  "17": [-89.2,  40.3,  7  ], // Illinois
  "18": [-86.1,  39.8,  8  ], // Indiana
  "19": [-93.2,  41.9,  8  ], // Iowa
  "20": [-98.5,  38.5,  7  ], // Kansas
  "21": [-84.3,  37.5,  8  ], // Kentucky
  "22": [-91.9,  30.9,  8  ], // Louisiana
  "23": [-69.2,  45.3,  8  ], // Maine
  "24": [-76.6,  39.0,  12 ], // Maryland
  "25": [-71.4,  42.4,  14 ], // Massachusetts
  "26": [-85.6,  44.8,  6.5], // Michigan
  "27": [-94.3,  46.4,  6  ], // Minnesota
  "28": [-89.7,  32.7,  8  ], // Mississippi
  "29": [-92.5,  38.5,  7  ], // Missouri
  "30": [-110.3, 46.9,  5.5], // Montana
  "31": [-98.3,  41.5,  7  ], // Nebraska
  "32": [-116.4, 38.3,  5.5], // Nevada
  "33": [-71.6,  43.7,  13 ], // New Hampshire
  "34": [-74.4,  40.1,  14 ], // New Jersey
  "35": [-106.0, 34.3,  6  ], // New Mexico
  "36": [-74.9,  42.8,  7  ], // New York
  "37": [-79.0,  35.5,  8  ], // North Carolina
  "38": [-100.5, 47.5,  7  ], // North Dakota
  "39": [-82.9,  40.4,  9  ], // Ohio
  "40": [-97.5,  35.5,  7  ], // Oklahoma
  "41": [-120.6, 44.1,  6  ], // Oregon
  "42": [-77.2,  41.2,  9  ], // Pennsylvania
  "44": [-71.5,  41.7,  24 ], // Rhode Island
  "45": [-80.9,  33.8,  9  ], // South Carolina
  "46": [-100.3, 44.4,  7  ], // South Dakota
  "47": [-86.7,  35.9,  8  ], // Tennessee
  "48": [-99.3,  31.5,  5  ], // Texas
  "49": [-111.1, 39.4,  6  ], // Utah
  "50": [-72.7,  44.0,  13 ], // Vermont
  "51": [-78.7,  37.5,  8  ], // Virginia
  "53": [-120.7, 47.4,  6.5], // Washington
  "54": [-80.5,  38.5,  9  ], // West Virginia
  "55": [-89.6,  44.6,  7.5], // Wisconsin
  "56": [-107.5, 43.0,  6  ], // Wyoming
  "72": [-66.6,  18.2,  9  ], // Puerto Rico
};

interface Props {
  data: Record<string, MapCasesRow>;
  maxValue: number;
  metric: MapMetric;
  stateFips: string;
  isLoading: boolean;
}

interface Position { coordinates: [number, number]; zoom: number }
interface Tooltip  { x: number; y: number; content: string }

const LEGEND_STOPS = [1, 10, 100, 1_000, 10_000, 100_000];

export default function StateMap({ data, maxValue, metric, stateFips, isLoading }: Props) {
  const view = STATE_VIEWS[stateFips] ?? [-96, 38, 1];
  const [position, setPosition] = useState<Position>({
    coordinates: [view[0], view[1]],
    zoom: view[2],
  });
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);

  // Reset view when state changes
  useMemo(() => {
    const v = STATE_VIEWS[stateFips] ?? [-96, 38, 1];
    setPosition({ coordinates: [v[0], v[1]], zoom: v[2] });
  }, [stateFips]);

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
    setPosition((p) => ({ ...p, zoom: Math.min(80, Math.max(1, p.zoom + delta)) }));
  }

  return (
    <div className="usa-map-wrapper">
      {isLoading && <div className="map-loading">Loading county data...</div>}

      <div className="map-controls">
        <button className="zoom-btn" onClick={() => handleZoom(position.zoom * 0.5)}>+</button>
        <button className="zoom-btn" onClick={() => handleZoom(-position.zoom * 0.3)}>−</button>
        <button
          className="zoom-btn reset"
          onClick={() => {
            const v = STATE_VIEWS[stateFips] ?? [-96, 38, 1];
            setPosition({ coordinates: [v[0], v[1]], zoom: v[2] });
          }}
        >
          ⌂
        </button>
      </div>

      <ComposableMap projection="geoAlbersUsa" style={{ width: "100%", height: "100%" }}>
        <ZoomableGroup
          zoom={position.zoom}
          center={position.coordinates}
          onMoveEnd={(pos) => setPosition(pos as Position)}
        >
          <Geographies geography={COUNTIES_URL}>
            {({ geographies }) =>
              geographies
                .filter((geo) =>
                  String(geo.id).padStart(5, "0").startsWith(stateFips)
                )
                .map((geo) => {
                  const fips = String(geo.id).padStart(5, "0");
                  const row = data[fips];
                  const value = metric === "cases" ? (row?.cases ?? 0) : (row?.deaths ?? 0);
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={getColor(value)}
                      stroke="#6b7280"
                      strokeWidth={0.5 / position.zoom}
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
                        setTooltip((prev) =>
                          prev ? { ...prev, x: e.clientX, y: e.clientY } : null
                        );
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  );
                })
            }
          </Geographies>

          <Geographies geography={STATES_URL}>
            {({ geographies }) =>
              geographies
                .filter((geo) =>
                  String(geo.id).padStart(2, "0") === stateFips
                )
                .map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="none"
                    stroke="#111"
                    strokeWidth={1.2 / position.zoom}
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
