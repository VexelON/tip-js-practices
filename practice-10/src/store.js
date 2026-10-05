import { findTask, selectTasks } from "./task-service.js";

export function createStore(seed) {
  const categories = seed.categories.map((item) => ({ ...item }));
  let tasks = seed.tasks.map((item) => ({ ...item }));
  let nextId = tasks.reduce((max, task) => Math.max(max, task.id), 0) + 1;

  function copyTask(task) {
    return { ...task };
  }

  return {
    listCategories() {
      return categories.map((item) => ({ ...item }));
    },

    listTasks(filters) {
      return selectTasks(tasks, filters).map(copyTask);
    },

    getTask(id) {
      const task = findTask(tasks, id);
      return task ? copyTask(task) : null;
    },

    createTask(value) {
      const task = {
        id: nextId,
        title: value.title,
        completed: false,
        priority: value.priority,
        categoryId: value.categoryId,
      };

      nextId += 1;
      tasks = [...tasks, task];

      return copyTask(task);
    },

    updateTask(id, changes) {
      const index = tasks.findIndex((task) => task.id === id);

      if (index === -1) {
        return null;
      }

      const updated = { ...tasks[index], ...changes, id: tasks[index].id };
      tasks = tasks.map((task, position) => (position === index ? updated : task));

      return copyTask(updated);
    },

    deleteTask(id) {
      const exists = tasks.some((task) => task.id === id);

      if (!exists) {
        return false;
      }

      tasks = tasks.filter((task) => task.id !== id);

      return true;
    },

    reset(seedData) {
      tasks = seedData.tasks.map((item) => ({ ...item }));
      nextId = tasks.reduce((max, task) => Math.max(max, task.id), 0) + 1;

      return { reset: true, total: tasks.length };
    },
  };
}
