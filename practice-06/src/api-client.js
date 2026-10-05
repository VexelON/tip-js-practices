export const API_ERROR_KINDS = ["http", "network", "invalid-response", "timeout", "aborted"];

export class ApiError extends Error {
  constructor(kind, message, details = {}) {
    super(message);
    this.name = "ApiError";
    this.kind = kind;
    Object.assign(this, details);
  }
}

export function buildUrl(baseUrl, path, query = {}) {
  throw new Error("Не реализовано: buildUrl");
}

export function createApiClient(options = {}) {
  throw new Error("Не реализовано: createApiClient");
}
