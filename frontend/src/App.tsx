import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Landing from "./pages/Landing";
import MapPage from "./pages/MapPage";
import StateMapPage from "./pages/StateMapPage";
import "./App.css";

const queryClient = new QueryClient();
type Page = "explorer" | "map" | "statemap";

export default function App() {
  const [page, setPage] = useState<Page>("explorer");

  return (
    <QueryClientProvider client={queryClient}>
      <nav className="app-nav">
        <span className="app-nav-brand">COVID-19 Explorer</span>
        <div className="app-nav-tabs">
          <button
            className={`app-nav-tab ${page === "explorer" ? "active" : ""}`}
            onClick={() => setPage("explorer")}
          >
            County Explorer
          </button>
          <button
            className={`app-nav-tab ${page === "map" ? "active" : ""}`}
            onClick={() => setPage("map")}
          >
            US Map
          </button>
          <button
            className={`app-nav-tab ${page === "statemap" ? "active" : ""}`}
            onClick={() => setPage("statemap")}
          >
            State Map
          </button>
        </div>
      </nav>
      {page === "explorer" && <Landing />}
      {page === "map" && <MapPage />}
      {page === "statemap" && <StateMapPage />}
    </QueryClientProvider>
  );
}
