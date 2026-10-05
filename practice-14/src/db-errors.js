import { ApiError } from "./errors.js";

export function mapDatabaseError(error) {
  const code = error?.code ?? "";

  if (code === "23503") {
    return new ApiError(400, "VALIDATION_ERROR", "Категория не найдена.", {
      categoryId: "Неизвестная категория.",
    });
  }

  if (code === "23502" || code === "23514" || code === "22001") {
    return new ApiError(400, "VALIDATION_ERROR", "Данные не прошли проверку базы.", {
      body: "Ограничение базы отклонило значение.",
    });
  }

  if (code.startsWith("08") || code === "57P01") {
    return new ApiError(503, "DATABASE_UNAVAILABLE", "База данных недоступна.");
  }

  return new ApiError(500, "INTERNAL_ERROR", "Внутренняя ошибка сервера.");
}
