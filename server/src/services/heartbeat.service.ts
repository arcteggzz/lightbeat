import * as repository from "../repositories/heartbeat.repository";
import { Heartbeat } from "../models/heartbeat";

export async function recordHeartbeat(
  deviceId: string,
  network: string,
): Promise<Heartbeat> {
  return repository.createHeartbeat(deviceId, network);
}
