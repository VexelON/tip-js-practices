import assert from "node:assert/strict";
import { after, test } from "node:test";

import { createApp } from "../src/app.js";

async function listen(app) {
  return new Promise((resolve) => {
    const server = app.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      resolve({ server, baseUrl: `http://127.0.0.1:${port}` });
    });
  });
}

const { server, baseUrl } = await listen(createApp());

async function request(path, init = {}) {
  const response = await fetch(`${baseUrl}${path}`, init);
  const text = await response.text();

  return {
    status: response.status,
    headers: response.headers,
    text,
    json: () => (text ? JSON.parse(text) : null),
  };
}

function json(method, path, body, extra = {}) {
  return request(path, {
    method,
    headers: { "Content-Type": "application/json", ...(extra.headers ?? {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

after(() => new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve()))));

test("POST создаёт задачу 35", async () => {
  await json("POST", "/api/debug/reset", undefined).catch(() => {});
  const reset = await fetch(`${baseUrl}/api/debug/reset`, { method: "POST" });
  assert.equal(reset.status, 200);

  const response = await json("POST", "/api/tasks", {
    title: "Подготовить защиту",
    priority: "high",
    categoryId: 2,
  });

  assert.equal(response.status, 201);
  assert.equal(response.headers.get("location"), "/api/tasks/35");
  assert.equal(response.json().data.id, 35);
  assert.equal(response.json().data.completed, false);
});

test("POST без названия 400 VALIDATION_ERROR", async () => {
  const response = await json("POST", "/api/tasks", { priority: "low", categoryId: 1 });
  assert.equal(response.status, 400);
  assert.equal(response.json().error.code, "VALIDATION_ERROR");
});

test("POST с id отклоняется", async () => {
  const response = await json("POST", "/api/tasks", {
    title: "A",
    priority: "low",
    categoryId: 1,
    id: 99,
  });
  assert.equal(response.status, 400);
});

test("PATCH completed сохраняет title", async () => {
  const response = await json("PATCH", "/api/tasks/4", { completed: true });
  assert.equal(response.status, 200);
  assert.equal(response.json().data.completed, true);
  assert.equal(response.json().data.title, "Подготовить модель задач");
});

test("PATCH title выполненной задачи не сбрасывает статус", async () => {
  const response = await json("PATCH", "/api/tasks/16", { title: "Проверить ответы API ещё раз" });
  assert.equal(response.json().data.completed, true);
});

test("DELETE 204 без тела", async () => {
  const created = await json("POST", "/api/tasks", {
    title: "Удалить",
    priority: "low",
    categoryId: 1,
  });
  const id = created.json().data.id;
  const response = await request(`/api/tasks/${id}`, { method: "DELETE" });
  assert.equal(response.status, 204);
  assert.equal(response.text, "");
});

test("повторный DELETE → 404", async () => {
  const created = await json("POST", "/api/tasks", {
    title: "Дважды",
    priority: "low",
    categoryId: 1,
  });
  const id = created.json().data.id;
  await request(`/api/tasks/${id}`, { method: "DELETE" });
  const response = await request(`/api/tasks/${id}`, { method: "DELETE" });
  assert.equal(response.status, 404);
  assert.equal(response.json().error.code, "TASK_NOT_FOUND");
});

test("PATCH /tasks/4abc без JSON → INVALID_ID", async () => {
  const response = await request("/api/tasks/4abc", { method: "PATCH" });
  assert.equal(response.status, 400);
  assert.equal(response.json().error.code, "INVALID_ID");
});

test("PATCH /tasks/2 без JSON → TASK_NOT_FOUND", async () => {
  const response = await request("/api/tasks/2", { method: "PATCH" });
  assert.equal(response.status, 404);
  assert.equal(response.json().error.code, "TASK_NOT_FOUND");
});

test("битый JSON → INVALID_JSON", async () => {
  const response = await request("/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{",
  });
  assert.equal(response.status, 400);
  assert.equal(response.json().error.code, "INVALID_JSON");
});

test("пустое тело POST → INVALID_JSON", async () => {
  const response = await request("/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Content-Length": "0" },
    body: "",
  });
  assert.equal(response.status, 400);
  assert.equal(response.json().error.code, "INVALID_JSON");
});

test("нет Content-Type → 415", async () => {
  const response = await request("/api/tasks", {
    method: "POST",
    body: JSON.stringify({ title: "A", priority: "low", categoryId: 1 }),
  });
  assert.equal(response.status, 415);
  assert.equal(response.json().error.code, "UNSUPPORTED_MEDIA_TYPE");
});

test("слишком большое тело → 413", async () => {
  const response = await request("/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "A".repeat(20_000), priority: "low", categoryId: 1 }),
  });
  assert.equal(response.status, 413);
  assert.equal(response.json().error.code, "PAYLOAD_TOO_LARGE");
});

test("PATCH пустой объект → VALIDATION_ERROR", async () => {
  const response = await json("PATCH", "/api/tasks/4", {});
  assert.equal(response.status, 400);
  assert.equal(response.json().error.code, "VALIDATION_ERROR");
});

test("Location доступен через CORS expose", async () => {
  const response = await json("POST", "/api/tasks", {
    title: "CORS Location",
    priority: "low",
    categoryId: 3,
  });
  assert.ok((response.headers.get("access-control-expose-headers") ?? "").includes("Location"));
});

test("reset возвращает total 12", async () => {
  const response = await fetch(`${baseUrl}/api/debug/reset`, { method: "POST" });
  const payload = await response.json();
  assert.equal(payload.data.reset, true);
  assert.equal(payload.data.total, 12);
});

