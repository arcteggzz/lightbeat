import type { OutageEvent } from "../types";
import { formatDuration, formatDateTime } from "../format";

export function HistoryList({ events }: { events: OutageEvent[] }) {
  if (events.length === 0) {
    return <p className="history-empty">No outages recorded yet. Long may it last! 🎉</p>;
  }

  return (
    <ul className="history-list">
      {events.map((event) => (
        <li key={event.Id} className="history-item">
          <span className="history-icon">⚡</span>
          <div className="history-details">
            <div className="history-range">
              {formatDateTime(event.StartedAt)} → {formatDateTime(event.EndedAt)}
            </div>
            <div className="history-duration">{formatDuration(event.DurationSeconds)} without power</div>
          </div>
        </li>
      ))}
    </ul>
  );
}
