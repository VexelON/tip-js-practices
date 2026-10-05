import express from "express";

import { ApiError } from "./errors.js";

const LIMIT = 16 * 1024;

function requireJsonContentType(req, res, next) {
  const contentType = req.headers["content-type"] ?? "";

  if (!contentType.toLowerCase().includes("application/json")) {
    next(new ApiError(415, "UNSUPPORTED_MEDIA_TYPE", "Ожидается Content-Type: application/json."));
    return;
  }

  if (/gzip|deflate|br/i.test(req.headers["content-encoding"] ?? "")) {
    next(new ApiError(415, "UNSUPPORTED_MEDIA_TYPE", "Сжатое тело не поддерживается."));
    return;
  }

  next();
}

function rejectEmptyBody(req, res, next) {
  if (req.headers["content-length"] === "0") {
    next(new ApiError(400, "INVALID_JSON", "Тело запроса отсутствует."));
    return;
  }

  next();
}

export function jsonBody() {
  return [
    requireJsonContentType,
    rejectEmptyBody,
    express.json({
      limit: LIMIT,
      strict: false,
      inflate: false,
      type: "*/*",
    }),
  ];
}

export function jsonErrorHandler(err, req, res, next) {
  if (err?.type === "entity.parse.failed") {
    next(new ApiError(400, "INVALID_JSON", "Тело запроса не является корректным JSON."));
    return;
  }

  if (err?.type === "entity.too.large") {
    next(new ApiError(413, "PAYLOAD_TOO_LARGE", "Тело запроса слишком большое."));
    return;
  }

  if (err?.status === 415 || err?.type === "charset.unsupported") {
    next(new ApiError(415, "UNSUPPORTED_MEDIA_TYPE", "Ожидается Content-Type: application/json."));
    return;
  }

  next(err);
}

export function requireJsonObject(req, res, next) {
  if (req.body === undefined) {
    next(new ApiError(400, "INVALID_JSON", "Тело запроса отсутствует."));
    return;
  }

  next();
}
