import assert from "node:assert/strict";
import { after, test } from "node:test";

import { createApp } from "../src/app.js";
import { createApiClient } from "../../practice-08/src/api-client.js";
import { createTaskApi } from "../../practice-08/src/task-api.js";

async function listen(app) {
  return new Promise((resolve) => {
    const server = app.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      resolve({ server, baseUrl: `http://127.0.0.1:${port}` });
    });
  });
}

const { server, baseUrl } = await listen(createApp());
const api = createTaskApi(createApiClient({ baseUrl: `${baseUrl}/api` }));

after(() => new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve()))));

test("клиент ПР8 читает 12 задач", async () => {
  await api.resetDemoData();
  const { tasks } = await api.getTasks();
  assert.equal(tasks.length, 12);
});

test("клиент ПР8 создаёт задачу", async () => {
  await api.resetDemoData();
  const task = await api.createTask({ title: "Через клиент", priority: "high", categoryId: 2 });
  assert.equal(task.id, 35);
  assert.equal(task.completed, false);
});

test("клиент ПР8 обновляет название", async () => {
  await api.resetDemoData();
  const updated = await api.updateTask(4, { title: "Модель обновлена" });
  assert.equal(updated.title, "Модель обновлена");
  assert.equal(updated.completed, false);
});

test("клиент ПР8 переключает completed", async () => {
  await api.resetDemoData();
  const updated = await api.setTaskCompleted(4, true);
  assert.equal(updated.completed, true);
});

test("клиент ПР8 удаляет задачу", async () => {
  await api.resetDemoData();
  await api.deleteTask(22);
  await assert.rejects(() => api.getTaskById(22));
});

test("вариант 6: фильтр categoryId=2 через клиент", async () => {
  await api.resetDemoData();
  const { tasks } = await api.getTasks({ categoryId: 2 });
  assert.deepEqual(
    tasks.map((task) => task.id),
    [4, 16, 22, 25, 28, 34]
  );
});

test("loadInitialData параллельно грузит категории", async () => {
  await api.resetDemoData();
  const snapshot = await api.loadInitialData({ categoryId: 2 });
  assert.equal(snapshot.categories.length, 3);
  assert.equal(snapshot.tasks.length, 6);
});

test("reset через клиент возвращает 12", async () => {
  await api.createTask({ title: "Временная", priority: "low", categoryId: 1 });
  const result = await api.resetDemoData();
  assert.equal(result.total, 12);
});
