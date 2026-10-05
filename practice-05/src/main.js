import { createApiClient } from "./api-client.js";
import { createTaskApi } from "./task-api.js";
import { variantFilters, variantNumber } from "./variant.js";

const baseUrl = process.env.API_URL ?? "http://127.0.0.1:5505/api";

async function run() {
  // TODO: создать клиент, выполнить контрольный сценарий и обработать ошибку задачи 999.
  throw new Error("Не реализовано: контрольный сценарий");
}

run().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
