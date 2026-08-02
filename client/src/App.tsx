import { useEffect, useState } from "react";
import "./App.css";
import { getHistory, getStatus } from "./api";
import { StatusCard } from "./components/StatusCard";
import { HistoryList } from "./components/HistoryList";
import type { OutageEvent, StatusData } from "./types";

const STATUS_POLL_MS = 15_000;
const HISTORY_POLL_MS = 60_000;

function App() {
  const [status, setStatus] = useState<StatusData | null>(null);
  const [history, setHistory] = useState<OutageEvent[]>([]);
  const [statusError, setStatusError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadStatus() {
      try {
        const data = await getStatus();
        if (!cancelled) {
          setStatus(data);
          setStatusError(false);
        }
      } catch {
        if (!cancelled) setStatusError(true);
      }
    }

    loadStatus();
    const id = setInterval(loadStatus, STATUS_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadHistory() {
      try {
        const data = await getHistory(20);
        if (!cancelled) setHistory(data);
      } catch {
        // history is secondary — fail quietly, status card is what matters most
      }
    }

    loadHistory();
    const id = setInterval(loadHistory, HISTORY_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return (
    <div className={`app app--${status?.status ?? "unknown"}`}>
      <header className="app-header">
        <span className="app-logo">⚡</span>
        <span className="app-name">lightbeat</span>
      </header>

      <main className="app-main">
        {statusError && (
          <p className="error-banner">Couldn't reach the server — trying again...</p>
        )}

        {status ? (
          <StatusCard status={status.status} since={status.since} />
        ) : (
          <div className="status-card status-card--unknown">
            <div className="status-emoji">⏳</div>
            <h1 className="status-title">Checking...</h1>
          </div>
        )}

        <section className="history-section">
          <h2>Recent outages</h2>
          <HistoryList events={history} />
        </section>
      </main>
    </div>
  );
}

export default App;
