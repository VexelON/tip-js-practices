import { mapDatabaseError } from "./db-errors.js";
import { ApiError } from "./errors.js";
import { jsonBody, requireJsonObject } from "./json-body.js";
import { requireTask } from "./task-resource.js";
import { validateTaskInput } from "./task-validation.js";

export function registerWriteRoutes(router, store) {
  async function categoryIds() {
    const categories = await store.listCategories();
    return new Set(categories.map((item) => item.id));
  }

  router.post("/tasks", ...jsonBody(), requireJsonObject, async (req, res, next) => {
    try {
      const value = validateTaskInput(req.body, {
        partial: false,
        categoryIds: await categoryIds(),
      });
      const task = await store.createTask(value);

      res.set("Location", `/api/tasks/${task.id}`);
      res.status(201).json({ data: task });
    } catch (error) {
      next(error instanceof ApiError ? error : mapDatabaseError(error));
    }
  });

  router.patch(
    "/tasks/:id",
    requireTask(store),
    ...jsonBody(),
    requireJsonObject,
    async (req, res, next) => {
      try {
        const changes = validateTaskInput(req.body, {
          partial: true,
          categoryIds: await categoryIds(),
        });
        const task = await store.updateTask(req.task.id, changes);

        if (task === null) {
          next(new ApiError(404, "TASK_NOT_FOUND", "Задача не найдена.", { id: req.task.id }));
          return;
        }

        res.status(200).json({ data: task });
      } catch (error) {
        next(error instanceof ApiError ? error : mapDatabaseError(error));
      }
    },
  );

  router.delete("/tasks/:id", requireTask(store), async (req, res, next) => {
    try {
      const removed = await store.deleteTask(req.task.id);

      if (!removed) {
        next(new ApiError(404, "TASK_NOT_FOUND", "Задача не найдена.", { id: req.task.id }));
        return;
      }

      res.status(204).end();
    } catch (error) {
      next(error instanceof ApiError ? error : mapDatabaseError(error));
    }
  });
}
