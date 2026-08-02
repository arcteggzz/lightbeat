import { pool } from "../config/database";
import { OutageEvent } from "../models/outageEvent";
import { RowDataPacket } from "mysql2";
import { logger } from "../utils/logger";

export async function getMostRecentOutageEvent(): Promise<OutageEvent | null> {
  logger.info("Repository: fetching most recent outage event");
  const [rows] = await pool.execute<OutageEvent[] & RowDataPacket[]>(
    "SELECT * FROM OutageEvents ORDER BY EndedAt DESC LIMIT 1",
  );
  return rows.length > 0 ? rows[0] : null;
}

export async function getRecentOutageEvents(limit: number): Promise<OutageEvent[]> {
  logger.info({ limit }, "Repository: fetching recent outage events");
  // LIMIT is inlined (not a placeholder) since mysql2's execute() doesn't
  // support parameterized LIMIT; caller is responsible for passing a safe integer.
  const [rows] = await pool.query<OutageEvent[] & RowDataPacket[]>(
    `SELECT * FROM OutageEvents ORDER BY StartedAt DESC LIMIT ${limit}`,
  );
  return rows;
}
