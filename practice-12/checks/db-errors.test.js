import assert from "node:assert/strict";
import { test } from "node:test";

import { mapDatabaseError } from "../src/db-errors.js";

test("23503 → VALIDATION_ERROR", () => {
  const error = mapDatabaseError({ code: "23503" });
  assert.equal(error.status, 400);
  assert.equal(error.code, "VALIDATION_ERROR");
  assert.equal(error.message.includes("pg://"), false);
});

test("23514 → VALIDATION_ERROR", () => {
  assert.equal(mapDatabaseError({ code: "23514" }).code, "VALIDATION_ERROR");
});

test("08xxx и 57P01 → 503", () => {
  assert.equal(mapDatabaseError({ code: "08006" }).status, 503);
  assert.equal(mapDatabaseError({ code: "57P01" }).code, "DATABASE_UNAVAILABLE");
});

test("прочий код → INTERNAL_ERROR без detail", () => {
  const error = mapDatabaseError({ code: "XX000", detail: "password=secret" });
  assert.equal(error.code, "INTERNAL_ERROR");
  assert.equal(error.message.includes("secret"), false);
});
