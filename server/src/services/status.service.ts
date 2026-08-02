import * as heartbeatRepository from "../repositories/heartbeat.repository";
import * as outageEventRepository from "../repositories/outageEvent.repository";

const OUTAGE_THRESHOLD_MS = 90_000;

export interface CurrentStatus {
  status: "up" | "down" | "unknown";
  since: Date | null;
}

export async function getCurrentStatus(): Promise<CurrentStatus> {
  const latestHeartbeat = await heartbeatRepository.getLatestHeartbeat();
  if (!latestHeartbeat) {
    return { status: "unknown", since: null };
  }

  const gapMs = Date.now() - latestHeartbeat.DateCreated.getTime();
  if (gapMs > OUTAGE_THRESHOLD_MS) {
    return { status: "down", since: latestHeartbeat.DateCreated };
  }

  const lastOutage = await outageEventRepository.getMostRecentOutageEvent();
  if (lastOutage) {
    return { status: "up", since: lastOutage.EndedAt };
  }

  const firstHeartbeat = await heartbeatRepository.getFirstHeartbeat();
  return { status: "up", since: firstHeartbeat ? firstHeartbeat.DateCreated : latestHeartbeat.DateCreated };
}
