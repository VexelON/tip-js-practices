// Создание и обновление DOM. Модуль не изменяет задачи и не назначает обработчики событий.
// Разметка строится только DOM-методами: innerHTML, outerHTML и insertAdjacentHTML не используются.

export function createTaskElement(task) {
  throw new Error("Не реализовано: createTaskElement");
}

export function renderTaskList(listElement, tasks) {
  throw new Error("Не реализовано: renderTaskList");
}

export function renderSummary(summaryElement, tasks, visibleCount) {
  throw new Error("Не реализовано: renderSummary");
}

export function renderEmptyState(messageElement, total, visibleCount) {
  throw new Error("Не реализовано: renderEmptyState");
}
