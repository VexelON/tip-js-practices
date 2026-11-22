const PRIORITY_LABELS = { low: "Низкий", medium: "Средний", high: "Высокий" };

export default function TaskItem({ task, categoryName, onToggle, onEdit, onDelete }) {
  return (
    <li className={task.completed ? "task-card is-completed" : "task-card"} data-task-id={task.id}>
      <h3 className="task-title">{task.title}</h3>
      <span className="task-status">{task.completed ? "Выполнена" : "В работе"}</span>
      <span className="task-priority">{PRIORITY_LABELS[task.priority] ?? task.priority}</span>
      <span className="task-category">{categoryName}</span>
      <div className="task-actions">
        <button type="button" data-action="toggle" aria-pressed={task.completed} onClick={() => onToggle(task.id)}>
          <span className="action-label">Выполнена</span>
        </button>
        <button type="button" data-action="edit" onClick={() => onEdit(task.id)}>
          <span className="action-label">Изменить</span>
        </button>
        <button type="button" data-action="delete" onClick={() => onDelete(task.id)}>
          <span className="action-label">Удалить</span>
        </button>
      </div>
    </li>
  );
}
