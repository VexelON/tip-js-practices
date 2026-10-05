// Задание 4. Чистая проверка черновика формы.
// Функция не обращается к document, к форме и к localStorage, не изменяет входные значения
// и возвращает все найденные ошибки сразу.
//
// Успех:  { ok: true, value: { id, title, priority } }
// Отказ:  { ok: false, errors: { id?, title?, priority? } }
//
// В режиме редактирования draft.id не используется: источником id является editingId.

export function validateTaskDraft(draft, tasks, editingId = null) {
  throw new Error("Не реализовано: validateTaskDraft");
}
