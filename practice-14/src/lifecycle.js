export function createRequestTracker() {
  let active = 0;

  return {
    begin() {
      active += 1;
    },
    end() {
      active = Math.max(0, active - 1);
    },
    getActive() {
      return active;
    },
    async waitForIdle(timeoutMs) {
      const started = Date.now();

      while (active > 0 && Date.now() - started < timeoutMs) {
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      return active === 0;
    },
  };
}

export function installLifecycle({ server, pool, tracker, logger, timeoutMs = 10_000, onStop }) {
  let stopping = false;

  async function shutdown(signal) {
    if (stopping) {
      return;
    }

    stopping = true;
    onStop?.();
    logger?.info("shutdown", { signal });

    await new Promise((resolve) => server.close(resolve));
    const idle = await tracker.waitForIdle(timeoutMs);

    if (!idle) {
      logger?.warn("shutdown-timeout", { active: tracker.getActive() });
    }

    await pool?.end?.();
  }

  process.on("SIGTERM", () => {
    void shutdown("SIGTERM");
  });
  process.on("SIGINT", () => {
    void shutdown("SIGINT");
  });

  return { shutdown, isStopping: () => stopping };
}
