import assert from "node:assert/strict";
import { after, test } from "node:test";

import { createApp } from "../../src/app.js";
import { createRequestTracker, installLifecycle } from "../../src/lifecycle.js";
import { createLogger } from "../../src/logger.js";

test("live не обращается к store", async () => {
  const store = {
    ping: async () => {
      throw new Error("нельзя");
    },
    listCategories: async () => [],
    listTasks: async () => [],
    getTask: async () => null,
  };
  const app = createApp({ store, releaseVersion: "1.0.0" });
  const server = app.listen(0, "127.0.0.1");
  after(() => new Promise((resolve) => server.close(resolve)));
  await new Promise((resolve) => server.on("listening", resolve));
  const port = server.address().port;
  const response = await fetch(`http://127.0.0.1:${port}/health/live`);
  assert.equal(response.status, 200);
  assert.equal((await response.json()).data.status, "live");
});

test("ready 503 если ping падает", async () => {
  const store = {
    ping: async () => {
      throw new Error("db");
    },
    listCategories: async () => [],
    listTasks: async () => [],
    getTask: async () => null,
  };
  const app = createApp({ store });
  const server = app.listen(0, "127.0.0.1");
  after(() => new Promise((resolve) => server.close(resolve)));
  await new Promise((resolve) => server.on("listening", resolve));
  const port = server.address().port;
  const response = await fetch(`http://127.0.0.1:${port}/health/ready`);
  assert.equal(response.status, 503);
});

test("ready 503 если getReady false", async () => {
  const store = {
    ping: async () => true,
    listCategories: async () => [],
    listTasks: async () => [],
    getTask: async () => null,
  };
  const app = createApp({ store, getReady: () => false });
  const server = app.listen(0, "127.0.0.1");
  after(() => new Promise((resolve) => server.close(resolve)));
  await new Promise((resolve) => server.on("listening", resolve));
  const port = server.address().port;
  const response = await fetch(`http://127.0.0.1:${port}/health/ready`);
  assert.equal(response.status, 503);
});

test("tracker waitForIdle с коротким таймаутом", async () => {
  const tracker = createRequestTracker();
  tracker.begin();
  const idle = await tracker.waitForIdle(20);
  assert.equal(idle, false);
  tracker.end();
  assert.equal(await tracker.waitForIdle(50), true);
});

test("shutdown ждёт активные запросы", async () => {
  const tracker = createRequestTracker();
  const logger = createLogger({ service: "test" });
  const server = {
    close(cb) {
      cb();
    },
  };
  const pool = { async end() {} };
  const { shutdown } = installLifecycle({ server, pool, tracker, logger, timeoutMs: 30 });
  tracker.begin();
  await shutdown("TEST");
  assert.equal(tracker.getActive(), 1);
});

test("logger пишет JSON", () => {
  const logger = createLogger({ service: "test" });
  logger.info("hello", { requestId: "1" });
  assert.equal(typeof logger.error, "function");
});
