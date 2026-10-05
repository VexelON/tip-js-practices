// Собственные проверочные сценарии (минимум три по заданию 5).
// Общие проверки находятся в checks.js и не дублируются здесь.

import assert from "node:assert/strict";

import { demoTasks, variantTasks } from "./src/data.js";
import {
  addTask,
  getTaskStats,
  removeTask,
  renameTask,
  setTaskCompleted,
} from "./src/task-service.js";
import { getPrioritySummary } from "./src/task-extra.js";

let passedCount = 0;
const failedNames = [];

function check(name, body) {
  try {
    body();
    passedCount += 1;
    console.log(`OK   ${name}`);
  } catch (error) {
    failedNames.push(name);
    console.log(`FAIL ${name}`);
    console.log(`     ${String(error && error.message).split("\n")[0]}`);
  }
}

function ids(tasks) {
  return tasks.map((task) => task.id);
}

console.log("Собственные проверки практической работы № 2\n");

check("Случай 1: добавление после удаления возвращает освободившийся идентификатор", () => {
  const removed = removeTask(demoTasks, 7);
  assert.equal(removed.ok, true);
  assert.deepEqual(ids(removed.tasks), [1, 4, 10]);

  // Пока задача отсутствует, идентификатор 7 снова свободен.
  const restored = addTask(removed.tasks, 7, "Вернуть проверку методов массивов", "low");
  assert.equal(restored.ok, true);
  assert.deepEqual(ids(restored.tasks), [1, 4, 10, 7], "новая запись добавляется в конец");
  assert.equal(restored.tasks[3].completed, false, "восстановленная задача создаётся заново");

  // Повтор того же добавления уже отклоняется.
  assert.equal(addTask(restored.tasks, 7, "Ещё раз", "low").ok, false);
  assert.deepEqual(ids(demoTasks), [1, 4, 7, 10], "исходный набор не изменился");
});

check("Случай 2: последовательное обновление первой и последней записи", () => {
  const first = setTaskCompleted(demoTasks, 1, false);
  assert.equal(first.ok, true);

  const last = renameTask(first.tasks, 10, "  Оформить итоговый README  ");
  assert.equal(last.ok, true);

  assert.equal(last.tasks[0].completed, false);
  assert.equal(last.tasks[3].title, "Оформить итоговый README");
  assert.equal(last.tasks[1], demoTasks[1], "нетронутые записи переиспользуются");
  assert.equal(last.tasks[3].priority, "medium", "остальные поля сохранены");

  assert.equal(demoTasks[0].completed, true, "исходная первая запись сохранена");
  assert.equal(demoTasks[3].title, "Оформить README", "исходная последняя запись сохранена");
});

check("Случай 3: отказ в середине цепочки не повреждает состояние", () => {
  const step1 = addTask(demoTasks, 20, "Добавить проверку", "high");
  assert.equal(step1.ok, true);

  const rejected = renameTask(step1.tasks, 20, "   ");
  assert.equal(rejected.ok, false);

  // Состояние заменяется только при успехе, поэтому продолжаем с step1.tasks.
  const step2 = setTaskCompleted(step1.tasks, 20, true);
  assert.equal(step2.ok, true);

  const stats = getTaskStats(step2.tasks);
  assert.deepEqual(stats, { total: 5, completed: 3, pending: 2, progress: 60 });
  assert.equal(stats.progress.toFixed(1), "60.0");
});

check("Случай 4: полный сценарий варианта 6 даёт ожидаемый итог", () => {
  let tasks = variantTasks;

  tasks = addTask(tasks, 80, "Проверить адаптивную вёрстку", "low").tasks;
  tasks = setTaskCompleted(tasks, 11, true).tasks;
  tasks = renameTask(tasks, 23, "Проверить отображение и сортировку списка").tasks;
  tasks = removeTask(tasks, 37).tasks;

  assert.equal(addTask(tasks, 80, "Повтор", "low").ok, false);
  assert.deepEqual(ids(tasks), [11, 23, 41, 58, 64, 80]);

  const stats = getTaskStats(tasks);
  assert.deepEqual(stats, { total: 6, completed: 4, pending: 2, progress: (4 / 6) * 100 });
  assert.equal(stats.progress.toFixed(1), "66.7");

  assert.deepEqual(ids(variantTasks), [11, 23, 37, 41, 58, 64], "variantTasks сохранён");
});

check("Случай 5 (расширение): сводка по приоритетам общего и пустого наборов", () => {
  assert.deepEqual(getPrioritySummary(demoTasks), {
    low: { total: 1, pending: 1 },
    medium: { total: 2, pending: 0 },
    high: { total: 1, pending: 1 },
  });

  assert.deepEqual(getPrioritySummary([]), {
    low: { total: 0, pending: 0 },
    medium: { total: 0, pending: 0 },
    high: { total: 0, pending: 0 },
  });

  const onlyHigh = [
    { id: 1, title: "Первая", completed: true, priority: "high" },
    { id: 2, title: "Вторая", completed: false, priority: "high" },
  ];

  assert.deepEqual(getPrioritySummary(onlyHigh), {
    low: { total: 0, pending: 0 },
    medium: { total: 0, pending: 0 },
    high: { total: 2, pending: 1 },
  });

  assert.equal(onlyHigh[0].completed, true, "исходные записи не изменились");
});

const total = passedCount + failedNames.length;

console.log(`\nВсего: ${total}. Пройдено: ${passedCount}. Ошибок: ${failedNames.length}.`);

if (failedNames.length > 0) {
  process.exitCode = 1;
}
