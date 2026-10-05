// Текущее состояние приложения, режим формы, события и координация модулей.
// Правила модели здесь не дублируются: используются функции сервиса, валидации и хранения.

import { demoTasks, variantTasks } from "./data.js";
import { addTask, findTaskById, removeTask, setTaskCompleted, updateTask } from "./task-service.js";
import { getVisibleTasks } from "./task-selectors.js";
import { renderEmptyState, renderSummary, renderTaskList } from "./task-view.js";
import { validateTaskDraft } from "./form-validation.js";
import { loadTasks, removeSavedTasks, saveTasks } from "./task-storage.js";

const listElement = document.querySelector("#task-list");
const summaryElement = document.querySelector("#task-summary");
const emptyElement = document.querySelector("#empty-message");
const messageElement = document.querySelector("#operation-message");
const storageMessageElement = document.querySelector("#storage-message");
const filtersElement = document.querySelector("#task-filters");
const resetButton = document.querySelector("#reset-storage");

const formElement = document.querySelector("#task-form");
const formTitleElement = document.querySelector("#form-title");
const submitButton = document.querySelector("#form-submit");
const cancelButton = document.querySelector("#form-cancel");
const idField = document.querySelector("#field-id");
const titleField = document.querySelector("#field-title");
const priorityField = document.querySelector("#field-priority");

const FIELDS = {
  id: idField,
  title: titleField,
  priority: priorityField,
};

const queryParams = new URLSearchParams(window.location.search);
const datasetName = queryParams.get("dataset") === "variant" ? "variant" : "demo";
const isCheckMode = queryParams.get("mode") === "check";

// Общий и индивидуальный наборы, а также автоматические проверки используют разные ключи.
const storageKey = isCheckMode
  ? `tip-js-practice-04:checks:${datasetName}`
  : `tip-js-practice-04:${datasetName}`;

const initialTasks = datasetName === "variant" ? variantTasks : demoTasks;

let currentTasks = [];
let currentFilter = "all";
let editingId = null;

function showMessage(text) {
  messageElement.textContent = text;
}

function showStorageMessage(text) {
  storageMessageElement.textContent = text;
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

function clearFieldError(name) {
  // TODO: очистить сообщение одного поля и снять setCustomValidity.
  throw new Error("Не реализовано: clearFieldError");
}

/** Связывает ошибки валидации с конкретными полями формы. */
function showFormErrors(errors) {
  throw new Error("Не реализовано: showFormErrors");
}

/** Задание 6. Режим формы — часть состояния интерфейса и не сохраняется в localStorage. */
function setFormMode(id) {
  throw new Error("Не реализовано: setFormMode");
}

function persistTasks(tasks) {
  // TODO: вызвать saveTasks и сообщить о результате записи.
  throw new Error("Не реализовано: persistTasks");
}

function restoreTasks() {
  // TODO: вызвать loadTasks и различить источники initial, storage и fallback.
  throw new Error("Не реализовано: restoreTasks");
}

/** renderApp только отображает состояние: чтения и записи хранилища здесь нет. */
function renderApp() {
  throw new Error("Не реализовано: renderApp");
}

function handleFormSubmit(event) {
  // TODO: preventDefault, FormData, validateTaskDraft, addTask или updateTask, затем сохранение.
  throw new Error("Не реализовано: handleFormSubmit");
}

function handleFormInput(event) {
  // TODO: снять ошибку только исправляемого поля.
  throw new Error("Не реализовано: handleFormInput");
}

function handleFormCancel() {
  throw new Error("Не реализовано: handleFormCancel");
}

function handleFilterClick(event) {
  // TODO: изменить только выбранный фильтр; запись в хранилище не выполняется.
  throw new Error("Не реализовано: handleFilterClick");
}

function handleTaskListClick(event) {
  // TODO: распознать действия edit, toggle и delete и обработать неизвестные значения.
  throw new Error("Не реализовано: handleTaskListClick");
}

function handleResetClick() {
  // TODO: removeSavedTasks для текущего ключа; исходный набор не записывается обратно.
  throw new Error("Не реализовано: handleResetClick");
}

// Подписки создаются один раз и не зависят от отрисовки.
formElement.addEventListener("submit", handleFormSubmit);
formElement.addEventListener("input", handleFormInput);
cancelButton.addEventListener("click", handleFormCancel);
filtersElement.addEventListener("click", handleFilterClick);
listElement.addEventListener("click", handleTaskListClick);
resetButton.addEventListener("click", handleResetClick);

try {
  restoreTasks();
  setFormMode(null);
  renderApp();
} catch (error) {
  showMessage(`Ошибка запуска: ${error.message}`);
}
