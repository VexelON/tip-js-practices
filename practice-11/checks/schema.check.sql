BEGIN;

CREATE TEMP TABLE check_log (
  n integer PRIMARY KEY,
  label text NOT NULL
);

CREATE FUNCTION pg_temp.pass(label text) RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  next_n integer;
BEGIN
  SELECT coalesce(max(n), 0) + 1 INTO next_n FROM check_log;
  INSERT INTO check_log (n, label) VALUES (next_n, label);
  RAISE NOTICE 'PASS %', label;
END;
$$;

CREATE FUNCTION pg_temp.require(ok boolean, label text) RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT ok THEN
    RAISE EXCEPTION 'FAIL %', label;
  END IF;
  PERFORM pg_temp.pass(label);
END;
$$;

SELECT pg_temp.require(
  to_regclass('public.categories') IS NOT NULL,
  'таблица categories существует'
);

SELECT pg_temp.require(
  to_regclass('public.tasks') IS NOT NULL,
  'таблица tasks существует'
);

SELECT pg_temp.require(
  EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'categories'
      AND column_name = 'id'
      AND data_type = 'integer'
      AND is_identity = 'YES'
      AND identity_generation = 'BY DEFAULT'
  ),
  'categories.id — identity BY DEFAULT'
);

SELECT pg_temp.require(
  EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'tasks'
      AND column_name = 'id'
      AND data_type = 'integer'
      AND is_identity = 'YES'
      AND identity_generation = 'BY DEFAULT'
  ),
  'tasks.id — identity BY DEFAULT'
);

SELECT pg_temp.require(
  EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.categories'::regclass
      AND contype = 'p'
  ),
  'PRIMARY KEY categories'
);

SELECT pg_temp.require(
  EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.tasks'::regclass
      AND contype = 'p'
  ),
  'PRIMARY KEY tasks'
);

SELECT pg_temp.require(
  EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.categories'::regclass
      AND contype = 'u'
  ),
  'UNIQUE name категории'
);

SELECT pg_temp.require(
  (
    SELECT is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'categories' AND column_name = 'name'
  ) = 'NO',
  'categories.name NOT NULL'
);

SELECT pg_temp.require(
  (
    SELECT is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'title'
  ) = 'NO',
  'tasks.title NOT NULL'
);

SELECT pg_temp.require(
  (
    SELECT is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'completed'
  ) = 'NO'
  AND (
    SELECT column_default
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'completed'
  ) ILIKE '%false%',
  'completed NOT NULL DEFAULT false'
);

SELECT pg_temp.require(
  (
    SELECT is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'priority'
  ) = 'NO'
  AND (
    SELECT column_default
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'priority'
  ) IS NULL,
  'priority NOT NULL без DEFAULT'
);

SELECT pg_temp.require(
  (
    SELECT is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'category_id'
  ) = 'NO',
  'category_id NOT NULL'
);

SELECT pg_temp.require(
  EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.tasks'::regclass
      AND contype = 'f'
      AND confdeltype = 'r'
  ),
  'FK ON DELETE RESTRICT'
);

SELECT pg_temp.require(
  EXISTS (
    SELECT 1
    FROM pg_class
    WHERE relname = 'tasks_category_id_idx'
      AND relkind = 'i'
  ),
  'индекс tasks_category_id_idx'
);

SELECT pg_temp.require(
  (SELECT count(*) FROM public.categories) = 3,
  'исходных категорий 3'
);

SELECT pg_temp.require(
  (SELECT count(*) FROM public.tasks) = 12,
  'исходных задач 12'
);

SELECT pg_temp.require(
  (
    SELECT array_agg(id ORDER BY id)
    FROM public.tasks
  ) = ARRAY[1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34],
  'исходные id задач совпадают'
);

SELECT pg_temp.require(
  (
    SELECT last_value
    FROM pg_sequences
    WHERE schemaname = 'public'
      AND sequencename = split_part(pg_get_serial_sequence('public.categories', 'id'), '.', 2)
  ) = 3,
  'последовательность категорий синхронизирована'
);

SELECT pg_temp.require(
  (
    SELECT last_value
    FROM pg_sequences
    WHERE schemaname = 'public'
      AND sequencename = split_part(pg_get_serial_sequence('public.tasks', 'id'), '.', 2)
  ) = 34,
  'последовательность задач синхронизирована'
);

