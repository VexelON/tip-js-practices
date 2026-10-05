import assert from "node:assert/strict";
import { test } from "node:test";

import {
  buildListTasksQuery,
  buildUpdateTaskQuery,
  escapeLikePattern,
} from "../src/query-builders.js";

test("пустые фильтры дают SELECT без WHERE", () => {
  const query = buildListTasksQuery({
    completed: null,
    priority: null,
    categoryId: null,
    q: "",
  });

  assert.equal(query.text.includes("WHERE"), false);
  assert.equal(query.values.length, 0);
  assert.match(query.text, /ORDER BY id/);
});

test("фильтры добавляются в фиксированном порядке", () => {
  const query = buildListTasksQuery({
    completed: false,
    priority: "high",
    categoryId: 2,
    q: "модель",
  });

  assert.match(query.text, /completed = \$1/);
  assert.match(query.text, /priority = \$2/);
  assert.match(query.text, /category_id = \$3/);
  assert.match(query.text, /title ILIKE \$4 ESCAPE/);
  assert.deepEqual(query.values, [false, "high", 2, "%модель%"]);
});

test("поиск экранирует % и _", () => {
  assert.equal(escapeLikePattern("50%_готово"), "50\\%\\_готово");

  const query = buildListTasksQuery({
    completed: null,
    priority: null,
    categoryId: null,
    q: "%_",
  });

  assert.deepEqual(query.values, ["%\\%\\_%"]);
  assert.equal(query.text.includes("%_"), false);
});

test("PATCH собирает SET в фиксированном порядке независимо от JSON", () => {
  const query = buildUpdateTaskQuery(4, { categoryId: 1, completed: false, title: "Новое" });

  assert.match(query.text, /SET title = \$1, completed = \$2, category_id = \$3 WHERE id = \$4/);
  assert.deepEqual(query.values, ["Новое", false, 1, 4]);
  assert.match(query.text, /"categoryId"/);
});

test("пустой PATCH отклоняется до SQL", () => {
  assert.throws(() => buildUpdateTaskQuery(4, {}), TypeError);
});
