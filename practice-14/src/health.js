import { Router } from "express";

export function createHealthRouter({ store, releaseVersion, getReady }) {
  const router = Router();

  router.get("/live", (req, res) => {
    res.status(200).json({
      data: { status: "live", version: releaseVersion },
    });
  });

  router.get("/ready", async (req, res) => {
    try {
      if (getReady && !getReady()) {
        res.status(503).json({
          error: { code: "NOT_READY", message: "Сервис не готов принимать запросы." },
        });
        return;
      }

      await store.ping();
      res.status(200).json({ data: { status: "ready", version: releaseVersion } });
    } catch {
      res.status(503).json({
        error: { code: "DATABASE_UNAVAILABLE", message: "База данных недоступна." },
      });
    }
  });

  return router;
}
