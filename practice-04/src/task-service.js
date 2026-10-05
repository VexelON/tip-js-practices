// Перенесённый из ПР2 сервис задач. В ПР4 добавляется updateTask.
// TODO: перенести собственную реализацию из practice-03/src/task-service.js.

export function createTask(id, title, priority = "medium") {
  throw new Error("Не реализовано: createTask");
}

export function findTaskById(tasks, id) {
  throw new Error("Не реализовано: findTaskById");
}

export function getPendingTasks(tasks) {
  throw new Error("Не реализовано: getPendingTasks");
}

export function getTaskTitles(tasks) {
  throw new Error("Не реализовано: getTaskTitles");
}

export function getTaskStats(tasks) {
  throw new Error("Не реализовано: getTaskStats");
}

export function addTask(tasks, id, title, priority = "medium") {
  throw new Error("Не реализовано: addTask");
}

export function setTaskCompleted(tasks, id, completed) {
  throw new Error("Не реализовано: setTaskCompleted");
}

export function renameTask(tasks, id, title) {
  throw new Error("Не реализовано: renameTask");
}

// Задание 3. Меняются только title и priority; id и completed сохраняются.
export function updateTask(tasks, id, title, priority) {
  throw new Error("Не реализовано: updateTask");
}

export function removeTask(tasks, id) {
  throw new Error("Не реализовано: removeTask");
}
