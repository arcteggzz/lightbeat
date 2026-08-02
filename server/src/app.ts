import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import pinoHttp from "pino-http";
import { logger } from "./utils/logger";
import { errorHandler } from "./middlewares/errorHandler";
import heartbeatRoutes from "./routes/heartbeat.routes";

const app = express();

// ─── Security middleware ──────────────────────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,
    message: {
      success: false,
      error: { code: "RATE_LIMIT", message: "Too many requests" },
    },
  }),
);

// ─── Request logging ──────────────────────────────────────────────────────────
app.use(
  pinoHttp({
    logger,
    serializers: {
      req: (req) => ({
        method: req.method,
        url: req.url,
        host: req.headers?.host,
      }),
      res: (res) => ({
        statusCode: res.statusCode,
      }),
    },
  }),
);

// ─── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/heartbeat", heartbeatRoutes);

// ─── Error handler (must be last) ────────────────────────────────────────────
app.use(errorHandler);

export default app;
