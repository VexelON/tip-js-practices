const PRIORITIES = ["low", "medium", "high"];
const TITLE_MAX = 100;

function positiveId(value) {
  return Number.isSafeInteger(value) && value > 0;
}

export function validateTaskDraft(draft, categories) {
  const errors = {};

  if (draft === null || typeof draft !== "object" || Array.isArray(draft)) {
    return { valid: false, value: null, errors: { title: "Черновик должен быть объектом." } };
  }

  let title = "";

  if (typeof draft.title !== "string") {
    errors.title = "Название должно быть строкой.";
  } else {
    title = draft.title.trim();

    if (title.length < 1 || title.length > TITLE_MAX) {
      errors.title = "Название должно содержать от 1 до 100 символов.";
    }
  }

  if (!PRIORITIES.includes(draft.priority)) {
    errors.priority = "Выберите приоритет: low, medium или high.";
  }

  const rawId = draft.categoryId;
  const categoryId = typeof rawId === "number" ? rawId : Number(rawId);
  const list = Array.isArray(categories) ? categories : [];

  if (typeof rawId === "string" && !/^\d+$/.test(rawId.trim())) {
    errors.categoryId = "Выберите категорию.";
  } else if (!positiveId(categoryId) || list.find((item) => item.id === categoryId) === undefined) {
    errors.categoryId = "Выберите существующую категорию.";
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, value: null, errors };
  }

  return { valid: true, value: { title, priority: draft.priority, categoryId }, errors: {} };
}

export function selectTasks(tasks, filters = {}) {
  const q = String(filters.q ?? "").trim().toLowerCase();
  const completed = filters.completed ?? "";
  const priority = filters.priority ?? "";
  const categoryId = filters.categoryId ?? "";

  return tasks.filter((task) => {
    if (q !== "" && !task.title.toLowerCase().includes(q)) {
      return false;
    }

    if (completed === "true" && task.completed !== true) {
      return false;
    }

    if (completed === "false" && task.completed !== false) {
      return false;
    }

    if (priority !== "" && task.priority !== priority) {
      return false;
    }

    if (categoryId !== "" && String(task.categoryId) !== String(categoryId)) {
      return false;
    }

    return true;
  });
}

export function getTaskStats(tasks) {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed).length;

  return { total, completed, active: total - completed };
}

export function addTask(tasks, value, id) {
  if (!positiveId(id)) {
    throw new Error("Идентификатор должен быть положительным целым числом.");
  }

  if (tasks.some((task) => task.id === id)) {
    throw new Error(`Задача с идентификатором ${id} уже существует.`);
  }

  return [...tasks, { id, title: value.title, completed: false, priority: value.priority, categoryId: value.categoryId }];
}

export function updateTask(tasks, id, value) {
  if (!tasks.some((task) => task.id === id)) {
    return tasks;
  }

  return tasks.map((task) =>
    task.id === id
      ? { ...task, title: value.title, priority: value.priority, categoryId: value.categoryId }
      : task
  );
}

export function toggleTask(tasks, id) {
  if (!tasks.some((task) => task.id === id)) {
    return tasks;
  }

  return tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task));
}

export function removeTask(tasks, id) {
  if (!tasks.some((task) => task.id === id)) {
    return tasks;
  }

  return tasks.filter((task) => task.id !== id);
}

export function nextTaskId(tasks) {
  if (tasks.length === 0) {
    return 1;
  }

  return Math.max(...tasks.map((task) => task.id)) + 1;
}
