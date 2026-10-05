-- Дополнительное задание: временная пустая категория для Q4/Q5.
BEGIN;

INSERT INTO public.categories (name) VALUES ('Пустая учебная');

SELECT
  c.id,
  c.name,
  count(t.id) AS task_count
FROM public.categories AS c
LEFT JOIN public.tasks AS t ON t.category_id = c.id
GROUP BY c.id, c.name
ORDER BY c.id;

SELECT
  c.id,
  c.name,
  count(t.id) FILTER (WHERE t.completed) AS completed_count,
  count(t.id) FILTER (WHERE t.completed IS FALSE) AS active_count
FROM public.categories AS c
LEFT JOIN public.tasks AS t ON t.category_id = c.id
GROUP BY c.id, c.name
ORDER BY c.id;

ROLLBACK;
