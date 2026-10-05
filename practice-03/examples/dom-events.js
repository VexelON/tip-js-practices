// Готовые учебные эксперименты. Прогноз каждого результата записывается в отчёт до запуска.

const logElement = document.querySelector("#log");

function log(...parts) {
  const line = parts
    .map((part) => (typeof part === "string" ? part : JSON.stringify(part)))
    .join(" ");

  logElement.textContent += `${line}\n`;
  console.log(...parts);
}

document.querySelector("#clear-log-button").addEventListener("click", () => {
  logElement.textContent = "";
});

// --- Эксперимент 1: отсутствующий элемент и пустая коллекция ---------------------

document.querySelector("#missing-button").addEventListener("click", () => {
  const missing = document.querySelector("#missing-element");
  const emptyCollection = document.querySelectorAll(".missing-class");

  log("1) querySelector('#missing-element') =", String(missing));
  log("1) тип результата:", typeof missing);
  log("1) querySelectorAll('.missing-class').length =", emptyCollection.length);
  log("1) это NodeList:", emptyCollection instanceof NodeList);
  log("1) обращение missing.textContent вызвало бы TypeError, поэтому нужна проверка на null");
});

// --- Эксперимент 2: dataset ------------------------------------------------------

document.querySelector("#dataset-button").addEventListener("click", (event) => {
  const button = event.currentTarget;
  const raw = button.dataset.taskId;
  const asNumber = Number(raw);

  log("2) dataset.taskId =", JSON.stringify(raw), "| тип:", typeof raw);
  log("2) Number(dataset.taskId) =", asNumber, "| тип:", typeof asNumber);
  log("2) Number('4abc') =", String(Number("4abc")), "| parseInt('4abc') =", parseInt("4abc", 10));
});

// --- Эксперимент 3: статическая коллекция ----------------------------------------

const itemsList = document.querySelector("#items-list");
const initialItems = document.querySelectorAll("#items-list .item");

document.querySelector("#add-item-button").addEventListener("click", () => {
  const item = document.createElement("li");

  item.classList.add("item");
  item.textContent = `Запись ${itemsList.children.length + 1}`;
  itemsList.append(item);

  const freshItems = document.querySelectorAll("#items-list .item");

  log("3) сохранённый initialItems.length =", initialItems.length);
  log("3) новый querySelectorAll(...).length =", freshItems.length);
});

// --- Эксперимент 4: текст не равен HTML ------------------------------------------

document.querySelector("#change-title-button").addEventListener("click", () => {
  const heading = document.querySelector("#changeable-heading");
  const value = "<strong>Проверить пример</strong>";

  heading.textContent = value;

  log("4) присвоено через textContent:", value);
  log("4) heading.querySelector('strong') =", String(heading.querySelector("strong")));
  log("4) heading.childElementCount =", heading.childElementCount);
});

// --- Эксперимент 5: захват, цель и всплытие --------------------------------------

const bubblingList = document.querySelector("#bubbling-list");
const bubblingButton = document.querySelector("#bubbling-button");
const bubblingSpan = document.querySelector("#bubbling-span");

function describe(label, event) {
  log(
    `5) ${label}:`,
    "target =",
    event.target.tagName.toLowerCase(),
    "| currentTarget =",
    event.currentTarget.tagName.toLowerCase(),
    "| eventPhase =",
    event.eventPhase
  );
}

bubblingList.addEventListener("click", (event) => describe("ul, фаза захвата", event), true);
bubblingSpan.addEventListener("click", (event) => describe("span (цель)", event));
bubblingButton.addEventListener("click", (event) => describe("button, всплытие", event));
bubblingList.addEventListener("click", (event) => describe("ul, всплытие", event));
