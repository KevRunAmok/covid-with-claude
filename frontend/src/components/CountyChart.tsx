import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import ReactECharts from "echarts-for-react";
import { getCountyTimeseries } from "../api/client";
import type { EChartsOption } from "echarts";
import "./CountyChart.css";

interface Props {
  countyId: number;
  countyName: string;
}

type View = "cases" | "deaths";

export default function CountyChart({ countyId, countyName }: Props) {
  const [view, setView] = useState<View>("cases");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["timeseries", countyId],
    queryFn: () => getCountyTimeseries(countyId),
  });

  const option = useMemo((): EChartsOption => {
    if (!data || data.length === 0) return {};

    const dates = data.map((d) => d.date);
    const isCases = view === "cases";

    const totalSeries = isCases
      ? data.map((d) => d.total_cases)
      : data.map((d) => d.total_deaths);

    const avgSeries = isCases
      ? data.map((d) => d.cases_7day_avg)
      : data.map((d) => d.deaths_7day_avg);

    const dailyColor  = isCases ? "#3b82f6" : "#ef4444";
    const avgColor    = isCases ? "#ef4444" : "#3b82f6";
    const areaColor   = isCases ? "rgba(59,130,246,0.12)" : "rgba(239,68,68,0.12)";
    const label = isCases ? "Cases" : "Deaths";

    return {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "cross", label: { backgroundColor: "#374151" } },
        formatter: (params: any) => {
          const date = params[0]?.axisValue ?? "";
          return params
            .map((p: any) => `${p.marker} ${p.seriesName}: <b>${(p.value ?? 0).toLocaleString()}</b>`)
            .join("<br/>")
            .replace(/^/, `<div style="font-weight:600;margin-bottom:4px">${date}</div>`);
        },
      },
      legend: {
        top: 0,
        right: 0,
        textStyle: { fontSize: 13 },
      },
      grid: { top: 40, right: 20, bottom: 60, left: 70 },
      xAxis: {
        type: "category",
        data: dates,
        axisLabel: {
          rotate: 30,
          formatter: (val: string) => {
            const d = new Date(val);
            return `${d.toLocaleString("default", { month: "short" })} '${String(d.getFullYear()).slice(2)}`;
          },
          interval: Math.floor(dates.length / 10),
        },
        axisLine: { lineStyle: { color: "#e5e7eb" } },
      },
      yAxis: {
        type: "value",
        axisLabel: {
          formatter: (val: number) =>
            val >= 1_000_000 ? `${(val / 1_000_000).toFixed(1)}M`
            : val >= 1_000 ? `${(val / 1_000).toFixed(0)}K`
            : String(val),
        },
        splitLine: { lineStyle: { color: "#f3f4f6" } },
      },
      dataZoom: [
        { type: "inside", start: 0, end: 100 },
        { type: "slider", start: 0, end: 100, height: 24, bottom: 8 },
      ],
      series: [
        {
          name: `Total ${label}`,
          type: "line",
          data: totalSeries,
          smooth: false,
          symbol: "none",
          lineStyle: { width: 1.5, color: dailyColor },
          areaStyle: { color: areaColor },
          itemStyle: { color: dailyColor },
        },
        {
          name: `7-Day Avg`,
          type: "line",
          data: avgSeries,
          smooth: true,
          symbol: "none",
          lineStyle: { width: 2.5, color: avgColor },
          itemStyle: { color: avgColor },
        },
      ],
    };
  }, [data, view]);

  return (
    <div className="chart-section">
      <div className="chart-header">
        <h3 className="chart-title">COVID-19 Trends — {countyName}</h3>
        <div className="chart-tabs">
          <button
            className={`chart-tab ${view === "cases" ? "active" : ""}`}
            onClick={() => setView("cases")}
          >
            Cases
          </button>
          <button
            className={`chart-tab ${view === "deaths" ? "active deaths" : ""}`}
            onClick={() => setView("deaths")}
          >
            Deaths
          </button>
        </div>
      </div>

      {isLoading && <div className="chart-status">Loading chart data...</div>}
      {isError && <div className="chart-status chart-error">Failed to load timeseries data.</div>}
      {data && data.length === 0 && (
        <div className="chart-status">No timeseries data available for this county.</div>
      )}
      {data && data.length > 0 && (
        <ReactECharts option={option} style={{ height: 360 }} notMerge />
      )}
    </div>
  );
}
