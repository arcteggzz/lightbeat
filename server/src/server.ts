import app from "./app";
import { env, validateEnv } from "./config/env";
import { logger } from "./utils/logger";
import { testDatabaseConnection } from "./config/database";

async function bootstrap(): Promise<void> {
  validateEnv();
  logger.info("Environment validated successfully");

  // Verify DB connection before starting
  await testDatabaseConnection();

  // Start HTTP server
  app.listen(env.port, () => {
    logger.info({ port: env.port, env: env.nodeEnv }, "Server started");
  });
}

bootstrap().catch((err) => {
  logger.error({ err }, "Failed to start server");
  process.exit(1);
});
