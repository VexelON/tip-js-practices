# Практическая работа № 14 — отчёт

Релиз v1.0.0. Вариант 6: счётчик активных запросов; при остановке процесс ждёт нуля в пределах таймаута.

`GET /health/live` не зависит от БД. `GET /health/ready` проверяет ping и флаг приёма. Логи — JSON с request id. Docker multi-stage, Compose, GitHub Actions `quality.yml`.

Тег `v1.0.0` создаётся локально. `git push` и Actions выполняет сдающий.
