import assert from "node:assert/strict";
import { test } from "node:test";

import { parseFilters, parsePositiveId } from "../../src/validation.js";
import { validateTaskInput } from "../../src/task-validation.js";
import { mapDatabaseError } from "../../src/db-errors.js";
import { ApiError, errorHandler } from "../../src/errors.js";
import { loadConfig } from "../../src/config.js";
import { escapeLikePattern } from "../../src/query-builders.js";

test("parsePositiveId 4", () => assert.equal(parsePositiveId("4"), 4));
test("parsePositiveId null на 4abc", () => assert.equal(parsePositiveId("4abc"), null));
test("parseFilters unknown", () => {
  assert.throws(() => parseFilters(new URLSearchParams("sort=id")), ApiError);
});
test("parseFilters q trim", () => {
  assert.equal(parseFilters(new URLSearchParams("q=%20API%20")).q, "API");
});
test("validate POST ok", () => {
  const value = validateTaskInput(
    { title: "A", priority: "low", categoryId: 1 },
    { categoryIds: new Set([1]) },
  );
  assert.equal(value.title, "A");
});
test("validate POST bad category", () => {
  assert.throws(() =>
    validateTaskInput(
      { title: "A", priority: "low", categoryId: 9 },
      { categoryIds: new Set([1]) },
    ),
  );
});
test("map 22001", () => assert.equal(mapDatabaseError({ code: "22001" }).status, 400));
test("errorHandler ApiError", () => {
  const res = {
    headersSent: false,
    statusCode: 0,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
    },
  };
  errorHandler(new ApiError(404, "TASK_NOT_FOUND", "нет", { id: 2 }), {}, res, () => {});
  assert.equal(res.statusCode, 404);
  assert.equal(res.body.error.details.id, 2);
});
test("loadConfig host default", () => {
  const config = loadConfig({
    DATABASE_URL: "postgresql://tip_app:x@127.0.0.1:5432/tip_tasks",
  });
  assert.equal(config.host, "127.0.0.1");
});
test("escapeLikePattern backslash", () => {
  assert.equal(escapeLikePattern("a\\b"), "a\\\\b");
});
test("parseFilters completed false", () => {
  assert.equal(parseFilters(new URLSearchParams("completed=false")).completed, false);
});
test("parseFilters duplicate q", () => {
  const params = new URLSearchParams();
  params.append("q", "a");
  params.append("q", "b");
  assert.throws(() => parseFilters(params));
});
test("errorHandler unexpected", () => {
  const res = {
    headersSent: false,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
    },
  };
  errorHandler(new Error("boom"), {}, res, () => {});
  assert.equal(res.statusCode, 500);
  assert.equal(res.body.error.code, "INTERNAL_ERROR");
});
test("validate PATCH completed", () => {
  assert.equal(
    validateTaskInput({ completed: false }, { partial: true, categoryIds: new Set([1]) }).completed,
    false,
  );
});
test("map 08000", () => assert.equal(mapDatabaseError({ code: "08000" }).status, 503));
test("parsePositiveId empty", () => assert.equal(parsePositiveId(""), null));
test("parseFilters default q", () => {
  assert.equal(parseFilters(new URLSearchParams()).q, "");
});
