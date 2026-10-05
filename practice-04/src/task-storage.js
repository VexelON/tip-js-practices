// Задание 5. Локальное хранение списка задач.
// Модуль работает с переданным объектом storage, а не с глобальным localStorage,
// перехватывает исключения и не использует localStorage.clear().

export const STORAGE_VERSION = 1;

// TODO: проверить весь массив и уникальность id. Нормализация не выполняется.
export function isValidTaskList(value) {
  throw new Error("Не реализовано: isValidTaskList");
}

// TODO: source — "initial" (ключа нет), "storage" (данные прочитаны),
// "fallback" (исключение, ошибка JSON, версии или схемы).
export function loadTasks(storage, key, fallbackTasks) {
  throw new Error("Не реализовано: loadTasks");
}

// TODO: сначала проверить список, затем записать { version: 1, tasks }.
export function saveTasks(storage, key, tasks) {
  throw new Error("Не реализовано: saveTasks");
}

// TODO: удалить ровно один ключ и вернуть результат операции.
export function removeSavedTasks(storage, key) {
  throw new Error("Не реализовано: removeSavedTasks");
}
