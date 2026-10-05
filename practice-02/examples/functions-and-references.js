// Задание 1. Шесть независимых экспериментов.
// Перед запуском файла прогноз каждого вывода записывается в отчёт.

console.log("--- Эксперимент 1: аргументы не преобразуются автоматически ---");

function sum(first, second) {
  return first + second;
}

const numericSum = sum(4, 6);
const mixedSum = sum("4", 6);

console.log("sum(4, 6) =", numericSum, "| тип:", typeof numericSum);
console.log('sum("4", 6) =', mixedSum, "| тип:", typeof mixedSum);

console.log("\n--- Эксперимент 2: стрелочная функция с телом в фигурных скобках ---");

const square = (value) => {
  value * value;
};

const squareResult = square(4);

console.log("square(4) =", squareResult, "| тип:", typeof squareResult);

console.log("\n--- Эксперимент 3: присваивание объекта второй переменной ---");

const original = { title: "Черновик", published: false };
const alias = original;

alias.published = true;

console.log("original.published =", original.published);
console.log("original === alias →", original === alias);

console.log("\n--- Эксперимент 4: копирование массива объектов через spread ---");

const sourceTasks = [
  { id: 1, title: "Первая" },
  { id: 2, title: "Вторая" },
];
const copiedTasks = [...sourceTasks];

copiedTasks.push({ id: 3, title: "Третья" });
copiedTasks[0].title = "Изменено";

console.log("sourceTasks.length =", sourceTasks.length);
console.log("copiedTasks.length =", copiedTasks.length);
console.log("sourceTasks === copiedTasks →", sourceTasks === copiedTasks);
console.log("sourceTasks[0] === copiedTasks[0] →", sourceTasks[0] === copiedTasks[0]);
console.log("sourceTasks[0].title =", sourceTasks[0].title);

console.log("\n--- Эксперимент 5: spread объекта и повторное указание свойства ---");

const oldBook = { id: 12, title: "Черновик", available: false };
const afterSpread = { ...oldBook, available: true };
const beforeSpread = { available: true, ...oldBook };

console.log("oldBook.available =", oldBook.available);
console.log("{ ...oldBook, available: true }.available =", afterSpread.available);
console.log("{ available: true, ...oldBook }.available =", beforeSpread.available);
console.log("oldBook === afterSpread →", oldBook === afterSpread);

console.log("\n--- Эксперимент 6: параметр по умолчанию ---");

function makeCaption(text = "Без названия") {
  return text;
}

console.log("makeCaption() =", JSON.stringify(makeCaption()));
console.log("makeCaption(undefined) =", JSON.stringify(makeCaption(undefined)));
console.log("makeCaption(null) =", JSON.stringify(makeCaption(null)));
console.log("makeCaption(0) =", JSON.stringify(makeCaption(0)));
console.log('makeCaption("") =', JSON.stringify(makeCaption("")));
