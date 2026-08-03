export function UptimeStat({ percent }: { percent: number }) {
  return (
    <div className="uptime-stat">
      <span className="uptime-stat-icon">📈</span>
      <span className="uptime-stat-value">{percent.toFixed(1)}%</span>
      <span className="uptime-stat-label">uptime — last 7 days</span>
    </div>
  );
}
