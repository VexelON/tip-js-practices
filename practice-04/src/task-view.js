// Создание и обновление DOM. Модуль не изменяет задачи и не назначает обработчики событий.
// TODO: перенести реализацию из practice-03/src/task-view.js и добавить в карточку
// третью кнопку data-action="edit" с вложенным span.action-label и текстом «Изменить».

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
