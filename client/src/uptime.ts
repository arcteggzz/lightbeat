import type { OutageEvent } from "./types";

export const UPTIME_WINDOW_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// Simple lifetime-window uptime %: sums how much of the last `windowMs`
// overlaps with known outages. Doesn't know when monitoring actually
// started, so a device that's only been running a few hours will show
// close to 100% until enough history accumulates — acceptable for a
// simple stat, not meant to be a precise SLA number.
export function calculateUptimePercent(
  events: OutageEvent[],
  windowMs: number = UPTIME_WINDOW_MS,
  now: number = Date.now(),
): number {
  const windowStart = now - windowMs;
  let downtimeMs = 0;

  for (const event of events) {
    const start = new Date(event.StartedAt).getTime();
    const end = new Date(event.EndedAt).getTime();
    const overlapStart = Math.max(start, windowStart);
    const overlapEnd = Math.min(end, now);
    if (overlapEnd > overlapStart) {
      downtimeMs += overlapEnd - overlapStart;
    }
  }

  const uptimeMs = Math.max(0, windowMs - downtimeMs);
  return (uptimeMs / windowMs) * 100;
}
