import { pool } from "../config/database";
import { Heartbeat } from "../models/heartbeat";
import { ResultSetHeader } from "mysql2";
import { logger } from "../utils/logger";

export async function createHeartbeat(
  deviceId: string,
  network: string,
): Promise<Heartbeat> {
  logger.info({ deviceId, network }, "Repository: creating heartbeat");
  const [result] = await pool.execute<ResultSetHeader>(
    "INSERT INTO Heartbeats (DeviceId, Network, DateCreated) VALUES (?, ?, NOW(6))",
    [deviceId, network],
  );
  return {
    Id: result.insertId,
    DeviceId: deviceId,
    Network: network,
    DateCreated: new Date(),
  };
}
