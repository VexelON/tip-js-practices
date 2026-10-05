// Проверка черновика формы. Функция чистая: она не обращается к DOM и к хранилищу,
// не изменяет переданные данные и возвращает все найденные ошибки сразу.

const PRIORITIES = ["low", "medium", "high"];
const TITLE_MIN_LENGTH = 1;
const TITLE_MAX_LENGTH = 100;

/**
 * @param {{ id: unknown, title: unknown, priority: unknown }} draft значения полей формы
 * @param {Array<{ id: number }>} tasks текущий список задач
 * @param {number|null} editingId идентификатор редактируемой записи или null при создании
 */
export function validateTaskDraft(draft, tasks, editingId = null) {
  const errors = {};

  const rawId = typeof draft.id === "string" ? draft.id.trim() : draft.id;
  let id = null;

  if (editingId !== null) {
    // В режиме редактирования идентификатор берётся из состояния формы, а не из поля ввода.
    if (!Number.isSafeInteger(editingId) || editingId <= 0) {
      errors.id = "Идентификатор редактируемой задачи некорректен.";
    } else if (tasks.find((task) => task.id === editingId) === undefined) {
      errors.id = "Редактируемая задача не найдена.";
    } else {
      id = editingId;
    }
  } else if (rawId === "" || rawId === null || rawId === undefined) {
    errors.id = "Укажите идентификатор задачи.";
  } else {
    const parsed = Number(rawId);

    if (!Number.isSafeInteger(parsed) || parsed <= 0) {
      errors.id = "Идентификатор должен быть положительным целым числом.";
    } else if (tasks.find((task) => task.id === parsed) !== undefined) {
      errors.id = "Задача с таким идентификатором уже существует.";
    } else {
      id = parsed;
    }
  }

  let title = "";

  if (typeof draft.title !== "string") {
    errors.title = "Название должно быть строкой.";
  } else {
    title = draft.title.trim();

    if (title.length < TITLE_MIN_LENGTH) {
      errors.title = "Укажите название задачи.";
    } else if (title.length > TITLE_MAX_LENGTH) {
      errors.title = `Название не должно превышать ${TITLE_MAX_LENGTH} символов.`;
    }
  }

  if (!PRIORITIES.includes(draft.priority)) {
    errors.priority = `Выберите приоритет: ${PRIORITIES.join(", ")}.`;
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, value: { id, title, priority: draft.priority } };
}