DO $$
BEGIN
  BEGIN
    INSERT INTO public.categories (name) VALUES ('');
    PERFORM pg_temp.require(false, 'пустое имя категории отклоняется');
  EXCEPTION
    WHEN check_violation THEN
      PERFORM pg_temp.pass('пустое имя категории отклоняется');
  END;
END $$;

DO $$
BEGIN
  BEGIN
    INSERT INTO public.categories (name) VALUES (' пробел ');
    PERFORM pg_temp.require(false, 'имя категории с пробелами по краям отклоняется');
  EXCEPTION
    WHEN check_violation THEN
      PERFORM pg_temp.pass('имя категории с пробелами по краям отклоняется');
  END;
END $$;

DO $$
BEGIN
  BEGIN
    INSERT INTO public.categories (name) VALUES (repeat('а', 101));
    PERFORM pg_temp.require(false, 'имя категории длиннее 100 отклоняется');
  EXCEPTION
    WHEN check_violation THEN
      PERFORM pg_temp.pass('имя категории длиннее 100 отклоняется');
  END;
END $$;

DO $$
BEGIN
  BEGIN
    INSERT INTO public.tasks (title, priority, category_id) VALUES ('', 'low', 1);
    PERFORM pg_temp.require(false, 'пустой title отклоняется');
  EXCEPTION
    WHEN check_violation THEN
      PERFORM pg_temp.pass('пустой title отклоняется');
  END;
END $$;

DO $$
BEGIN
  BEGIN
    INSERT INTO public.tasks (title, priority, category_id) VALUES (' пробел ', 'low', 1);
    PERFORM pg_temp.require(false, 'title с пробелами по краям отклоняется');
  EXCEPTION
    WHEN check_violation THEN
      PERFORM pg_temp.pass('title с пробелами по краям отклоняется');
  END;
END $$;

DO $$
BEGIN
  BEGIN
    INSERT INTO public.tasks (title, priority, category_id) VALUES (repeat('а', 101), 'low', 1);
    PERFORM pg_temp.require(false, 'title длиннее 100 отклоняется');
  EXCEPTION
    WHEN check_violation THEN
      PERFORM pg_temp.pass('title длиннее 100 отклоняется');
  END;
END $$;

DO $$
BEGIN
  BEGIN
    INSERT INTO public.tasks (title, priority, category_id) VALUES ('Неверный приоритет', 'urgent', 1);
    PERFORM pg_temp.require(false, 'недопустимый priority отклоняется');
  EXCEPTION
    WHEN check_violation THEN
      PERFORM pg_temp.pass('недопустимый priority отклоняется');
  END;
END $$;

DO $$
BEGIN
  BEGIN
    INSERT INTO public.categories (id, name) VALUES (0, 'Ноль');
    PERFORM pg_temp.require(false, 'неположительный id категории отклоняется');
  EXCEPTION
    WHEN check_violation THEN
      PERFORM pg_temp.pass('неположительный id категории отклоняется');
  END;
END $$;

DO $$
BEGIN
  BEGIN
    INSERT INTO public.tasks (id, title, priority, category_id) VALUES (-1, 'Отрицательный id', 'low', 1);
    PERFORM pg_temp.require(false, 'неположительный id задачи отклоняется');
  EXCEPTION
    WHEN check_violation THEN
      PERFORM pg_temp.pass('неположительный id задачи отклоняется');
  END;
END $$;

DO $$
BEGIN
  BEGIN
    INSERT INTO public.tasks (title, priority, category_id) VALUES ('Нет категории', 'low', 999);
    PERFORM pg_temp.require(false, 'FK отклоняет отсутствующую категорию');
  EXCEPTION
    WHEN foreign_key_violation THEN
      PERFORM pg_temp.pass('FK отклоняет отсутствующую категорию');
  END;
END $$;

DO $$
BEGIN
  BEGIN
    DELETE FROM public.categories WHERE id = 2;
    PERFORM pg_temp.require(false, 'категория с задачами не удаляется');
  EXCEPTION
    WHEN foreign_key_violation THEN
      PERFORM pg_temp.pass('категория с задачами не удаляется');
  END;
END $$;

DO $$
DECLARE
  new_id integer;
BEGIN
  INSERT INTO public.categories (name) VALUES ('Временная пустая') RETURNING id INTO new_id;
  DELETE FROM public.categories WHERE id = new_id;
  PERFORM pg_temp.pass('пустую категорию можно удалить');
END $$;

DO $$
DECLARE
  new_id integer;
  completed_value boolean;
