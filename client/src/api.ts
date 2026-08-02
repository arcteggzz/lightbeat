import type { ApiResponse, OutageEvent, StatusData } from "./types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`);
  const json = (await res.json()) as ApiResponse<T>;

  if (!json.success) {
    throw new Error(json.error.message);
  }

  return json.data;
}

export function getStatus(): Promise<StatusData> {
  return apiGet<StatusData>("/status");
}

export function getHistory(limit = 20): Promise<OutageEvent[]> {
  return apiGet<OutageEvent[]>(`/history?limit=${limit}`);
}
