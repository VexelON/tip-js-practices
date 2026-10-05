import { ApiError } from "./errors.js";
import { jsonBody, requireJsonObject } from "./json-body.js";
import { requireTask } from "./task-resource.js";
import { validateTaskInput } from "./task-validation.js";

export function registerWriteRoutes(router, store) {
  function categoryIds() {
    return new Set(store.listCategories().map((item) => item.id));
  }

  router.post("/tasks", ...jsonBody(), requireJsonObject, (req, res, next) => {
    try {
      const value = validateTaskInput(req.body, { partial: false, categoryIds: categoryIds() });
      const task = store.createTask(value);

      res.set("Location", `/api/tasks/${task.id}`);
      res.status(201).json({ data: task });
    } catch (error) {
      next(error);
    }
  });

  router.patch("/tasks/:id", requireTask(store), ...jsonBody(), requireJsonObject, (req, res, next) => {
    try {
      const changes = validateTaskInput(req.body, { partial: true, categoryIds: categoryIds() });
      const task = store.updateTask(req.task.id, changes);

      if (task === null) {
        next(new ApiError(404, "TASK_NOT_FOUND", "Задача не найдена.", { id: req.task.id }));
        return;
      }

      res.status(200).json({ data: task });
    } catch (error) {
      next(error);
    }
  });

  router.delete("/tasks/:id", requireTask(store), (req, res, next) => {
    const removed = store.deleteTask(req.task.id);

    if (!removed) {
      next(new ApiError(404, "TASK_NOT_FOUND", "Задача не найдена.", { id: req.task.id }));
      return;
    }

    res.status(204).end();
  });
}
