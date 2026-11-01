import { validateTaskDraft } from "./src/form-validation.js";

// Первый вызов: корректное название с пробелами по краям
const draft1 = { id: "20", priority: "high", title: " Изучить localStorage " };
const result1 = validateTaskDraft(draft1, []);
console.log("Вызов 1 (title с пробелами):");
console.log("ok:", result1.ok);
console.log("value.title:", JSON.stringify(result1.value?.title));
console.log("errors:", result1.errors);

console.log("\n-------------------\n");

// Второй вызов: название состоит только из пробелов
const draft2 = { id: "20", priority: "high", title: " " };
const result2 = validateTaskDraft(draft2, []);
console.log("Вызов 2 (title только пробелы):");
console.log("ok:", result2.ok);
console.log("errors.title:", result2.errors?.title);