import assert from "node:assert/strict";
import { after, test } from "node:test";

import { createApp } from "../src/app.js";

function fakeStore() {
  return {
    ping: async () => true,
    listCategories: async () => [{ id: 2, name: "Проект" }],
    listTasks: async () => [
      {
        id: 4,
        title: "Подготовить модель задач",
        completed: false,
        priority: "high",
        categoryId: 2,
      },
    ],
    getTask: async (id) =>
      id === 4
        ? {
            id: 4,
            title: "Подготовить модель задач",
            completed: false,
            priority: "high",
            categoryId: 2,
          }
        : null,
    createTask: async (value) => ({ id: 35, completed: false, ...value }),
    updateTask: async (id, changes) => ({
      id,
      title: "x",
      completed: false,
      priority: "low",
      categoryId: 2,
      ...changes,
    }),
    deleteTask: async () => true,
    reset: async () => ({ reset: true, total: 12 }),
  };
}

const { server, baseUrl } = await new Promise((resolve) => {
  const app = createApp({ store: fakeStore(), enableDebugReset: true });
  const httpServer = app.listen(0, "127.0.0.1", () => {
    resolve({ server: httpServer, baseUrl: `http://127.0.0.1:${httpServer.address().port}` });
  });
});

after(
  () =>
    new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve()))),
);

test("health ping", async () => {
  const response = await fetch(`${baseUrl}/api/health`);
  assert.equal(response.status, 200);
});

test("categories", async () => {
  const payload = await (await fetch(`${baseUrl}/api/categories`)).json();
  assert.equal(payload.meta.total, 1);
});

test("tasks", async () => {
  const payload = await (await fetch(`${baseUrl}/api/tasks`)).json();
  assert.equal(payload.data[0].id, 4);
});

test("task by id", async () => {
  const payload = await (await fetch(`${baseUrl}/api/tasks/4`)).json();
  assert.equal(payload.data.categoryId, 2);
});

test("POST create", async () => {
  const response = await fetch(`${baseUrl}/api/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "Новая", priority: "low", categoryId: 2 }),
  });
  assert.equal(response.status, 201);
  assert.equal((await response.json()).data.id, 35);
});

test("reset", async () => {
  const response = await fetch(`${baseUrl}/api/debug/reset`, { method: "POST" });
  assert.equal((await response.json()).data.total, 12);
});

test("404 missing task", async () => {
  const response = await fetch(`${baseUrl}/api/tasks/9`);
  assert.equal(response.status, 404);
});

test("вариант 6 literal percent underscore в фильтре q", async () => {
  const response = await fetch(`${baseUrl}/api/tasks?${new URLSearchParams({ q: "%_" })}`);
  assert.equal(response.status, 200);
});

test("loadConfig отклоняет пустой DATABASE_URL", async () => {
  const { loadConfig } = await import("../src/config.js");
  assert.throws(() => loadConfig({ API_PORT: "5505", DATABASE_URL: "" }));
});

test("loadConfig принимает postgres URL", async () => {
  const { loadConfig } = await import("../src/config.js");
  const config = loadConfig({
    API_PORT: "5505",
    DATABASE_URL: "postgresql://tip_app:x@127.0.0.1:5432/tip_tasks",
    ENABLE_DEBUG_RESET: "true",
  });
  assert.equal(config.enableDebugReset, true);
  assert.equal(config.port, 5505);
});
