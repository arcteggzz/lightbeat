import { Request, Response, NextFunction } from "express";
import * as service from "../services/status.service";
import { logger } from "../utils/logger";

export async function getStatus(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    logger.info("Controller: GET /status");
    const status = await service.getCurrentStatus();
    res.status(200).json({ success: true, data: status });
  } catch (err) {
    next(err);
  }
}
