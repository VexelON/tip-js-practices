export function createLogger({ service = "tip-tasks-api" } = {}) {
  function write(level, message, fields = {}) {
    const line = {
      ts: new Date().toISOString(),
      level,
      service,
      message,
      ...fields,
    };

    const output = level === "error" ? console.error : console.log;
    output(JSON.stringify(line));
  }

  return {
    info: (message, fields) => write("info", message, fields),
    warn: (message, fields) => write("warn", message, fields),
    error: (message, fields) => write("error", message, fields),
  };
}

export function requestLogger(logger, tracker) {
  return (req, res, next) => {
    const started = Date.now();
    const requestId = req.headers["x-request-id"] ?? crypto.randomUUID();
    req.requestId = requestId;
    res.setHeader("X-Request-Id", requestId);
    tracker?.begin();

    res.on("finish", () => {
      tracker?.end();
      logger.info("request", {
        requestId,
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        durationMs: Date.now() - started,
      });
    });

    next();
  };
}
