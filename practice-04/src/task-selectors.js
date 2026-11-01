// Вычисление выборки по фильтру. Модуль не изменяет входные задачи и не работает с DOM.

export const TASK_FILTERS = ["all", "pending", "completed"];

export function getVisibleTasks(tasks, filter = "all") {
  if (filter === "pending") {
    return tasks.filter((task) => task.completed === false);
  }

  if (filter === "completed") {
    return tasks.filter((task) => task.completed === true);
  }

  return tasks.filter(() => true);
}