"use strict";

// Дополнительное задание, вариант Б. План с выходными днями.
// Первый календарный день — понедельник, суббота и воскресенье — выходные.
// Норма dailyLimit действует только в рабочие дни.

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

  let calendarDays = 0;
  let workingDays = 0;

  while (remainingTasks > 0) {
    calendarDays += 1;

    // Первый календарный день — понедельник, поэтому индекс 0 соответствует понедельнику.
    const weekdayIndex = (calendarDays - 1) % 7;
    const isWeekend = weekdayIndex === 5 || weekdayIndex === 6;

    let weekdayName = "Понедельник";

    if (weekdayIndex === 1) {
      weekdayName = "Вторник";
    } else if (weekdayIndex === 2) {
      weekdayName = "Среда";
    } else if (weekdayIndex === 3) {
      weekdayName = "Четверг";
    } else if (weekdayIndex === 4) {
      weekdayName = "Пятница";
    } else if (weekdayIndex === 5) {
      weekdayName = "Суббота";
    } else if (weekdayIndex === 6) {
      weekdayName = "Воскресенье";
    }

    if (isWeekend) {
      console.log(`День ${calendarDays} (${weekdayName}): выходной, осталось ${remainingTasks}`);
    } else {
      workingDays += 1;

      const tasksForDay = Math.min(dailyLimit, remainingTasks);
      remainingTasks -= tasksForDay;

      console.log(
        `День ${calendarDays} (${weekdayName}): выполнено ${tasksForDay}, осталось ${remainingTasks}`
      );
    }
  }

  console.log(`Рабочих дней с выполнением задач: ${workingDays}`);
  console.log(`Календарных дней до завершения: ${calendarDays}`);
}
