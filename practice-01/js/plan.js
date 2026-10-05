"use strict";

const totalTasks = 18;
const completedTasks = 6;
const dailyLimit = 5;

let errorMessage = "";

if (typeof totalTasks !== "number" || !Number.isFinite(totalTasks)) {
  errorMessage = "Ошибка: общее количество задач должно быть числом.";
} else if (!Number.isInteger(totalTasks)) {
  errorMessage = "Ошибка: общее количество задач должно быть целым числом.";
} else if (totalTasks < 0) {
  errorMessage = "Ошибка: общее количество задач не может быть отрицательным.";
} else if (totalTasks > 1000) {
  errorMessage = "Ошибка: общее количество задач не должно превышать 1000.";
} else if (typeof completedTasks !== "number" || !Number.isFinite(completedTasks)) {
  errorMessage = "Ошибка: количество выполненных задач должно быть числом.";
} else if (!Number.isInteger(completedTasks)) {
  errorMessage = "Ошибка: количество выполненных задач должно быть целым числом.";
} else if (completedTasks < 0) {
  errorMessage = "Ошибка: количество выполненных задач не может быть отрицательным.";
} else if (completedTasks > totalTasks) {
  errorMessage = "Ошибка: выполнено больше задач, чем существует.";
} else if (typeof dailyLimit !== "number" || !Number.isFinite(dailyLimit)) {
  errorMessage = "Ошибка: дневная норма должна быть числом.";
} else if (!Number.isInteger(dailyLimit)) {
  errorMessage = "Ошибка: дневная норма должна быть целым числом.";
} else if (dailyLimit < 1) {
  errorMessage = "Ошибка: дневная норма должна быть не меньше 1.";
} else if (dailyLimit > 1000) {
  errorMessage = "Ошибка: дневная норма не должна превышать 1000.";
}

if (errorMessage !== "") {
  console.log(errorMessage);
} else {
  let remainingTasks = totalTasks - completedTasks;

  console.log(`Осталось задач: ${remainingTasks}`);

  if (remainingTasks === 0) {
    console.log("Все задачи уже выполнены");
    console.log("Потребуется дней: 0");
  } else {
    let dayNumber = 0;

    while (remainingTasks > 0) {
      dayNumber += 1;

      const tasksForDay = Math.min(dailyLimit, remainingTasks);
      remainingTasks -= tasksForDay;

      console.log(`День ${dayNumber}: выполнено ${tasksForDay}, осталось ${remainingTasks}`);
    }

    console.log(`Потребуется дней: ${dayNumber}`);
  }
}