BEGIN
  INSERT INTO public.tasks (title, priority, category_id)
  VALUES ('Без completed', 'low', 1)
  RETURNING id, completed INTO new_id, completed_value;
  PERFORM pg_temp.require(completed_value IS FALSE, 'DEFAULT completed = false');
  DELETE FROM public.tasks WHERE id = new_id;
END $$;

DO $$
DECLARE
  new_id integer;
BEGIN
  INSERT INTO public.tasks (title, priority, category_id)
  VALUES ('Допустимая вставка', 'medium', 2)
  RETURNING id INTO new_id;
  PERFORM pg_temp.require(new_id > 34, 'допустимая вставка получает id после 34');
  DELETE FROM public.tasks WHERE id = new_id;
END $$;

SELECT pg_temp.require(
  (
    SELECT array_agg(id ORDER BY id)
    FROM public.tasks
    WHERE completed = false AND priority = 'high' AND category_id = 2
  ) = ARRAY[4, 34],
  'фильтр high/active/category 2'
);

SELECT pg_temp.require(
  (
    SELECT array_agg(id ORDER BY id)
    FROM public.tasks
    WHERE title ILIKE '%ПРОВЕР%'
  ) = ARRAY[7, 16],
  'поиск ПРОВЕР'
);

SELECT pg_temp.require(
  (
    SELECT array_agg(cnt ORDER BY category_id)
    FROM (
      SELECT c.id AS category_id, count(t.id) AS cnt
      FROM public.categories AS c
      LEFT JOIN public.tasks AS t ON t.category_id = c.id
      GROUP BY c.id
    ) AS counts
  ) = ARRAY[3, 6, 3]::bigint[],
  'число задач по категориям'
);

SELECT pg_temp.require(
  (
    SELECT array_agg(completed_count ORDER BY id)
    FROM (
      SELECT
        c.id,
        count(t.id) FILTER (WHERE t.completed) AS completed_count
      FROM public.categories AS c
      LEFT JOIN public.tasks AS t ON t.category_id = c.id
      GROUP BY c.id
    ) AS counts
  ) = ARRAY[1, 2, 2]::bigint[],
  'число выполненных по категориям'
);

SELECT pg_temp.require(
  (
    SELECT array_agg(id ORDER BY id)
    FROM (
      SELECT c.id
      FROM public.categories AS c
      INNER JOIN public.tasks AS t ON t.category_id = c.id
      GROUP BY c.id
      HAVING count(t.id) >= 4
    ) AS grouped
  ) = ARRAY[2],
  'HAVING не менее четырёх задач'
);

DO $$
DECLARE
  new_id integer;
BEGIN
  INSERT INTO public.categories (name) VALUES ('Уникальный конфликт') RETURNING id INTO new_id;
  BEGIN
    INSERT INTO public.categories (name) VALUES ('Уникальный конфликт');
    PERFORM pg_temp.require(false, 'повтор имени категории отклоняется');
  EXCEPTION
    WHEN unique_violation THEN
      PERFORM pg_temp.pass('повтор имени категории отклоняется');
  END;
  DELETE FROM public.categories WHERE id = new_id;
END $$;

DO $$
DECLARE
  deleted_id integer;
  next_id integer;
BEGIN
  INSERT INTO public.tasks (title, priority, category_id)
  VALUES ('Удалить для последовательности', 'low', 1)
  RETURNING id INTO deleted_id;
  DELETE FROM public.tasks WHERE id = deleted_id;
  INSERT INTO public.tasks (title, priority, category_id)
  VALUES ('После удаления', 'low', 1)
  RETURNING id INTO next_id;
  PERFORM pg_temp.require(next_id > deleted_id, 'после удаления id не переиспользуется');
  DELETE FROM public.tasks WHERE id = next_id;
END $$;

SELECT pg_temp.require(
  (
    SELECT array_agg(id ORDER BY id)
    FROM public.tasks
    WHERE category_id = 2
      AND completed = false
      AND priority <> 'low'
  ) = ARRAY[4, 28, 34],
  'вариант 6: проект в работе кроме low'
);

DO $$
DECLARE
  n integer;
BEGIN
  SELECT count(*) INTO n FROM check_log;
  IF n <> 41 THEN
    RAISE EXCEPTION 'FAIL ожидалось 41 PASS, получено %', n;
  END IF;
END $$;

SELECT format('passed: %s', count(*)) AS summary
FROM check_log;

ROLLBACK;
