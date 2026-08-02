import * as outageEventRepository from "../repositories/outageEvent.repository";
import { OutageEvent } from "../models/outageEvent";

const DEFAULT_HISTORY_LIMIT = 50;
const MAX_HISTORY_LIMIT = 200;

export async function getOutageHistory(limit?: number): Promise<OutageEvent[]> {
  const safeLimit = Math.min(
    Math.max(1, limit ?? DEFAULT_HISTORY_LIMIT),
    MAX_HISTORY_LIMIT,
  );
  return outageEventRepository.getRecentOutageEvents(safeLimit);
}
