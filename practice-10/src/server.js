import { pathToFileURL } from "node:url";

import { createApp } from "./app.js";

function parsePort(raw) {
  if (raw === undefined || raw === "") {
    return null;
  }

  const value = Number(raw);

  if (!Number.isInteger(value) || value < 1024 || value > 65535) {
    return null;
  }

  return value;
}

function resolvePort() {
  return parsePort(process.argv[2]) ?? parsePort(process.env.API_PORT) ?? 5505;
}

const isEntry =
  process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isEntry) {
  const port = resolvePort();
  const app = createApp();

  app.listen(port, "127.0.0.1", () => {
    console.log(`API: http://127.0.0.1:${port}/api`);
  });
}
