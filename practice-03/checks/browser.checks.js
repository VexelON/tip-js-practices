// Готовые браузерные проверки практической работы № 3.
// Проверяются отбор по фильтру, построение карточек, безопасный вывод текста, повторная
// отрисовка, сводка, пустые состояния и действия настоящего приложения внутри iframe.

import { getVisibleTasks } from "../src/task-selectors.js";
import {
  createTaskElement,
  renderEmptyState,
  renderSummary,
  renderTaskList,
} from "../src/task-view.js";

const logElement = document.querySelector("#checks-log");
const summaryElement = document.querySelector("#checks-summary");
const sandbox = document.querySelector("#sandbox");
const frame = document.querySelector("#app-frame");

let passedCount = 0;
const failedNames = [];

function log(line) {
  logElement.textContent += `${line}\n`;
}

async function check(name, body) {
  try {
    await body();
    passedCount += 1;
    log(`OK   ${name}`);
  } catch (error) {
    failedNames.push(name);
    log(`FAIL ${name}`);
    log(`     ${String(error && error.message).split("\n")[0]}`);
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}: ожидалось ${JSON.stringify(expected)}, получено ${JSON.stringify(actual)}`);
  }
}

function assertDeepEqual(actual, expected, message) {
  const left = JSON.stringify(actual);
  const right = JSON.stringify(expected);

  if (left !== right) {
    throw new Error(`${message}: ожидалось ${right}, получено ${left}`);
  }
}

function demo() {
  return [
    { id: 1, title: "Изучить функции", completed: true, priority: "medium" },
    { id: 4, title: "Подготовить модель задач", completed: false, priority: "high" },
    { id: 7, title: "Проверить методы массивов", completed: false, priority: "low" },
    { id: 10, title: "Оформить README", completed: true, priority: "medium" },
  ];
}

const ids = (tasks) => tasks.map((task) => task.id);

/** Песочница повторяет разметку приложения: список, сводку и сообщение пустого состояния. */
function createSandbox() {
  sandbox.replaceChildren();

  const list = document.createElement("ul");

  list.id = "sandbox-list";

  const summary = document.createElement("dl");

  for (const name of ["total", "completed", "pending", "progress", "visible"]) {
    const value = document.createElement("dd");

    value.dataset.stat = name;
    value.textContent = "—";
    summary.append(value);
  }

  const message = document.createElement("p");

  message.hidden = true;

  sandbox.append(list, summary, message);

  return { list, summary, message };
}

const statOf = (summary, name) => summary.querySelector(`[data-stat="${name}"]`).textContent;

let frameCounter = 0;

/** Перезагружает приложение в iframe и возвращает его документ. */
function loadApp(dataset) {
  return new Promise((resolve, reject) => {
    const url = new URL("../index.html", import.meta.url);

    if (dataset !== undefined) {
      url.searchParams.set("dataset", dataset);
    }

    frameCounter += 1;
    url.searchParams.set("checkRun", String(frameCounter));

    const timer = setTimeout(() => reject(new Error("приложение не загрузилось")), 5000);

    frame.addEventListener(
      "load",
      () => {
        // Модуль main.js выполняется после события load документа iframe.
        setTimeout(() => {
          clearTimeout(timer);
          resolve(frame.contentDocument);
        }, 60);
      },
      { once: true }
    );

    frame.src = url.toString();
  });
}

const appIds = (doc) =>
  [...doc.querySelectorAll("#task-list li[data-task-id]")].map((card) =>
    Number(card.dataset.taskId)
  );

const appStat = (doc, name) =>
  doc.querySelector(`#task-summary [data-stat="${name}"]`).textContent;

const appMessage = (doc) => doc.querySelector("#operation-message").textContent;

function clickFilter(doc, value) {
  // Нажатие выполняется по вложенной подписи, чтобы проверить поиск кнопки через closest.
  doc.querySelector(`#task-filters button[data-filter="${value}"] .action-label`).click();
}

function clickAction(doc, id, action) {
  doc
    .querySelector(`#task-list li[data-task-id="${id}"] button[data-action="${action}"] .action-label`)
    .click();
}

async function run() {
  // --- Отбор по фильтру --------------------------------------------------------

  await check("getVisibleTasks: режим all возвращает все задачи", () => {
    assertDeepEqual(ids(getVisibleTasks(demo(), "all")), [1, 4, 7, 10], "идентификаторы");
  });

  await check("getVisibleTasks: режим pending", () => {
    assertDeepEqual(ids(getVisibleTasks(demo(), "pending")), [4, 7], "идентификаторы");
  });

  await check("getVisibleTasks: режим completed", () => {
    assertDeepEqual(ids(getVisibleTasks(demo(), "completed")), [1, 10], "идентификаторы");
  });

  await check("getVisibleTasks: значение фильтра по умолчанию", () => {
    assertDeepEqual(ids(getVisibleTasks(demo())), [1, 4, 7, 10], "идентификаторы");
  });

  await check("getVisibleTasks: возвращается новый массив, вход сохраняется", () => {
    const tasks = demo();
    const before = JSON.stringify(tasks);
    const visible = getVisibleTasks(tasks, "all");

    assert(visible !== tasks, "должен возвращаться новый массив");
    assertEqual(JSON.stringify(tasks), before, "входной массив не изменился");
    assertEqual(visible[0], tasks[0], "исходные объекты не копируются");
  });

  await check("getVisibleTasks: пустой результат и пустой вход", () => {
    const allDone = demo().map((task) => ({ ...task, completed: true }));

    assertDeepEqual(getVisibleTasks(allDone, "pending"), [], "пустая выборка");
    assertDeepEqual(getVisibleTasks([], "all"), [], "пустой вход");
    assertDeepEqual(getVisibleTasks([], "completed"), [], "пустой вход");
  });

  await check("getVisibleTasks: порядок записей сохраняется", () => {
    const reversed = demo().reverse();

    assertDeepEqual(ids(getVisibleTasks(reversed, "all")), [10, 7, 4, 1], "исходный порядок");
    assertDeepEqual(ids(getVisibleTasks(reversed, "pending")), [7, 4], "порядок в выборке");
  });

  // --- Карточка задачи ----------------------------------------------------------

  await check("createTaskElement: корневой элемент li с классом и data-task-id", () => {
    const card = createTaskElement(demo()[1]);

    assertEqual(card.tagName, "LI", "тег корневого элемента");
    assert(card.classList.contains("task-card"), "класс task-card");
    assertEqual(card.dataset.taskId, "4", "data-task-id");
  });

  await check("createTaskElement: класс is-completed только у выполненной задачи", () => {
    assert(createTaskElement(demo()[0]).classList.contains("is-completed"), "выполненная задача");
    assert(
      !createTaskElement(demo()[1]).classList.contains("is-completed"),
      "невыполненная задача"
    );
  });

  await check("createTaskElement: название в .task-title", () => {
    const card = createTaskElement(demo()[1]);

    assertEqual(
      card.querySelector(".task-title").textContent,
      "Подготовить модель задач",
      "название"
    );
  });

  await check("createTaskElement: статус в .task-status", () => {
    assertEqual(
      createTaskElement(demo()[0]).querySelector(".task-status").textContent,
      "Выполнена",
      "статус выполненной"
    );
    assertEqual(
      createTaskElement(demo()[1]).querySelector(".task-status").textContent,
      "В работе",
      "статус невыполненной"
    );
  });

  await check("createTaskElement: приоритет в .task-priority", () => {
    const labels = { low: "Низкий", medium: "Средний", high: "Высокий" };

    for (const [priority, label] of Object.entries(labels)) {
      const card = createTaskElement({ id: 5, title: "Задача", completed: false, priority });

      assertEqual(card.querySelector(".task-priority").textContent, label, `приоритет ${priority}`);
    }
  });

  await check("createTaskElement: кнопка переключения статуса", () => {
    const done = createTaskElement(demo()[0]).querySelector('button[data-action="toggle"]');
    const pending = createTaskElement(demo()[1]).querySelector('button[data-action="toggle"]');

    assertEqual(done.type, "button", "type кнопки");
    assertEqual(done.getAttribute("aria-pressed"), "true", "aria-pressed выполненной");
    assertEqual(pending.getAttribute("aria-pressed"), "false", "aria-pressed невыполненной");
    assertEqual(done.querySelector(".action-label").textContent, "Выполнена", "подпись кнопки");
    assertEqual(pending.querySelector(".action-label").textContent, "Выполнена", "подпись кнопки");
  });

  await check("createTaskElement: кнопка удаления", () => {
    const button = createTaskElement(demo()[1]).querySelector('button[data-action="delete"]');

    assert(button !== null, "кнопка удаления существует");
    assertEqual(button.type, "button", "type кнопки");
    assertEqual(button.querySelector(".action-label").textContent, "Удалить", "подпись кнопки");
  });

  await check("createTaskElement: название выводится как текст, а не как HTML", () => {
    const raw = '<strong>Проверка</strong> & "кавычки"';
    const card = createTaskElement({ id: 5, title: raw, completed: false, priority: "low" });
    const title = card.querySelector(".task-title");

    assertEqual(title.textContent, raw, "текст названия");
    assertEqual(title.querySelector("strong"), null, "элемент strong не создан");
    assertEqual(title.childElementCount, 0, "внутри названия нет дочерних элементов");
  });

  await check("createTaskElement: задача не изменяется и элемент не добавляется в документ", () => {
    const task = demo()[1];
    const before = JSON.stringify(task);
    const card = createTaskElement(task);

    assertEqual(JSON.stringify(task), before, "задача не изменилась");
    assertEqual(card.parentNode, null, "элемент не добавлен в документ");
  });

  // --- Отрисовка списка ---------------------------------------------------------

  await check("renderTaskList: отрисовка набора задач", () => {
    const { list } = createSandbox();

    renderTaskList(list, demo());

    assertEqual(list.children.length, 4, "количество карточек");
    assertDeepEqual(
      [...list.children].map((card) => Number(card.dataset.taskId)),
      [1, 4, 7, 10],
      "порядок карточек"
    );
  });

  await check("renderTaskList: повторный вызов не дублирует карточки", () => {
    const { list } = createSandbox();

    renderTaskList(list, demo());
    renderTaskList(list, demo());

    assertEqual(list.children.length, 4, "после двух вызовов остаются четыре карточки");
  });

  await check("renderTaskList: пустой массив очищает список, сам контейнер сохраняется", () => {
    const { list } = createSandbox();

    renderTaskList(list, demo());
    renderTaskList(list, []);

    assertEqual(list.children.length, 0, "карточки удалены");
    assertEqual(list.isConnected, true, "контейнер остался в документе");
  });

  // --- Сводка -------------------------------------------------------------------

  await check("renderSummary: показатели общего набора", () => {
    const { summary } = createSandbox();

    renderSummary(summary, demo(), 4);

    assertEqual(statOf(summary, "total"), "4", "всего");
    assertEqual(statOf(summary, "completed"), "2", "выполнено");
    assertEqual(statOf(summary, "pending"), "2", "осталось");
    assertEqual(statOf(summary, "progress"), "50.0%", "прогресс");
    assertEqual(statOf(summary, "visible"), "4", "показано");
  });

  await check("renderSummary: прогресс с одним знаком после точки", () => {
    const { summary } = createSandbox();
    const three = [
      { id: 1, title: "Первая", completed: true, priority: "low" },
      { id: 2, title: "Вторая", completed: false, priority: "low" },
      { id: 3, title: "Третья", completed: false, priority: "low" },
    ];

    renderSummary(summary, three, 3);

    assertEqual(statOf(summary, "progress"), "33.3%", "прогресс");
  });

  await check("renderSummary: пустой массив даёт нули без NaN", () => {
    const { summary } = createSandbox();

    renderSummary(summary, [], 0);

    assertEqual(statOf(summary, "total"), "0", "всего");
    assertEqual(statOf(summary, "progress"), "0.0%", "прогресс");
    assert(!statOf(summary, "progress").includes("NaN"), "в прогрессе нет NaN");
  });

  await check("renderSummary: «Показано» отличается от общего количества", () => {
    const { summary } = createSandbox();
    const tasks = demo();

    renderSummary(summary, tasks, getVisibleTasks(tasks, "pending").length);

    assertEqual(statOf(summary, "total"), "4", "сводка считается по полному массиву");
    assertEqual(statOf(summary, "progress"), "50.0%", "общий прогресс не обнуляется");
    assertEqual(statOf(summary, "visible"), "2", "показано");
  });

  // --- Пустые состояния ---------------------------------------------------------

  await check("renderEmptyState: полностью пустой список", () => {
    const { message } = createSandbox();

    renderEmptyState(message, 0, 0);

    assertEqual(message.textContent, "Список задач пуст.", "сообщение");
    assertEqual(message.hidden, false, "сообщение показано");
  });

  await check("renderEmptyState: нет совпадений по фильтру", () => {
    const { message } = createSandbox();

    renderEmptyState(message, 4, 0);

    assertEqual(message.textContent, "Нет задач по выбранному фильтру.", "сообщение");
    assertEqual(message.hidden, false, "сообщение показано");
  });

  await check("renderEmptyState: есть видимые задачи", () => {
    const { message } = createSandbox();

    renderEmptyState(message, 4, 2);

    assertEqual(message.textContent, "", "сообщение очищено");
    assertEqual(message.hidden, true, "сообщение скрыто");
  });

  // --- Настоящее приложение в iframe --------------------------------------------

  await check("Приложение: исходное состояние общего набора", async () => {
    const doc = await loadApp();

    assertDeepEqual(appIds(doc), [1, 4, 7, 10], "видимые идентификаторы");
    assertEqual(appStat(doc, "total"), "4", "всего");
    assertEqual(appStat(doc, "completed"), "2", "выполнено");
    assertEqual(appStat(doc, "pending"), "2", "осталось");
    assertEqual(appStat(doc, "progress"), "50.0%", "прогресс");
    assertEqual(appStat(doc, "visible"), "4", "показано");
    assertEqual(doc.querySelector("#empty-message").hidden, true, "пустое состояние скрыто");
  });

  await check("Приложение: фильтр «В работе»", async () => {
    const doc = await loadApp();

    clickFilter(doc, "pending");

    assertDeepEqual(appIds(doc), [4, 7], "видимые идентификаторы");
    assertEqual(appStat(doc, "visible"), "2", "показано");
    assertEqual(appStat(doc, "progress"), "50.0%", "общий прогресс не изменился");

    const active = doc.querySelector('#task-filters button[data-filter="pending"]');

    assert(active.classList.contains("is-active"), "активная кнопка отмечена классом");
    assertEqual(active.getAttribute("aria-pressed"), "true", "aria-pressed активной кнопки");
    assertEqual(
      doc.querySelector('#task-filters button[data-filter="all"]').getAttribute("aria-pressed"),
      "false",
      "aria-pressed остальных кнопок"
    );
  });

  await check("Приложение: фильтр «Выполненные»", async () => {
    const doc = await loadApp();

    clickFilter(doc, "completed");

    assertDeepEqual(appIds(doc), [1, 10], "видимые идентификаторы");
    assertEqual(appStat(doc, "visible"), "2", "показано");
  });

  await check("Приложение: возврат к «Все» не теряет записи", async () => {
    const doc = await loadApp();

    clickFilter(doc, "completed");
    clickFilter(doc, "all");

    assertDeepEqual(appIds(doc), [1, 4, 7, 10], "видимые идентификаторы");
    assertEqual(appStat(doc, "total"), "4", "всего");
  });

  await check("Приложение: переключение статуса нажатием на вложенную подпись", async () => {
    const doc = await loadApp();

    clickAction(doc, 4, "toggle");

    assertEqual(appStat(doc, "completed"), "3", "выполнено");
    assertEqual(appStat(doc, "progress"), "75.0%", "прогресс");

    const card = doc.querySelector('#task-list li[data-task-id="4"]');

    assert(card.classList.contains("is-completed"), "карточка отмечена как выполненная");
    assertEqual(
      card.querySelector('button[data-action="toggle"]').getAttribute("aria-pressed"),
      "true",
      "aria-pressed кнопки"
    );

    clickAction(doc, 4, "toggle");

    assertEqual(appStat(doc, "completed"), "2", "повторное нажатие возвращает статус");
  });

  await check("Приложение: удаление задачи изменяет данные, а не только DOM", async () => {
    const doc = await loadApp();

    clickAction(doc, 7, "delete");

    assertDeepEqual(appIds(doc), [1, 4, 10], "видимые идентификаторы");
    assertEqual(appStat(doc, "total"), "3", "всего");

    // Смена фильтра пересоздаёт карточки из настоящего массива.
    clickFilter(doc, "completed");
    clickFilter(doc, "all");

    assertDeepEqual(appIds(doc), [1, 4, 10], "удалённая запись не вернулась");
  });

  await check("Приложение: нажатие по названию карточки ничего не меняет", async () => {
    const doc = await loadApp();

    doc.querySelector('#task-list li[data-task-id="4"] .task-title').click();
    doc.querySelector("#task-list").click();

    assertDeepEqual(appIds(doc), [1, 4, 7, 10], "список не изменился");
    assertEqual(appStat(doc, "completed"), "2", "сводка не изменилась");
    assertEqual(appMessage(doc), "", "сообщение об ошибке не появилось");
  });

  await check("Приложение: некорректный data-task-id не повреждает данные", async () => {
    const doc = await loadApp();
    const card = doc.querySelector('#task-list li[data-task-id="4"]');

    card.dataset.taskId = "4abc";
    card.querySelector('button[data-action="delete"]').click();

    assertEqual(appStat(doc, "total"), "4", "данные сохранены");
    assert(appMessage(doc).length > 0, "выведено понятное сообщение");

    clickFilter(doc, "all");

    assertDeepEqual(appIds(doc), [1, 4, 7, 10], "корректный выбор фильтра восстанавливает карточки");
    assertEqual(appMessage(doc), "", "сообщение очищено");
  });

  await check("Приложение: отсутствующий идентификатор даёт сообщение", async () => {
    const doc = await loadApp();
    const card = doc.querySelector('#task-list li[data-task-id="4"]');

    card.dataset.taskId = "777";
    card.querySelector('button[data-action="toggle"]').click();

    assertEqual(appStat(doc, "total"), "4", "данные сохранены");
    assertEqual(appStat(doc, "completed"), "2", "статусы сохранены");
    assert(appMessage(doc).length > 0, "выведено понятное сообщение");
  });

  await check("Приложение: полностью пустой список после удаления всех задач", async () => {
    const doc = await loadApp();

    for (const id of [1, 4, 7, 10]) {
      clickAction(doc, id, "delete");
    }

    assertDeepEqual(appIds(doc), [], "карточек не осталось");
    assertEqual(appStat(doc, "total"), "0", "всего");
    assertEqual(appStat(doc, "progress"), "0.0%", "прогресс");

    const message = doc.querySelector("#empty-message");

    assertEqual(message.hidden, false, "сообщение показано");
    assertEqual(message.textContent, "Список задач пуст.", "сообщение полностью пустого списка");
    assertEqual(doc.querySelector("#task-list").isConnected, true, "контейнер списка сохранён");
  });

  const total = passedCount + failedNames.length;

  summaryElement.textContent = `Всего: ${total}. Пройдено: ${passedCount}. Ошибок: ${failedNames.length}.`;
  log(`\nВсего: ${total}. Пройдено: ${passedCount}. Ошибок: ${failedNames.length}.`);

  if (failedNames.length > 0) {
    log("Непройденные проверки:");

    for (const name of failedNames) {
      log(`  - ${name}`);
    }
  }
}

run().catch((error) => {
  summaryElement.textContent = `Проверки не завершены: ${error.message}`;
  log(`ОШИБКА ЗАПУСКА: ${error.message}`);
});
