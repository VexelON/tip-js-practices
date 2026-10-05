// Текущее состояние приложения, распознавание действий и вызовы отрисовки.
// Поиск, удаление и расчёт прогресса здесь не реализуются заново: используются функции ПР2.

import { demoTasks, variantTasks } from "./data.js";
import { findTaskById, removeTask, setTaskCompleted } from "./task-service.js";
import { getVisibleTasks } from "./task-selectors.js";
import { renderEmptyState, renderSummary, renderTaskList } from "./task-view.js";

const listElement = document.querySelector("#task-list");
const summaryElement = document.querySelector("#task-summary");
const emptyElement = document.querySelector("#empty-message");
const messageElement = document.querySelector("#operation-message");
const filtersElement = document.querySelector("#task-filters");

const datasetName = new URLSearchParams(window.location.search).get("dataset");
const initialTasks = datasetName === "variant" ? variantTasks : demoTasks;

let currentTasks = initialTasks.map((task) => ({ ...task }));
let currentFilter = "all";

function showMessage(text) {
  messageElement.textContent = text;
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

function renderApp() {
  // TODO: вычислить выборку и согласованно обновить все части интерфейса.
  throw new Error("Не реализовано: renderApp");
}

function handleTaskListClick(event) {
  // TODO: распознать действие и идентификатор, вызвать сервис и обновить интерфейс.
  throw new Error("Не реализовано: handleTaskListClick");
}

function handleFilterClick(event) {
  // TODO: изменить только выбранный фильтр и обновить отображение.
  throw new Error("Не реализовано: handleFilterClick");
}

// Подписки создаются один раз и не зависят от отрисовки.
listElement.addEventListener("click", handleTaskListClick);
filtersElement.addEventListener("click", handleFilterClick);

try {
  renderApp();
} catch (error) {
  showMessage(`Ошибка запуска: ${error.message}`);
}
