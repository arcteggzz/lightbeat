import { pool } from "../config/database";
import { Heartbeat } from "../models/heartbeat";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { logger } from "../utils/logger";

export async function getLatestHeartbeat(): Promise<Heartbeat | null> {
  logger.info("Repository: fetching latest heartbeat");
  const [rows] = await pool.execute<Heartbeat[] & RowDataPacket[]>(
    "SELECT * FROM Heartbeats ORDER BY DateCreated DESC LIMIT 1",
  );
  return rows.length > 0 ? rows[0] : null;
}

export async function getFirstHeartbeat(): Promise<Heartbeat | null> {
  logger.info("Repository: fetching first heartbeat");
  const [rows] = await pool.execute<Heartbeat[] & RowDataPacket[]>(
    "SELECT * FROM Heartbeats ORDER BY DateCreated ASC LIMIT 1",
  );
  return rows.length > 0 ? rows[0] : null;
}

export async function createHeartbeat(
  deviceId: string,
  network: string,
): Promise<Heartbeat> {
  logger.info({ deviceId, network }, "Repository: creating heartbeat");
  // DateCreated is supplied by the app rather than DB's NOW(6) — the DB
  // host's clock has been observed to drift from true UTC.
  const dateCreated = new Date();
  const [result] = await pool.execute<ResultSetHeader>(
    "INSERT INTO Heartbeats (DeviceId, Network, DateCreated) VALUES (?, ?, ?)",
    [deviceId, network, dateCreated],
  );
  return {
    Id: result.insertId,
    DeviceId: deviceId,
    Network: network,
    DateCreated: dateCreated,
  };
}
