import { useState } from "react";
import { categories, tasks as seedTasks } from "./data.js";
import { createInitialFilters, EMPTY_FILTERS, variantNumber } from "./variant.js";
import {
  addTask,
  getTaskStats,
  nextTaskId,
  removeTask,
  selectTasks,
  toggleTask,
  updateTask,
} from "./domain/task-service.js";
import TaskForm from "./components/TaskForm.jsx";
import TaskFilters from "./components/TaskFilters.jsx";
import TaskList from "./components/TaskList.jsx";
import TaskStats from "./components/TaskStats.jsx";

export default function App() {
  const [tasks, setTasks] = useState(() => seedTasks.map((task) => ({ ...task })));
  const [filters, setFilters] = useState(() => createInitialFilters(variantNumber));
  const [editingId, setEditingId] = useState(null);

  const visibleTasks = selectTasks(tasks, filters);
  const stats = getTaskStats(tasks);
  const editingTask = tasks.find((task) => task.id === editingId) ?? null;

  function handleSave(value) {
    if (editingId === null) {
      setTasks((previous) => addTask(previous, value, nextTaskId(previous)));

      return true;
    }

    if (!tasks.some((task) => task.id === editingId)) {
      return false;
    }

    setTasks((previous) => updateTask(previous, editingId, value));
    setEditingId(null);

    return true;
  }

  function handleToggle(id) {
    setTasks((previous) => toggleTask(previous, id));
  }

  function handleDelete(id) {
    const confirmed = window.confirm(`Удалить задачу ${id}?`);

    if (!confirmed) {
      return;
    }

    setTasks((previous) => removeTask(previous, id));

    if (editingId === id) {
      setEditingId(null);
    }
  }

  return (
    <>
      <header className="page-header">
        <h1>Задачи на React</h1>
        <p className="storage-message">
          Вариант {variantNumber}. Данные хранятся в памяти страницы: перезагрузка возвращает исходный набор.
        </p>
      </header>
      <main className="page-main">
        <TaskStats stats={stats} />
        <TaskForm
          key={editingId ?? "new"}
          categories={categories}
          initialTask={editingTask}
          onSave={handleSave}
          onCancel={() => setEditingId(null)}
        />
        <TaskFilters filters={filters} categories={categories} onChange={setFilters} emptyFilters={EMPTY_FILTERS} />
        <TaskList
          tasks={visibleTasks}
          categories={categories}
          onToggle={handleToggle}
          onEdit={setEditingId}
          onDelete={handleDelete}
        />
      </main>
    </>
  );
}
