import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");

test("вариант 6: jsonBody подключён к POST и PATCH", () => {
  const source = readFileSync(join(root, "src/write-routes.js"), "utf8");
  assert.match(source, /jsonBody\(\)/);
  assert.match(source, /\/tasks\/:id/);
});

test("jsonErrorHandler обрабатывает parse failed", async () => {
  const { jsonErrorHandler } = await import("../../src/json-body.js");
  let passed;
  jsonErrorHandler({ type: "entity.parse.failed" }, {}, {}, (error) => {
    passed = error;
  });
  assert.equal(passed.code, "INVALID_JSON");
  assert.equal(passed.status, 400);
});
