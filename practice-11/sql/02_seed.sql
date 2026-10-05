INSERT INTO public.categories (id, name) VALUES
  (1, 'Учёба'),
  (2, 'Проект'),
  (3, 'Организация');

INSERT INTO public.tasks (id, title, completed, priority, category_id) VALUES
  (1, 'Изучить функции', true, 'medium', 1),
  (4, 'Подготовить модель задач', false, 'high', 2),
  (7, 'Проверить методы массивов', false, 'low', 1),
  (10, 'Оформить README', true, 'medium', 3),
  (13, 'Изучить работу с DOM', false, 'high', 1),
  (16, 'Проверить ответы API', true, 'high', 2),
  (19, 'Составить план занятий', false, 'medium', 3),
  (22, 'Подобрать примеры кода', false, 'low', 2),
  (25, 'Настроить структуру проекта', true, 'high', 2),
  (28, 'Описать контракт API', false, 'medium', 2),
  (31, 'Собрать список источников', true, 'low', 3),
  (34, 'Подготовить демонстрацию', false, 'high', 2);

SELECT setval(
  pg_get_serial_sequence('public.categories', 'id'),
  (SELECT max(id) FROM public.categories),
  true
);

SELECT setval(
  pg_get_serial_sequence('public.tasks', 'id'),
  (SELECT max(id) FROM public.tasks),
  true
);
