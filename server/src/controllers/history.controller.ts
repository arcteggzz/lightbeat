import { Request, Response, NextFunction } from "express";
import * as service from "../services/outageEvent.service";
import { logger } from "../utils/logger";

export async function getHistory(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    logger.info("Controller: GET /history");
    const rawLimit = req.query["limit"];
    const parsedLimit =
      typeof rawLimit === "string" && rawLimit.trim() !== ""
        ? parseInt(rawLimit, 10)
        : undefined;
    const limit =
      parsedLimit !== undefined && !Number.isNaN(parsedLimit)
        ? parsedLimit
        : undefined;

    const history = await service.getOutageHistory(limit);
    res.status(200).json({ success: true, data: history });
  } catch (err) {
    next(err);
  }
}
