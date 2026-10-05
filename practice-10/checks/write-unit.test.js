import assert from "node:assert/strict";
import { test } from "node:test";

import { categories, tasks } from "../src/data.js";
import { ApiError } from "../src/errors.js";
import { createStore } from "../src/store.js";
import { validateTaskInput } from "../src/task-validation.js";

const categoryIds = new Set(categories.map((item) => item.id));

function expectValidation(fn, field) {
  assert.throws(fn, (error) => {
    assert.equal(error instanceof ApiError, true);
    assert.equal(error.code, "VALIDATION_ERROR");

    if (field) {
      assert.ok(error.details[field]);
    }

    return true;
  });
}

function store() {
  return createStore({ categories, tasks });
}

test("POST: нормализует title и назначает поля", () => {
  const value = validateTaskInput(
    { title: "  Новая  ", priority: "high", categoryId: 2 },
    { categoryIds }
  );

  assert.deepEqual(value, { title: "Новая", priority: "high", categoryId: 2 });
});

test("POST: отсутствует title", () => {
  expectValidation(() => validateTaskInput({ priority: "low", categoryId: 1 }, { categoryIds }), "title");
});

test("POST: запрещает id", () => {
  expectValidation(
    () =>
      validateTaskInput({ title: "A", priority: "low", categoryId: 1, id: 35 }, { categoryIds }),
    "id"
  );
});

test("POST: запрещает completed", () => {
  expectValidation(
    () =>
      validateTaskInput(
        { title: "A", priority: "low", categoryId: 1, completed: false },
        { categoryIds }
      ),
    "completed"
  );
});

test("POST: неизвестная категория", () => {
  expectValidation(
    () => validateTaskInput({ title: "A", priority: "low", categoryId: 9 }, { categoryIds }),
    "categoryId"
  );
});

test("POST: строковый categoryId не преобразуется", () => {
  expectValidation(
    () => validateTaskInput({ title: "A", priority: "low", categoryId: "2" }, { categoryIds }),
    "categoryId"
  );
});

test("POST: собирает несколько ошибок", () => {
  try {
    validateTaskInput({ title: "", priority: "urgent", categoryId: 9 }, { categoryIds });
    assert.fail("expected throw");
  } catch (error) {
    assert.equal(error.code, "VALIDATION_ERROR");
    assert.ok(error.details.title);
    assert.ok(error.details.priority);
    assert.ok(error.details.categoryId);
  }
});

test("POST: не объект", () => {
  expectValidation(() => validateTaskInput([], { categoryIds }), "body");
});

test("PATCH: пустой объект", () => {
  expectValidation(() => validateTaskInput({}, { partial: true, categoryIds }), "body");
});

test("PATCH: completed false сохраняется", () => {
  const value = validateTaskInput({ completed: false }, { partial: true, categoryIds });
  assert.equal(value.completed, false);
});

test("PATCH: не добавляет поля по умолчанию", () => {
  const value = validateTaskInput({ title: "Только название" }, { partial: true, categoryIds });
  assert.deepEqual(Object.keys(value), ["title"]);
});

test("PATCH: неизвестное поле", () => {
  expectValidation(
    () => validateTaskInput({ extra: 1, title: "A" }, { partial: true, categoryIds }),
    "extra"
  );
});

test("название 101 символ", () => {
  expectValidation(
    () =>
      validateTaskInput({ title: "а".repeat(101), priority: "low", categoryId: 1 }, { categoryIds }),
    "title"
  );
});

test("название 100 символов допустимо", () => {
  const title = "а".repeat(100);
  const value = validateTaskInput({ title, priority: "low", categoryId: 1 }, { categoryIds });
  assert.equal(value.title.length, 100);
});

test("createTask назначает id 35 и completed false", () => {
  const created = store().createTask({ title: "Новая", priority: "high", categoryId: 2 });
  assert.equal(created.id, 35);
  assert.equal(created.completed, false);
});

test("createTask не использует длину массива", () => {
  const db = store();
  db.deleteTask(34);
  const created = db.createTask({ title: "После удаления", priority: "low", categoryId: 1 });
  assert.equal(created.id, 35);
});

test("updateTask меняет только переданные поля", () => {
  const db = store();
  const updated = db.updateTask(16, { title: "Новое имя" });
  assert.equal(updated.title, "Новое имя");
  assert.equal(updated.completed, true);
  assert.equal(updated.priority, "high");
});

test("updateTask неизвестный id → null", () => {
  assert.equal(store().updateTask(999, { title: "Нет" }), null);
});

test("deleteTask возвращает true/false", () => {
  const db = store();
  assert.equal(db.deleteTask(4), true);
  assert.equal(db.deleteTask(4), false);
  assert.equal(db.getTask(4), null);
});

