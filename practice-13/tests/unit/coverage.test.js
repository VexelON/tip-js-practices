import assert from "node:assert/strict";
import { after, test } from "node:test";

import { createApp } from "../../src/app.js";
import { createPool } from "../../src/db.js";
import { createStore } from "../../src/store.js";
import { loadConfig } from "../../src/config.js";
import { buildDeleteTaskQuery } from "../../src/query-builders.js";

test("createPool возвращает объект с query", () => {
  const pool = createPool("postgresql://tip_app:x@127.0.0.1:5432/tip_tasks");
  assert.equal(typeof pool.query, "function");
  assert.equal(typeof pool.end, "function");
  void pool.end();
});

test("loadConfig отклоняет пробел в host", () => {
  assert.throws(() =>
    loadConfig({ API_HOST: "bad host", DATABASE_URL: "postgresql://tip_app:x@127.0.0.1:5432/db" }),
  );
});

test("loadConfig отклоняет порт 80", () => {
  assert.throws(() =>
    loadConfig({ API_PORT: "80", DATABASE_URL: "postgresql://tip_app:x@127.0.0.1:5432/db" }),
  );
});

test("buildDeleteTaskQuery", () => {
  assert.deepEqual(buildDeleteTaskQuery(4).values, [4]);
});

test("store get/create/update/delete через pool.query", async () => {
  const pool = {
    async query(arg) {
      if (typeof arg === "string" && arg.includes("SELECT 1")) {
        return { rows: [{ ok: 1 }] };
      }
      if (arg?.text?.includes("WHERE id = $1") && arg?.text?.startsWith("SELECT")) {
        return {
          rows: [
            { id: arg.values[0], title: "T", completed: false, priority: "low", categoryId: 1 },
          ],
        };
      }
      if (arg?.text?.startsWith("INSERT")) {
        return {
          rows: [
            {
              id: 35,
              title: arg.values[0],
              completed: false,
              priority: arg.values[1],
              categoryId: arg.values[2],
            },
          ],
        };
      }
      if (arg?.text?.startsWith("UPDATE")) {
        return {
          rows: [
            { id: arg.values.at(-1), title: "U", completed: false, priority: "low", categoryId: 1 },
          ],
        };
      }
      if (arg?.text?.startsWith("DELETE")) {
        return { rowCount: 1 };
      }
      if (typeof arg === "string" && arg.includes("categories")) {
        return { rows: [{ id: 1, name: "Учёба" }] };
      }
      return { rows: [] };
    },
  };
  const store = createStore(pool);
  assert.equal(await store.ping(), true);
  assert.equal((await store.getTask(4)).id, 4);
  assert.equal((await store.createTask({ title: "N", priority: "low", categoryId: 1 })).id, 35);
  assert.equal((await store.updateTask(4, { title: "U" })).id, 4);
  assert.equal(await store.deleteTask(4), true);
  assert.equal((await store.listCategories())[0].id, 1);
});

const store = {
  ping: async () => true,
  listCategories: async () => [{ id: 1, name: "Учёба" }],
  listTasks: async () => [],
  getTask: async (id) =>
    id === 4 ? { id: 4, title: "T", completed: false, priority: "low", categoryId: 1 } : null,
  createTask: async (value) => ({ id: 35, completed: false, ...value }),
  updateTask: async (id, changes) => ({
    id,
    title: "T",
    completed: false,
    priority: "low",
    categoryId: 1,
    ...changes,
  }),
  deleteTask: async () => true,
  reset: async () => ({ reset: true, total: 12 }),
};

const { server, baseUrl } = await new Promise((resolve) => {
  const app = createApp({ store, enableDebugReset: true });
  const httpServer = app.listen(0, "127.0.0.1", () => {
    resolve({ server: httpServer, baseUrl: `http://127.0.0.1:${httpServer.address().port}` });
  });
});

after(
  () =>
    new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve()))),
);

test("PATCH через requireTask", async () => {
  const response = await fetch(`${baseUrl}/api/tasks/4`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "Новое" }),
  });
  assert.equal(response.status, 200);
});

test("DELETE 204", async () => {
  const response = await fetch(`${baseUrl}/api/tasks/4`, { method: "DELETE" });
  assert.equal(response.status, 204);
});

test("POST без content-type 415", async () => {
  const response = await fetch(`${baseUrl}/api/tasks`, {
    method: "POST",
    body: "{}",
  });
  assert.equal(response.status, 415);
});

test("POST битый JSON", async () => {
  const response = await fetch(`${baseUrl}/api/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{",
  });
  assert.equal(response.status, 400);
});

test("PATCH 4abc INVALID_ID", async () => {
  const response = await fetch(`${baseUrl}/api/tasks/4abc`, { method: "PATCH" });
  assert.equal(response.status, 400);
});

test("errorHandler headersSent", async () => {
  const { errorHandler } = await import("../../src/errors.js");
  let nextCalled = false;
  errorHandler(new Error("x"), {}, { headersSent: true }, () => {
    nextCalled = true;
  });
  assert.equal(nextCalled, true);
});
