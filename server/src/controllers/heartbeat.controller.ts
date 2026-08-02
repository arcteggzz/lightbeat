import { Request, Response, NextFunction } from "express";
import * as service from "../services/heartbeat.service";
import { ValidationError } from "../middlewares/errorHandler";
import { logger } from "../utils/logger";

export async function heartbeat(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    logger.info("Controller: POST /heartbeat");
    const { deviceId, network } = req.body ?? {};
    if (typeof deviceId !== "string" || !deviceId) {
      throw new ValidationError("deviceId is required");
    }
    if (typeof network !== "string" || !network) {
      throw new ValidationError("network is required");
    }

    const heartbeat = await service.recordHeartbeat(deviceId, network);
    res.status(201).json({ success: true, data: heartbeat });
  } catch (err) {
    next(err);
  }
}
