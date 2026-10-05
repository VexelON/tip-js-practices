import {
  buildDeleteTaskQuery,
  buildGetTaskQuery,
  buildInsertTaskQuery,
  buildListTasksQuery,
  buildUpdateTaskQuery,
} from "./query-builders.js";
import { SEED_CATEGORIES, SEED_TASKS } from "./seed.js";

export function createStore(pool) {
  async function listCategories() {
    const result = await pool.query("SELECT id, name FROM public.categories ORDER BY id");

    return result.rows;
  }

  async function listTasks(filters) {
    const query = buildListTasksQuery(filters);
    const result = await pool.query(query);

    return result.rows;
  }

  async function getTask(id) {
    const query = buildGetTaskQuery(id);
    const result = await pool.query(query);

    return result.rows[0] ?? null;
  }

  async function ping() {
    const result = await pool.query("SELECT 1 AS ok");

    return result.rows[0]?.ok === 1;
  }

  async function createTask(value) {
    const query = buildInsertTaskQuery(value);
    const result = await pool.query(query);

    return result.rows[0];
  }

  async function updateTask(id, changes) {
    const query = buildUpdateTaskQuery(id, changes);
    const result = await pool.query(query);

    return result.rows[0] ?? null;
  }

  async function deleteTask(id) {
    const query = buildDeleteTaskQuery(id);
    const result = await pool.query(query);

    return result.rowCount === 1;
  }

  async function reset() {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");
      await client.query("DELETE FROM public.tasks");
      await client.query("DELETE FROM public.categories");

      for (const category of SEED_CATEGORIES) {
        await client.query("INSERT INTO public.categories (id, name) VALUES ($1, $2)", [
          category.id,
          category.name,
        ]);
      }

      for (const task of SEED_TASKS) {
        await client.query(
          "INSERT INTO public.tasks (id, title, completed, priority, category_id) VALUES ($1, $2, $3, $4, $5)",
          [task.id, task.title, task.completed, task.priority, task.categoryId]
        );
      }

      await client.query(
        "SELECT setval(pg_get_serial_sequence('public.categories', 'id'), (SELECT max(id) FROM public.categories), true)"
      );
      await client.query(
        "SELECT setval(pg_get_serial_sequence('public.tasks', 'id'), (SELECT max(id) FROM public.tasks), true)"
      );
      await client.query("COMMIT");

      return { reset: true, total: SEED_TASKS.length };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  return {
    listCategories,
    listTasks,
    getTask,
    ping,
    createTask,
    updateTask,
    deleteTask,
    reset,
  };
}
