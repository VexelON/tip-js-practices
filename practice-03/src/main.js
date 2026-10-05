// Текущее состояние приложения, распознавание действий и вызовы отрисовки.
// Поиск, удаление и расчёт прогресса здесь не реализуются заново: используются функции ПР2.

import { demoTasks, variantTasks } from "./data.js";
import { findTaskById, removeTask, setTaskCompleted } from "./task-service.js";
import {
  PRIORITY_FILTERS,
  TASK_FILTERS,
  getTasksByPriority,
  getVisibleTasks,
} from "./task-selectors.js";
import { renderEmptyState, renderSummary, renderTaskList } from "./task-view.js";

const listElement = document.querySelector("#task-list");
const summaryElement = document.querySelector("#task-summary");
const emptyElement = document.querySelector("#empty-message");
const messageElement = document.querySelector("#operation-message");
const filtersElement = document.querySelector("#task-filters");
const priorityFiltersElement = document.querySelector("#priority-filters");

const datasetName = new URLSearchParams(window.location.search).get("dataset");
const initialTasks = datasetName === "variant" ? variantTasks : demoTasks;

// currentTasks хранит все актуальные задачи, currentFilter — режим отображения.
// Видимая выборка вычисляется отдельно и никогда не записывается в currentTasks.
let currentTasks = initialTasks.map((task) => ({ ...task }));
let currentFilter = "all";
let currentPriority = "all";

function showMessage(text) {
  messageElement.textContent = text;
}

function clearMessage() {
  messageElement.textContent = "";
}

/** Возвращает фокус на то же действие той же задачи, а при её исчезновении — на активный фильтр. */
function restoreTaskFocus(id, action) {
  const card = listElement.querySelector(`li[data-task-id="${id}"]`);
  const target = card === null ? null : card.querySelector(`button[data-action="${action}"]`);

  if (target !== null) {
    target.focus();

    return;
  }

  const activeFilter = filtersElement.querySelector("button.is-active");

  if (activeFilter !== null) {
    activeFilter.focus();
  }
}

function updateFilterButtons(container, activeValue, attributeName) {
  for (const button of container.querySelectorAll(`button[${attributeName}]`)) {
    const isActive = button.getAttribute(attributeName) === activeValue;

    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
  }
}

function renderApp() {
  const byStatus = getVisibleTasks(currentTasks, currentFilter);
  const visibleTasks = getTasksByPriority(byStatus, currentPriority);

  renderTaskList(listElement, visibleTasks);
  renderSummary(summaryElement, currentTasks, visibleTasks.length);
  renderEmptyState(emptyElement, currentTasks.length, visibleTasks.length);

  updateFilterButtons(filtersElement, currentFilter, "data-filter");

  if (priorityFiltersElement !== null) {
    updateFilterButtons(priorityFiltersElement, currentPriority, "data-priority");
  }
}

function handleTaskListClick(event) {
  if (!(event.target instanceof Element)) {
    return;
  }

  const button = event.target.closest("button[data-action]");

  if (button === null || !listElement.contains(button)) {
    return;
  }

  const action = button.dataset.action;

  if (action !== "toggle" && action !== "delete") {
    return;
  }

  const card = button.closest("li[data-task-id]");

  if (card === null) {
    return;
  }

  const id = Number(card.dataset.taskId);

  if (!Number.isSafeInteger(id) || id <= 0) {
    showMessage("Ошибка: некорректный идентификатор задачи.");

    return;
  }

  let result;

  if (action === "toggle") {
    const task = findTaskById(currentTasks, id);

    if (task === undefined) {
      showMessage(`Ошибка: задача с идентификатором ${id} не найдена.`);

      return;
    }

    result = setTaskCompleted(currentTasks, id, !task.completed);
  } else {
    result = removeTask(currentTasks, id);
  }

  if (!result.ok) {
    showMessage(`Ошибка: ${result.error}`);

    return;
  }

  currentTasks = result.tasks;
  clearMessage();
  renderApp();
  restoreTaskFocus(id, action);
}

function handleFilterClick(event) {
  if (!(event.target instanceof Element)) {
    return;
  }

  const button = event.target.closest("button[data-filter]");

  if (button === null || !filtersElement.contains(button)) {
    return;
  }

  const filter = button.dataset.filter;

  if (!TASK_FILTERS.includes(filter)) {
    return;
  }

  currentFilter = filter;
  clearMessage();
  renderApp();
}

function handlePriorityFilterClick(event) {
  if (!(event.target instanceof Element)) {
    return;
  }

  const button = event.target.closest("button[data-priority]");

  if (button === null || !priorityFiltersElement.contains(button)) {
    return;
  }

  const priority = button.dataset.priority;

  if (!PRIORITY_FILTERS.includes(priority)) {
    return;
  }

  currentPriority = priority;
  clearMessage();
  renderApp();
}

// Подписки создаются один раз и не зависят от отрисовки: сам контейнер списка сохраняется.
listElement.addEventListener("click", handleTaskListClick);
filtersElement.addEventListener("click", handleFilterClick);

if (priorityFiltersElement !== null) {
  priorityFiltersElement.addEventListener("click", handlePriorityFilterClick);
}

try {
  renderApp();
} catch (error) {
  showMessage(`Ошибка запуска: ${error.message}`);
}

// Служебный доступ для браузерных проверок (checks.html). Прикладная логика его не использует.
window.practice03 = {
  getState: () => ({ tasks: currentTasks, filter: currentFilter, priority: currentPriority }),
  getInitialTasks: () => initialTasks,
};
