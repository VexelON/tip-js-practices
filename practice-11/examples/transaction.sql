-- Учебный пример: изменение внутри транзакции откатывается.
SELECT completed AS before_update
FROM public.tasks
WHERE id = 4;

BEGIN;

UPDATE public.tasks
SET completed = true
WHERE id = 4;

SELECT completed AS inside_transaction
FROM public.tasks
WHERE id = 4;

ROLLBACK;

SELECT completed AS after_rollback
FROM public.tasks
WHERE id = 4;
