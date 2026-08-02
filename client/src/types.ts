export type PowerStatus = "up" | "down" | "unknown";

export interface StatusData {
  status: PowerStatus;
  since: string | null;
}

export interface OutageEvent {
  Id: number;
  StartedAt: string;
  EndedAt: string;
  DurationSeconds: number;
  DateCreated: string;
}

interface ApiSuccess<T> {
  success: true;
  data: T;
}

interface ApiError {
  success: false;
  error: { code: string; message: string };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
