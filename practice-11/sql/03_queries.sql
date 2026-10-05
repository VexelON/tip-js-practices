-- Q1. Все задачи с названием категории.
SELECT
  t.id,
  t.title,
  t.completed,
  t.priority,
  t.category_id,
  c.name AS category_name
FROM public.tasks AS t
INNER JOIN public.categories AS c ON c.id = t.category_id
ORDER BY t.id;

-- Q2. Невыполненные задачи высокого приоритета в категории 2.
SELECT t.id, t.title, t.completed, t.priority, t.category_id
FROM public.tasks AS t
WHERE t.completed = false
  AND t.priority = 'high'
  AND t.category_id = 2
ORDER BY t.id;

-- Q3. Поиск «ПРОВЕР» без учёта регистра.
SELECT t.id, t.title, t.completed, t.priority, t.category_id
FROM public.tasks AS t
WHERE t.title ILIKE '%ПРОВЕР%'
ORDER BY t.id;

-- Q4. Число задач по категориям, включая пустые.
SELECT
  c.id,
  c.name,
  count(t.id) AS task_count
FROM public.categories AS c
LEFT JOIN public.tasks AS t ON t.category_id = c.id
GROUP BY c.id, c.name
ORDER BY c.id;

-- Q5. Выполненные и невыполненные в каждой категории.
SELECT
  c.id,
  c.name,
  count(t.id) FILTER (WHERE t.completed) AS completed_count,
  count(t.id) FILTER (WHERE t.completed IS FALSE) AS active_count
FROM public.categories AS c
LEFT JOIN public.tasks AS t ON t.category_id = c.id
GROUP BY c.id, c.name
ORDER BY c.id;

-- Q6. Категории с не менее чем четырьмя задачами.
SELECT
  c.id,
  c.name,
  count(t.id) AS task_count
FROM public.categories AS c
INNER JOIN public.tasks AS t ON t.category_id = c.id
GROUP BY c.id, c.name
HAVING count(t.id) >= 4
ORDER BY c.id;

-- Q7. Задача 4 с именами полей API.
SELECT
  t.id,
  t.title,
  t.completed,
  t.priority,
  t.category_id AS "categoryId"
FROM public.tasks AS t
WHERE t.id = 4;
