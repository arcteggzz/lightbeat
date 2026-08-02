import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const env = {
  port: parseInt(process.env.PORT || "5000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  logLevel: process.env.LOG_LEVEL || "info",
  appUrl: process.env.APP_URL || "http://localhost:5000",

  db: {
    host: process.env.DB_HOST || "",
    port: parseInt(process.env.DB_PORT || "3306", 10),
    user: process.env.DB_USER || "",
    password: process.env.DB_PASSWORD || "",
    name: process.env.DB_NAME || "",
  },
};

export function validateEnv(): void {
  const required: [string, string][] = [
    ["DB_HOST", env.db.host],
    ["DB_USER", env.db.user],
    ["DB_PASSWORD", env.db.password],
    ["DB_NAME", env.db.name],
  ];

  const missing = required.filter(([, value]) => !value).map(([name]) => name);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n  ${missing.join("\n  ")}`,
    );
  }
}
