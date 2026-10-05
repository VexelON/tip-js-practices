// Демонстрационный сценарий. Прикладная логика остаётся в task-service.js:
// здесь выполняется только последовательность действий, вывод и обработка отказов.

import { demoTasks, variantNumber, variantTasks } from "./data.js";
import {
  addTask,
  getPendingTasks,
  getTaskStats,
  getTaskTitles,
  removeTask,
  renameTask,
  setTaskCompleted,
} from "./task-service.js";
import { getPrioritySummary } from "./task-extra.js";

function printStats(label, tasks) {
  const { total, completed, pending, progress } = getTaskStats(tasks);

  console.log(`${label}: всего ${total}; выполнено ${completed}; осталось ${pending}`);

  if (total === 0) {
    console.log("Задач пока нет");
  } else {
    console.log(`Прогресс: ${progress.toFixed(1)}%`);
  }
}

function printTasks(tasks) {
  for (const { id, title, completed, priority } of tasks) {
    const status = completed ? "выполнена" : "в работе";

    console.log(`  #${id} ${title} [${priority}] — ${status}`);
  }
}

/** Применяет результат операции: состояние заменяется только при успехе. */
function apply(label, currentTasks, result) {
  if (result.ok) {
    console.log(`${label}: успешно`);

    return result.tasks;
  }

  console.error(`${label} — Ошибка: ${result.error}`);

  return currentTasks;
}

function runScenario(title, initialTasks, steps) {
  console.log(`\n======== ${title} ========`);

  console.log("\nИсходные задачи:");
  printTasks(initialTasks);
  console.log("Названия:", getTaskTitles(initialTasks));
  console.log("Невыполненные:", getPendingTasks(initialTasks).map((task) => task.id));
  printStats("Исходная сводка", initialTasks);

  let currentTasks = initialTasks;

  for (const step of steps) {
    console.log("");
    currentTasks = apply(step.label, currentTasks, step.run(currentTasks));
    printStats(step.label, currentTasks);
  }

  console.log("\nИтоговые задачи:");
  printTasks(currentTasks);
  console.log("Идентификаторы:", currentTasks.map((task) => task.id));
  printStats("Итоговая сводка", currentTasks);

  console.log("\nИсходный набор сохранён:");
  printTasks(initialTasks);
  console.log("Сводка по приоритетам исходного набора:", getPrioritySummary(initialTasks));

  return currentTasks;
}

runScenario("Общий сценарий", demoTasks, [
  {
    label: 'Добавление задачи 20 "Добавить проверку"',
    run: (tasks) => addTask(tasks, 20, "Добавить проверку", "high"),
  },
  {
    label: "Выполнение задачи 4",
    run: (tasks) => setTaskCompleted(tasks, 4, true),
  },
  {
    label: "Переименование задачи 10",
    run: (tasks) => renameTask(tasks, 10, "Подготовить инструкцию запуска"),
  },
  {
    label: "Удаление задачи 7",
    run: (tasks) => removeTask(tasks, 7),
  },
  {
    label: "Повторное добавление задачи 20 (ожидается отказ)",
    run: (tasks) => addTask(tasks, 20, "Повтор идентификатора", "low"),
  },
  {
    label: "Изменение статуса строкой (ожидается отказ)",
    run: (tasks) => setTaskCompleted(tasks, 4, "true"),
  },
]);

runScenario(`Сценарий индивидуального варианта № ${variantNumber}`, variantTasks, [
  {
    label: 'Добавление задачи 80 "Проверить адаптивную вёрстку"',
    run: (tasks) => addTask(tasks, 80, "Проверить адаптивную вёрстку", "low"),
  },
  {
    label: "Выполнение задачи 11",
    run: (tasks) => setTaskCompleted(tasks, 11, true),
  },
  {
    label: "Переименование задачи 23",
    run: (tasks) => renameTask(tasks, 23, "Проверить отображение и сортировку списка"),
  },
  {
    label: "Удаление задачи 37",
    run: (tasks) => removeTask(tasks, 37),
  },
  {
    label: "Повторное добавление задачи 80 (ожидается отказ)",
    run: (tasks) => addTask(tasks, 80, "Повтор идентификатора", "low"),
  },
]);
