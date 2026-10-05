const TASK_COLUMNS = 'id, title, completed, priority, category_id AS "categoryId"';

export function escapeLikePattern(value) {
  return String(value).replaceAll("\\", "\\\\").replaceAll("%", "\\%").replaceAll("_", "\\_");
}

export function buildListTasksQuery(filters = {}) {
  const values = [];
  const conditions = [];

  if (filters.completed !== null && filters.completed !== undefined) {
    values.push(filters.completed);
    conditions.push(`completed = $${values.length}`);
  }

  if (filters.priority !== null && filters.priority !== undefined) {
    values.push(filters.priority);
    conditions.push(`priority = $${values.length}`);
  }

  if (filters.categoryId !== null && filters.categoryId !== undefined) {
    values.push(filters.categoryId);
    conditions.push(`category_id = $${values.length}`);
  }

  if (typeof filters.q === "string" && filters.q !== "") {
    values.push(`%${escapeLikePattern(filters.q)}%`);
    conditions.push(`title ILIKE $${values.length} ESCAPE E'\\\\'`);
  }

  const where = conditions.length > 0 ? ` WHERE ${conditions.join(" AND ")}` : "";

  return {
    text: `SELECT ${TASK_COLUMNS} FROM public.tasks${where} ORDER BY id`,
    values,
  };
}

const PATCH_FIELDS = [
  ["title", "title"],
  ["completed", "completed"],
  ["priority", "priority"],
  ["categoryId", "category_id"],
];

export function buildUpdateTaskQuery(id, changes) {
  if (changes === null || typeof changes !== "object" || Array.isArray(changes)) {
    throw new TypeError("changes должен быть объектом.");
  }

  const assignments = [];
  const values = [];

  for (const [jsonName, column] of PATCH_FIELDS) {
    if (Object.hasOwn(changes, jsonName)) {
      values.push(changes[jsonName]);
      assignments.push(`${column} = $${values.length}`);
    }
  }

  if (assignments.length === 0) {
    throw new TypeError("PATCH не содержит разрешённых полей.");
  }

  values.push(id);

  return {
    text: `UPDATE public.tasks SET ${assignments.join(", ")} WHERE id = $${values.length} RETURNING ${TASK_COLUMNS}`,
    values,
  };
}

export function buildInsertTaskQuery(value) {
  return {
    text: `INSERT INTO public.tasks (title, priority, category_id) VALUES ($1, $2, $3) RETURNING ${TASK_COLUMNS}`,
    values: [value.title, value.priority, value.categoryId],
  };
}

export function buildGetTaskQuery(id) {
  return {
    text: `SELECT ${TASK_COLUMNS} FROM public.tasks WHERE id = $1`,
    values: [id],
  };
}

export function buildDeleteTaskQuery(id) {
  return {
    text: "DELETE FROM public.tasks WHERE id = $1",
    values: [id],
  };
}
