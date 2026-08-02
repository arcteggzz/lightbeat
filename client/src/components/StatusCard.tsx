import type { PowerStatus } from "../types";
import { UptimeTimer } from "./UptimeTimer";
import { formatDateTime } from "../format";

const COPY: Record<
  PowerStatus,
  { emoji: string; title: string; sinceLabel: string; sincePrefix: string }
> = {
  up: { emoji: "💡", title: "We've got light!", sinceLabel: "On for", sincePrefix: "since it came back at" },
  down: { emoji: "🌑", title: "Power's out!", sinceLabel: "Out for", sincePrefix: "since it went out at" },
  unknown: { emoji: "❓", title: "No signal yet...", sinceLabel: "", sincePrefix: "" },
};

export function StatusCard({
  status,
  since,
}: {
  status: PowerStatus;
  since: string | null;
}) {
  const { emoji, title, sinceLabel, sincePrefix } = COPY[status];

  return (
    <div className={`status-card status-card--${status}`}>
      <div className="status-emoji">{emoji}</div>
      <h1 className="status-title">{title}</h1>
      {since && (
        <>
          <p className="status-subtitle">
            {sinceLabel} <UptimeTimer since={since} />
          </p>
          <p className="status-since">
            {sincePrefix} {formatDateTime(since)}
          </p>
        </>
      )}
    </div>
  );
}
