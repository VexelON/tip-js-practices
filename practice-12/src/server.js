import { pathToFileURL } from "node:url";

import { createAppFromEnv } from "./app.js";

const isEntry =
  process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isEntry) {
  const app = createAppFromEnv();
  const { host, port } = app.locals.config;

  app.listen(port, host, () => {
    console.log(`API: http://${host}:${port}/api`);
  });
}
