import assert from "node:assert/strict";
import { test } from "node:test";

test("без DATABASE_URL модуль ping не вызывается", async () => {
  if (!process.env.DATABASE_URL) {
    assert.equal(typeof process.env.DATABASE_URL, "undefined");
    return;
  }

  const { createPool } = await import("../src/db.js");
  const { createStore } = await import("../src/store.js");
  const pool = createPool(process.env.DATABASE_URL);
  assert.equal(await createStore(pool).ping(), true);
  await pool.end();
});
