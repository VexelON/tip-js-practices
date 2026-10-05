import { pathToFileURL } from "node:url";

import { createApp } from "./app.js";
import { loadConfig } from "./config.js";
import { createPool } from "./db.js";
import { installLifecycle, createRequestTracker } from "./lifecycle.js";
import { createLogger } from "./logger.js";
import { createStore } from "./store.js";

const isEntry =
  process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isEntry) {
  const config = loadConfig();
  const pool = createPool(config.databaseUrl);
  const store = createStore(pool);
  const logger = createLogger();
  const tracker = createRequestTracker();
  let accepting = true;

  const app = createApp({
    store,
    enableDebugReset: config.enableDebugReset,
    logger,
    tracker,
    releaseVersion: config.releaseVersion,
    getReady: () => accepting,
  });

  const server = app.listen(config.port, config.host, () => {
    logger.info("listen", { host: config.host, port: config.port });
  });

  const lifecycle = installLifecycle({
    server,
    pool,
    tracker,
    logger,
    timeoutMs: config.shutdownTimeoutMs,
    onStop: () => {
      accepting = false;
    },
  });

  app.locals.lifecycle = lifecycle;
}
