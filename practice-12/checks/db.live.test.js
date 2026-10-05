import assert from "node:assert/strict";
import { test } from "node:test";

test("без DATABASE_URL проверка БД пропускается", async (t) => {
  if (process.env.DATABASE_URL) {
    const { createPool } = await import("../src/db.js");
    const { createStore } = await import("../src/store.js");
    const pool = createPool(process.env.DATABASE_URL);
    const ok = await createStore(pool).ping();
    assert.equal(ok, true);
    await pool.end();
    return;
  }

  t.skip("DATABASE_URL не задан");
});
