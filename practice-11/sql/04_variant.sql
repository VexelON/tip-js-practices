-- Вариант 6: невыполненные задачи «Проекта», кроме приоритета low.
SELECT
  t.id,
  t.title,
  t.completed,
  t.priority,
  c.name AS category_name
FROM public.tasks AS t
INNER JOIN public.categories AS c ON c.id = t.category_id
WHERE c.name = 'Проект'
  AND t.completed = false
  AND t.priority <> 'low'
ORDER BY t.id;
