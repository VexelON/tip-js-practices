import { useState } from "react";
import { validateTaskDraft } from "../domain/task-service.js";
import StatusMessage from "./StatusMessage.jsx";

export default function TaskForm({ categories, initialTask, onSave, onCancel }) {
  const [title, setTitle] = useState(initialTask?.title ?? "");
  const [priority, setPriority] = useState(initialTask?.priority ?? "medium");
  const [categoryId, setCategoryId] = useState(
    initialTask ? String(initialTask.categoryId) : String(categories[0]?.id ?? "")
  );
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("");
  const [alert, setAlert] = useState("");
  const editing = initialTask !== null && initialTask !== undefined;

  function handleSubmit(event) {
    event.preventDefault();
    setAlert("");

    const result = validateTaskDraft({ title, priority, categoryId }, categories);

    setErrors(result.errors);

    if (!result.valid) {
      setStatus("Исправьте отмеченные поля.");

      return;
    }

    const saved = onSave(result.value);

    if (saved) {
      setStatus(editing ? "Изменения сохранены." : "Задача создана.");
      setTitle("");
      setPriority("medium");
      setCategoryId(String(categories[0]?.id ?? ""));
      setErrors({});
    } else {
      setAlert("Сохранение не выполнено: запись уже отсутствует.");
    }
  }

  return (
    <section className="panel" aria-labelledby="form-title">
      <h2 id="form-title">{editing ? `Редактирование задачи № ${initialTask.id}` : "Добавление задачи"}</h2>
      <form className="task-form" noValidate onSubmit={handleSubmit}>
        <div className="form-row">
          <label htmlFor="field-title">Название</label>
          <input
            id="field-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            aria-invalid={Boolean(errors.title)}
            aria-describedby="error-title"
          />
          <p id="error-title" className="field-error">
            {errors.title ?? ""}
          </p>
        </div>
        <div className="form-row">
          <label htmlFor="field-priority">Приоритет</label>
          <select
            id="field-priority"
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
            aria-invalid={Boolean(errors.priority)}
            aria-describedby="error-priority"
          >
            <option value="low">Низкий</option>
            <option value="medium">Средний</option>
            <option value="high">Высокий</option>
          </select>
          <p id="error-priority" className="field-error">
            {errors.priority ?? ""}
          </p>
        </div>
        <div className="form-row">
          <label htmlFor="field-category">Категория</label>
          <select
            id="field-category"
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            aria-invalid={Boolean(errors.categoryId)}
            aria-describedby="error-categoryId"
          >
            {categories.map((item) => (
              <option key={item.id} value={String(item.id)}>
                {item.name}
              </option>
            ))}
          </select>
          <p id="error-categoryId" className="field-error">
            {errors.categoryId ?? ""}
          </p>
        </div>
        <div className="form-actions">
          <button type="submit">{editing ? "Сохранить изменения" : "Добавить задачу"}</button>
          {editing ? (
            <button type="button" onClick={onCancel}>
              Отменить
            </button>
          ) : null}
        </div>
        <StatusMessage kind="success">{status}</StatusMessage>
        <StatusMessage kind="error">{alert}</StatusMessage>
      </form>
    </section>
  );
}
