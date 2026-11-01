// check-kr2-3.mjs должен лежать в practice-05/
import { createApiClient } from "./src/api-client.js";
import { createTaskApi } from "./src/task-api.js";

// ВАЖНО: посмотрите в терминале, на каком порту запустился сервер (npm.cmd start)
const BASE_URL = "http://127.0.0.1:5505/api"; 

async function run() {
  const client = createApiClient({ baseUrl: BASE_URL });
  const api = createTaskApi(client);

  console.log("--- ЗАДАНИЕ 3 ---");
  try {
    const result = await api.getTasks({ completed: false, priority: "high" });
    console.log("meta.total:", result.meta.total);
    console.log("id задач:", result.tasks.map(t => t.id));
  } catch (error) {
    console.error("Ошибка в Задании 3:", error.message);
  }

  console.log("\n--- ЗАДАНИЕ 4 ---");
  try {
    await api.getTaskById(999);
  } catch (error) {
    console.log("Перехвачена ошибка:");
    console.log("kind:", error.kind);
    console.log("status:", error.status);
  }
}

run();
