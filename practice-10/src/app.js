import express from "express";

import { categories, tasks } from "./data.js";
import { ApiError, errorHandler } from "./errors.js";
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

function guardUriEncoding(req, res, next) {
  try {
    decodeURIComponent(req.path);
    next();
  } catch {
    next(new ApiError(400, "INVALID_ID", "Идентификатор задачи указан неверно."));
  }
}

export function createApp(options = {}) {
  const seed = options.seed ?? { categories, tasks };
  const store = options.store ?? createStore(seed);
  const app = express();

  app.disable("x-powered-by");
  app.use(applyCommonHeaders);
  app.use(handleOptions);
  app.use(guardUriEncoding);
  app.use("/api", createRoutes(store, { enableDebugReset: true, seed }));
  app.use(jsonErrorHandler);

  app.use((req, res, next) => {
    next(new ApiError(404, "ROUTE_NOT_FOUND", "Маршрут не найден."));
  });

  app.use(errorHandler);

  return app;
}
