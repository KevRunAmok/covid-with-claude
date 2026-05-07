import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchCounties, getCounty } from "../api/client";
import type { CountySearchResult } from "../api/client";
import CountyChart from "../components/CountyChart";
import "./Landing.css";

export default function Landing() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCounty, setSelectedCounty] = useState<CountySearchResult | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const { data: results = [], isFetching } = useQuery({
    queryKey: ["counties", debouncedSearch],
    queryFn: () => searchCounties(debouncedSearch),
    enabled: debouncedSearch.length >= 1,
  });

  const { data: detail, isFetching: detailLoading } = useQuery({
    queryKey: ["county", selectedCounty?.usa_counties_id],
    queryFn: () => getCounty(selectedCounty!.usa_counties_id),
    enabled: !!selectedCounty,
  });

  function handleSelect(county: CountySearchResult) {
    setSelectedCounty(county);
    setSearch(`${county.usa_counties_name}, ${county.usa_states_short}`);
    setDropdownOpen(false);
  }

  return (
    <div className="landing">
      <header className="landing-header">
        <h1>COVID-19 US Data Explorer</h1>
        <p>Search for a county to view its details</p>
      </header>

      <main className="landing-main">
        <div className="search-section">
          <label htmlFor="county-search" className="search-label">
            Select County
          </label>
          <div className="search-wrapper" ref={wrapperRef}>
            <input
              id="county-search"
              type="text"
              className="search-input"
              placeholder="Type a county name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setDropdownOpen(true);
                if (e.target.value !== `${selectedCounty?.usa_counties_name}, ${selectedCounty?.usa_states_short}`) {
                  setSelectedCounty(null);
                }
              }}
              onFocus={() => setDropdownOpen(true)}
              autoComplete="off"
            />
            {isFetching && <span className="search-spinner" />}

            {dropdownOpen && results.length > 0 && (
              <ul className="dropdown">
                {results.map((c) => (
                  <li
                    key={c.usa_counties_id}
                    className={`dropdown-item ${selectedCounty?.usa_counties_id === c.usa_counties_id ? "selected" : ""}`}
                    onMouseDown={() => handleSelect(c)}
                  >
                    <span className="county-name">{c.usa_counties_name}</span>
                    <span className="state-badge">{c.usa_states_short}</span>
                  </li>
                ))}
              </ul>
            )}

            {dropdownOpen && debouncedSearch.length >= 1 && !isFetching && results.length === 0 && (
              <div className="dropdown dropdown-empty">No counties found</div>
            )}
          </div>
        </div>

        {selectedCounty && (
          <div className="detail-section">
            <h2 className="detail-title">
              {selectedCounty.usa_counties_name} County
              <span className="detail-state">{selectedCounty.usa_states_name}</span>
            </h2>

            {detailLoading ? (
              <div className="detail-loading">Loading...</div>
            ) : detail ? (
              <table className="detail-table">
                <thead>
                  <tr>
                    <th>Attribute</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(detail).map(([key, value]) => (
                    <tr key={key}>
                      <td className="attr-name">{key}</td>
                      <td className="attr-value">
                        {value === null
                          ? <span className="null-value">—</span>
                          : typeof value === "number" && key === "Population"
                          ? value.toLocaleString()
                          : String(value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : null}

            <CountyChart
              countyId={selectedCounty.usa_counties_id}
              countyName={`${selectedCounty.usa_counties_name}, ${selectedCounty.usa_states_short}`}
            />
          </div>
        )}
      </main>
    </div>
  );
}
