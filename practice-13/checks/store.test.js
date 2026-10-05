import assert from "node:assert/strict";
import { test } from "node:test";

import { createStore } from "../src/store.js";

test("reset выполняет команды одним client и COMMIT", async () => {
  const calls = [];
  const client = {
    query: async (text) => {
      calls.push(String(text).slice(0, 24));
      return { rows: [], rowCount: 0 };
    },
    release() {
      calls.push("release");
    },
  };
  const pool = { connect: async () => client };
  await createStore(pool).reset();
  assert.equal(calls[0], "BEGIN");
  assert.ok(calls.includes("COMMIT"));
  assert.equal(calls.at(-1), "release");
});

test("ошибка reset делает ROLLBACK и release", async () => {
  const calls = [];
  const client = {
    async query(text) {
      calls.push(String(text).startsWith("BEGIN") ? "BEGIN" : String(text).slice(0, 8));
      if (String(text).startsWith("DELETE FROM public.tasks")) {
        throw new Error("fail");
      }
      return { rows: [] };
    },
    release() {
      calls.push("release");
    },
  };

  await assert.rejects(() => createStore({ connect: async () => client }).reset());
  assert.ok(calls.includes("ROLLBACK"));
  assert.ok(calls.includes("release"));
});

test("listTasks передаёт параметризованный запрос", async () => {
  const pool = {
    async query(arg) {
      return { rows: arg };
    },
  };
  const rows = await createStore(pool).listTasks({
    completed: false,
    priority: null,
    categoryId: null,
    q: "%_",
  });
  assert.equal(rows.text.includes("%_"), false);
  assert.deepEqual(rows.values, [false, "%\\%\\_%"]);
});