test("после reset снова id 35", async () => {
  await fetch(`${baseUrl}/api/debug/reset`, { method: "POST" });
  const response = await json("POST", "/api/tasks", {
    title: "Снова 35",
    priority: "medium",
    categoryId: 2,
  });
  assert.equal(response.json().data.id, 35);
});

test("массив вместо объекта", async () => {
  const response = await json("POST", "/api/tasks", []);
  assert.equal(response.status, 400);
});

test("JSON null", async () => {
  const response = await request("/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "null",
  });
  assert.equal(response.status, 400);
});

test("PATCH несколькими ошибками не меняет запись", async () => {
  const before = (await request("/api/tasks/4")).json().data;
  const response = await json("PATCH", "/api/tasks/4", { title: "Ок", categoryId: 999 });
  assert.equal(response.status, 400);
  const after = (await request("/api/tasks/4")).json().data;
  assert.deepEqual(after, before);
});

test("вариант 6: POST категории 2", async () => {
  await fetch(`${baseUrl}/api/debug/reset`, { method: "POST" });
  const response = await json("POST", "/api/tasks", {
    title: "Задача проекта",
    priority: "medium",
    categoryId: 2,
  });
  assert.equal(response.json().data.categoryId, 2);
  const list = (await request("/api/tasks?categoryId=2")).json();
  assert.ok(list.data.some((task) => task.id === 35));
});

test("неверный запрос минуя форму не меняет набор", async () => {
  const before = (await request("/api/tasks")).json().meta.total;
  await json("POST", "/api/tasks", { title: "", priority: "low", categoryId: 2 });
  const after = (await request("/api/tasks")).json().meta.total;
  assert.equal(after, before);
});

test("charset utf-8 допустим", async () => {
  const response = await request("/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ title: "UTF", priority: "low", categoryId: 1 }),
  });
  assert.equal(response.status, 201);
});

test("GET debug/reset → 405", async () => {
  const response = await request("/api/debug/reset");
  assert.equal(response.status, 405);
});

test("OPTIONS POST preflight 204", async () => {
  const response = await request("/api/tasks", {
    method: "OPTIONS",
    headers: {
      Origin: "http://127.0.0.1:5173",
      "Access-Control-Request-Method": "POST",
    },
  });
  assert.equal(response.status, 204);
});

test("PATCH completed false", async () => {
  await json("PATCH", "/api/tasks/1", { completed: false });
  const task = (await request("/api/tasks/1")).json().data;
  assert.equal(task.completed, false);
});

test("POST unknown field", async () => {
  const response = await json("POST", "/api/tasks", {
    title: "A",
    priority: "low",
    categoryId: 1,
    owner: "x",
  });
  assert.equal(response.status, 400);
  assert.ok(response.json().error.details.owner);
});

test("DELETE не трогает JSON parser", async () => {
  const created = await json("POST", "/api/tasks", {
    title: "del",
    priority: "low",
    categoryId: 1,
  });
  const response = await request(`/api/tasks/${created.json().data.id}`, {
    method: "DELETE",
    headers: { "Content-Type": "text/plain" },
  });
  assert.equal(response.status, 204);
});

test("следующий id после 35 — 36", async () => {
  await fetch(`${baseUrl}/api/debug/reset`, { method: "POST" });
  await json("POST", "/api/tasks", { title: "A", priority: "low", categoryId: 1 });
  const second = await json("POST", "/api/tasks", { title: "B", priority: "low", categoryId: 1 });
  assert.equal(second.json().data.id, 36);
});

test("фильтр после создания неподходящей записи", async () => {
  await fetch(`${baseUrl}/api/debug/reset`, { method: "POST" });
  await json("POST", "/api/tasks", { title: "Другая категория", priority: "low", categoryId: 1 });
  const list = (await request("/api/tasks?categoryId=2")).json();
  assert.equal(list.data.some((task) => task.title === "Другая категория"), false);
  assert.equal((await request("/api/tasks")).json().meta.total, 13);
});

test("PATCH categoryId 1→2", async () => {
  const response = await json("PATCH", "/api/tasks/1", { categoryId: 2 });
  assert.equal(response.json().data.categoryId, 2);
});

test("ошибка валидации не содержит stack", async () => {
  const response = await json("POST", "/api/tasks", { title: "" });
  assert.equal(response.text.includes("at "), false);
});

test("CORS allow methods включает PATCH DELETE", async () => {
  const response = await request("/api/health");
  const methods = response.headers.get("access-control-allow-methods");
  assert.match(methods, /PATCH/);
  assert.match(methods, /DELETE/);
});

test("HEAD POST path still GET head", async () => {
  const response = await request("/api/tasks", { method: "HEAD" });
  assert.equal(response.status, 200);
});

test("созданная задача читается GET by id", async () => {
  const created = await json("POST", "/api/tasks", {
    title: "Читать",
    priority: "high",
    categoryId: 2,
  });
  const fetched = await request(`/api/tasks/${created.json().data.id}`);
  assert.equal(fetched.json().data.title, "Читать");
});

test("PATCH неизвестная категория не меняет categoryId", async () => {
  const before = (await request("/api/tasks/28")).json().data.categoryId;
  const response = await json("PATCH", "/api/tasks/28", { categoryId: 999 });
  assert.equal(response.status, 400);
  assert.equal((await request("/api/tasks/28")).json().data.categoryId, before);
});

test("POST title из пробелов отклоняется", async () => {
  const response = await json("POST", "/api/tasks", {
    title: "   ",
    priority: "low",
    categoryId: 2,
  });
  assert.equal(response.status, 400);
});
