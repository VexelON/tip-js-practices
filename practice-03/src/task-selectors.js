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

// Дополнительное задание, вариант А: отбор по приоритету.
// Значение "all" означает «любой приоритет». Фильтры по статусу и приоритету
// применяются совместно, поэтому отбор возвращает новый массив и здесь.
export const PRIORITY_FILTERS = ["all", "low", "medium", "high"];

export function getTasksByPriority(tasks, priority = "all") {
  if (priority === "all") {
    return tasks.filter(() => true);
  }

  return tasks.filter((task) => task.priority === priority);
}
