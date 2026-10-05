// Вычисление выборки по фильтру. Модуль не изменяет входные задачи и не работает с DOM.

export const TASK_FILTERS = ["all", "pending", "completed"];

export function getVisibleTasks(tasks, filter = "all") {
  throw new Error("Не реализовано: getVisibleTasks");
}
