// Дополнительное задание, вариант Б. Сводка по приоритетам.
// Контракт: getPrioritySummary(tasks) -> { low: { total, pending }, medium: {...}, high: {...} }.
// Все три приоритета присутствуют в результате, даже если соответствующих задач нет.
// Исходный массив и его объекты не изменяются.

const PRIORITIES = ["low", "medium", "high"];

export function getPrioritySummary(tasks) {
  const summary = {};

  for (const priority of PRIORITIES) {
    const selected = tasks.filter((task) => task.priority === priority);

    summary[priority] = {
      total: selected.length,
      pending: selected.filter((task) => task.completed === false).length,
    };
  }

  return summary;
}
