import { ApiError } from "./errors.js";

const PRIORITIES = ["low", "medium", "high"];
const TITLE_MAX = 100;
const POST_FIELDS = ["title", "priority", "categoryId"];
const PATCH_FIELDS = ["title", "priority", "categoryId", "completed"];

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function invalid(details) {
  throw new ApiError(400, "VALIDATION_ERROR", "Данные не прошли проверку.", details);
}

export function validateTaskInput(value, { partial = false, categoryIds }) {
  if (!isPlainObject(value)) {
    invalid({ body: "Тело запроса должно быть JSON-объектом." });
  }

  const allowed = partial ? PATCH_FIELDS : POST_FIELDS;
  const details = Object.create(null);
  const keys = Object.keys(value);

  for (const key of keys) {
    if (!allowed.includes(key)) {
      details[key] = "Поле не допускается.";
    }
  }

  if (!partial) {
    for (const field of POST_FIELDS) {
      if (!Object.hasOwn(value, field)) {
        details[field] = "Поле обязательно.";
      }
    }
  } else if (
    keys.filter((key) => PATCH_FIELDS.includes(key)).length === 0 &&
    Object.keys(details).length === 0
  ) {
    details.body = "PATCH должен содержать хотя бы одно поле.";
  }

  const normalized = {};

  if (Object.hasOwn(value, "title")) {
    if (typeof value.title !== "string") {
      details.title = "Название должно быть строкой.";
    } else {
      const title = value.title.trim();

      if (title.length < 1 || title.length > TITLE_MAX) {
        details.title = "Название должно содержать от 1 до 100 символов.";
      } else {
        normalized.title = title;
      }
    }
  }

  if (Object.hasOwn(value, "priority")) {
    if (!PRIORITIES.includes(value.priority)) {
      details.priority = "Приоритет: low, medium или high.";
    } else {
      normalized.priority = value.priority;
    }
  }

  if (Object.hasOwn(value, "categoryId")) {
    if (!Number.isSafeInteger(value.categoryId) || value.categoryId <= 0) {
      details.categoryId = "categoryId должен быть положительным целым числом.";
    } else if (!categoryIds.has(value.categoryId)) {
      details.categoryId = "Неизвестная категория.";
    } else {
      normalized.categoryId = value.categoryId;
    }
  }

  if (Object.hasOwn(value, "completed")) {
    if (typeof value.completed !== "boolean") {
      details.completed = "completed должен быть логическим значением.";
    } else {
      normalized.completed = value.completed;
    }
  }

  if (Object.keys(details).length > 0) {
    invalid(details);
  }

  return normalized;
}
