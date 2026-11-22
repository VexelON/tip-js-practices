import assert from "node:assert/strict";
import { test } from "node:test";

import {
  addTask,
  getTaskStats,
  nextTaskId,
  removeTask,
  selectTasks,
  toggleTask,
  updateTask,
  validateTaskDraft,
} from "../src/domain/task-service.js";
import { categories, tasks as seed } from "../src/data.js";
import { createInitialFilters, variantNumber } from "../src/variant.js";

const demo = () => seed.map((task) => ({ ...task }));
const ids = (items) => items.map((task) => task.id);
const cats = () => categories.map((item) => ({ ...item }));

test("validateTaskDraft: принимает нормализованный черновик", () => {
  const result = validateTaskDraft({ title: "  Новая  ", priority: "high", categoryId: "2" }, cats());

  assert.equal(result.valid, true);
  assert.deepEqual(result.value, { title: "Новая", priority: "high", categoryId: 2 });
  assert.deepEqual(result.errors, {});
});

test("validateTaskDraft: отклоняет пробелы", () => {
  const result = validateTaskDraft({ title: "   ", priority: "low", categoryId: 1 }, cats());

  assert.equal(result.valid, false);
  assert.ok(result.errors.title);
});

test("validateTaskDraft: отклоняет слишком длинное название", () => {
  const result = validateTaskDraft({ title: "x".repeat(101), priority: "low", categoryId: 1 }, cats());

  assert.equal(result.valid, false);
});

test("validateTaskDraft: граница 100 символов допустима", () => {
  const result = validateTaskDraft({ title: "x".repeat(100), priority: "low", categoryId: 1 }, cats());

  assert.equal(result.valid, true);
});

test("validateTaskDraft: не принимает '2x' как категорию 2", () => {
  const result = validateTaskDraft({ title: "Задача", priority: "low", categoryId: "2x" }, cats());

  assert.equal(result.valid, false);
  assert.ok(result.errors.categoryId);
});

test("validateTaskDraft: неизвестная категория и приоритет возвращаются вместе", () => {
  const result = validateTaskDraft({ title: "", priority: "urgent", categoryId: 9 }, cats());

  assert.equal(result.valid, false);
  assert.ok(result.errors.title);
  assert.ok(result.errors.priority);
  assert.ok(result.errors.categoryId);
});

test("validateTaskDraft: нестроковое название — ошибка", () => {
  const result = validateTaskDraft({ title: null, priority: "low", categoryId: 1 }, cats());

  assert.equal(result.valid, false);
  assert.ok(result.errors.title);
});

test("selectTasks: пустые фильтры возвращают все задачи в исходном порядке", () => {
  assert.deepEqual(
    ids(selectTasks(demo(), { q: "", completed: "", priority: "", categoryId: "" })),
    ids(demo())
  );
});

test("selectTasks: completed=false", () => {
  assert.deepEqual(ids(selectTasks(demo(), { completed: "false", q: "", priority: "", categoryId: "" })), [4, 7, 13, 19, 22, 28, 34]);
});

test("selectTasks: Boolean('false') не используется — строка 'false' работает", () => {
  const visible = selectTasks(demo(), { completed: "false", q: "", priority: "", categoryId: "" });

  assert.equal(visible.every((task) => task.completed === false), true);
});

test("selectTasks: priority=high", () => {
  assert.deepEqual(ids(selectTasks(demo(), { q: "", completed: "", priority: "high", categoryId: "" })), [4, 13, 16, 25, 34]);
});

test("selectTasks: categoryId=2", () => {
  assert.deepEqual(ids(selectTasks(demo(), { q: "", completed: "", priority: "", categoryId: "2" })), [4, 16, 22, 25, 28, 34]);
});

test("selectTasks: поиск без учёта регистра", () => {
  assert.deepEqual(ids(selectTasks(demo(), { q: "ПРОВЕР", completed: "", priority: "", categoryId: "" })), [7, 16]);
});

test("selectTasks: фильтры объединяются через И", () => {
  assert.deepEqual(
    ids(selectTasks(demo(), { q: "", completed: "false", priority: "high", categoryId: "2" })),
    [4, 34]
  );
});

test("selectTasks: не изменяет входной массив", () => {
  const tasks = demo();
  const before = JSON.stringify(tasks);

  selectTasks(tasks, { completed: "true", q: "", priority: "", categoryId: "" });
  assert.equal(JSON.stringify(tasks), before);
});

test("getTaskStats: полный набор", () => {
  assert.deepEqual(getTaskStats(demo()), { total: 12, completed: 5, active: 7 });
});

test("getTaskStats: пустой набор", () => {
  assert.deepEqual(getTaskStats([]), { total: 0, completed: 0, active: 0 });
});

test("addTask: добавляет в конец с completed false", () => {
  const next = addTask(demo(), { title: "Новая", priority: "low", categoryId: 1 }, 35);

  assert.equal(next.at(-1).id, 35);
  assert.equal(next.at(-1).completed, false);
  assert.equal(demo().length, 12);
});

test("addTask: отклоняет занятый и нецелый id", () => {
  assert.throws(() => addTask(demo(), { title: "A", priority: "low", categoryId: 1 }, 4));
  assert.throws(() => addTask(demo(), { title: "A", priority: "low", categoryId: 1 }, 0));
  assert.throws(() => addTask(demo(), { title: "A", priority: "low", categoryId: 1 }, 1.5));
});

test("nextTaskId: максимум полного массива плюс 1", () => {
  assert.equal(nextTaskId(demo()), 35);
  assert.equal(nextTaskId([]), 1);
});

test("updateTask: меняет title, priority, categoryId и сохраняет completed", () => {
  const next = updateTask(demo(), 1, { title: "Новое", priority: "low", categoryId: 3 });
  const updated = next.find((task) => task.id === 1);

  assert.equal(updated.completed, true);
  assert.equal(updated.title, "Новое");
  assert.equal(updated.categoryId, 3);
});

test("updateTask: неизвестный id возвращает тот же массив", () => {
  const tasks = demo();

  assert.equal(updateTask(tasks, 99, { title: "X", priority: "low", categoryId: 1 }), tasks);
});

test("toggleTask: инвертирует completed", () => {
  const next = toggleTask(demo(), 4);

  assert.equal(next.find((task) => task.id === 4).completed, true);
  assert.equal(demo().find((task) => task.id === 4).completed, false);
});

test("toggleTask: неизвестный id сохраняет ссылку", () => {
  const tasks = demo();

  assert.equal(toggleTask(tasks, 99), tasks);
});

test("removeTask: удаляет по id", () => {
  const next = removeTask(demo(), 10);

  assert.equal(next.some((task) => task.id === 10), false);
  assert.equal(next.length, 11);
});

test("removeTask: неизвестный id сохраняет ссылку", () => {
  const tasks = demo();

  assert.equal(removeTask(tasks, 99), tasks);
});

test("операции не мутируют замороженные объекты исходного набора", () => {
  const original = seed;
  const next = toggleTask(original, 4);

  assert.notEqual(next, original);
  assert.equal(original.find((task) => task.id === 4).completed, false);
});

test("вариант 6 задаёт начальный фильтр категории 2", () => {
  assert.equal(variantNumber, 6);
  assert.deepEqual(createInitialFilters(), { q: "", completed: "", priority: "", categoryId: "2" });
  assert.deepEqual(ids(selectTasks(demo(), createInitialFilters())), [4, 16, 22, 25, 28, 34]);
});
