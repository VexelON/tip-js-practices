export function loadConfig(env = process.env) {
  const host = env.API_HOST ?? "127.0.0.1";
  const portRaw = env.API_PORT ?? "5505";
  const port = Number(portRaw);
  const databaseUrl = env.DATABASE_URL ?? "";
  const enableDebugReset = env.ENABLE_DEBUG_RESET === "true";

  if (typeof host !== "string" || host.trim() === "" || host.includes(" ") || host.length > 255) {
    throw new Error("API_HOST должен быть непустой строкой без пробелов не длиннее 255.");
  }

  if (!Number.isInteger(port) || port < 1024 || port > 65535) {
    throw new Error("API_PORT должен быть целым числом от 1024 до 65535.");
  }

  if (typeof databaseUrl !== "string" || !databaseUrl.startsWith("postgres")) {
    throw new Error("DATABASE_URL должен быть строкой подключения PostgreSQL.");
  }

  return { host, port, databaseUrl, enableDebugReset };
}
