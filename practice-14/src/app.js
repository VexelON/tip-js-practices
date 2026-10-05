import express from "express";

import { loadConfig } from "./config.js";
import { createPool } from "./db.js";
import { ApiError, errorHandler } from "./errors.js";
import { createHealthRouter } from "./health.js";
import { requestLogger } from "./logger.js";
import { jsonErrorHandler } from "./json-body.js";
import { createRoutes } from "./routes.js";
import { createStore } from "./store.js";

function applyCommonHeaders(req, res, next) {
  res.set({
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, HEAD, POST, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Accept, Content-Type",
    "Access-Control-Expose-Headers": "Location",
  });

  if (req.method !== "HEAD" && req.method !== "OPTIONS") {
    res.type("application/json; charset=utf-8");
  }

  next();
}

function handleOptions(req, res, next) {
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  next();
}

export function createApp(options = {}) {
  const store = options.store ?? createStore(options.pool);
  const enableDebugReset = options.enableDebugReset ?? true;
  const app = express();
  const releaseVersion = options.releaseVersion ?? "1.0.0";

  app.disable("x-powered-by");
  app.use(applyCommonHeaders);
  app.use(handleOptions);

  if (options.logger && options.tracker) {
    app.use(requestLogger(options.logger, options.tracker));
  }

  app.use(
    "/health",
    createHealthRouter({
      store,
      releaseVersion,
      getReady: options.getReady,
    }),
  );
  app.use("/api", createRoutes(store, { enableDebugReset }));
  app.use(jsonErrorHandler);
  app.use((req, res, next) => next(new ApiError(404, "ROUTE_NOT_FOUND", "Маршрут не найден.")));
  app.use(errorHandler);

  return app;
}

export function createAppFromEnv(env = process.env) {
  const config = loadConfig(env);
  const pool = createPool(config.databaseUrl);
  const app = createApp({
    pool,
    enableDebugReset: config.enableDebugReset,
  });

  app.locals.pool = pool;
  app.locals.config = config;

  return app;
}
