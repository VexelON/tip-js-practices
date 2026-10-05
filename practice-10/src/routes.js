import { Router } from "express";

import { ApiError } from "./errors.js";
import { parseFilters, parsePositiveId } from "./validation.js";
import { registerWriteRoutes } from "./write-routes.js";

function rejectMethod(allow) {
  return (req, res, next) => {
    res.set("Allow", allow);
    next(new ApiError(405, "METHOD_NOT_ALLOWED", "Метод не поддерживается."));
  };
}

export function createRoutes(store, options = {}) {
  const router = Router();

  router.get("/health", (req, res) => {
    res.status(200).json({ data: { status: "ok" } });
  });

  router.get("/categories", (req, res) => {
    const data = store.listCategories();
    res.status(200).json({ data, meta: { total: data.length } });
  });

  router.get("/tasks", (req, res) => {
    const url = new URL(req.originalUrl, "http://localhost");
    const filters = parseFilters(url.searchParams);
    const data = store.listTasks(filters);

    res.status(200).json({
      data,
      meta: { total: data.length, filters },
    });
  });

  router.get("/tasks/:id", (req, res, next) => {
    const id = parsePositiveId(req.params.id);

    if (id === null) {
      next(new ApiError(400, "INVALID_ID", "Идентификатор задачи указан неверно."));
      return;
    }

    const task = store.getTask(id);

    if (task === null) {
      next(new ApiError(404, "TASK_NOT_FOUND", "Задача не найдена.", { id }));
      return;
    }

    res.status(200).json({ data: task });
  });

  registerWriteRoutes(router, store);

  if (options.enableDebugReset) {
    router.post("/debug/reset", (req, res) => {
      const result = store.reset(options.seed);
      res.status(200).json({ data: result });
    });
  }

  router.all("/health", rejectMethod("GET, HEAD, OPTIONS"));
  router.all("/categories", rejectMethod("GET, HEAD, OPTIONS"));
  router.all("/tasks", rejectMethod("GET, HEAD, POST, OPTIONS"));
  router.all("/tasks/:id", rejectMethod("GET, HEAD, PATCH, DELETE, OPTIONS"));

  if (options.enableDebugReset) {
    router.all("/debug/reset", rejectMethod("POST, OPTIONS"));
  }

  return router;
}