test("getTask возвращает копию", () => {
  const db = store();
  const copy = db.getTask(4);
  copy.title = "Мутация";
  assert.equal(db.getTask(4).title, "Подготовить модель задач");
});

test("listTasks не меняет хранилище", () => {
  const db = store();
  db.listTasks({ completed: true, priority: null, categoryId: null, q: "" });
  assert.equal(db.listTasks({ completed: null, priority: null, categoryId: null, q: "" }).length, 12);
});

test("reset восстанавливает 12 задач и nextId 35", () => {
  const db = store();
  db.createTask({ title: "Временная", priority: "low", categoryId: 1 });
  const result = db.reset({ tasks, categories });
  assert.equal(result.total, 12);
  assert.equal(db.createTask({ title: "Снова", priority: "low", categoryId: 1 }).id, 35);
});

test("validate не мутирует вход", () => {
  const input = { title: "  A  ", priority: "low", categoryId: 1 };
  validateTaskInput(input, { categoryIds });
  assert.equal(input.title, "  A  ");
});

test("PATCH id запрещён", () => {
  expectValidation(
    () => validateTaskInput({ id: 1, title: "A" }, { partial: true, categoryIds }),
    "id"
  );
});

test("completed строка 'false' отклоняется", () => {
  expectValidation(
    () => validateTaskInput({ completed: "false" }, { partial: true, categoryIds }),
    "completed"
  );
});

test("createTask возвращает копию", () => {
  const db = store();
  const created = db.createTask({ title: "Копия", priority: "low", categoryId: 1 });
  created.title = "Другое";
  assert.equal(db.getTask(created.id).title, "Копия");
});

test("следующий id после двух созданий — 37", () => {
  const db = store();
  db.createTask({ title: "A", priority: "low", categoryId: 1 });
  db.createTask({ title: "B", priority: "low", categoryId: 1 });
  assert.equal(db.createTask({ title: "C", priority: "low", categoryId: 1 }).id, 37);
});

test("фильтры не удаляют записи из хранилища", () => {
  const db = store();
  const filtered = db.listTasks({ completed: false, priority: null, categoryId: 2, q: "" });
  assert.ok(filtered.length > 0);
  assert.equal(db.getTask(1).completed, true);
});

test("при ошибке валидации store не вызывается — проверяется чистотой функции", () => {
  const db = store();
  assert.throws(() => validateTaskInput({ title: "", priority: "low", categoryId: 1 }, { categoryIds }));
  assert.equal(db.listTasks({ completed: null, priority: null, categoryId: null, q: "" }).length, 12);
});

test("update сохраняет исходный id", () => {
  const updated = store().updateTask(4, { title: "X", categoryId: 1 });
  assert.equal(updated.id, 4);
});

test("необычное имя поля попадает в details", () => {
  expectValidation(
    () => validateTaskInput({ constructor: 1, title: "A" }, { partial: true, categoryIds }),
    "constructor"
  );
});

test("priority medium допустим", () => {
  const value = validateTaskInput({ title: "A", priority: "medium", categoryId: 3 }, { categoryIds });
  assert.equal(value.priority, "medium");
  assert.equal(value.categoryId, 3);
});

test("пробелы title отклоняются как пустые", () => {
  assert.throws(() =>
    validateTaskInput({ title: "   ", priority: "low", categoryId: 1 }, { categoryIds })
  );
});

test("listCategories возвращает копии", () => {
  const db = store();
  db.listCategories()[0].name = "X";
  assert.equal(db.listCategories()[0].name, "Учёба");
});

test("delete не уменьшает nextId", () => {
  const db = store();
  const first = db.createTask({ title: "A", priority: "low", categoryId: 1 });
  db.deleteTask(first.id);
  const second = db.createTask({ title: "B", priority: "low", categoryId: 1 });
  assert.equal(second.id, first.id + 1);
});

test("частичный PATCH title+priority", () => {
  const value = validateTaskInput(
    { title: "Оба", priority: "low" },
    { partial: true, categoryIds }
  );
  assert.deepEqual(value, { title: "Оба", priority: "low" });
});

test("body null", () => {
  expectValidation(() => validateTaskInput(null, { categoryIds }), "body");
});

test("body число", () => {
  expectValidation(() => validateTaskInput(42, { categoryIds }), "body");
});

test("PATCH completed true", () => {
  assert.equal(validateTaskInput({ completed: true }, { partial: true, categoryIds }).completed, true);
});

test("неизвестное поле POST вместе с валидными", () => {
  try {
    validateTaskInput(
      { title: "A", priority: "low", categoryId: 1, secret: true },
      { categoryIds }
    );
    assert.fail("expected throw");
  } catch (error) {
    assert.ok(error.details.secret);
  }
});
