import { ApiError } from "./errors.js";
import { parsePositiveId } from "./validation.js";

export function requireTask(store) {
  return (req, res, next) => {
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

    req.task = task;
    next();
  };
}
