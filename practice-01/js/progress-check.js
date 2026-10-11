"use strict";

function report(totalTasks, completedTasks) {
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
  }

  console.log(`--- totalTasks=${totalTasks}, completedTasks=${completedTasks} ---`);

  if (errorMessage !== "") {
    console.log(errorMessage);
  } else if (totalTasks === 0) {
    console.log("Задач пока нет");
  } else {
    const remainingTasks = totalTasks - completedTasks;
    const percentage = (completedTasks / totalTasks) * 100;

    let status = "В работе";
    if (completedTasks === 0) status = "Не начато";
    else if (completedTasks === totalTasks) status = "Завершено";

    console.log(`Всего задач: ${totalTasks}`);
    console.log(`Выполнено: ${completedTasks}`);
    console.log(`Осталось: ${remainingTasks}`);
    console.log(`Прогресс: ${percentage.toFixed(1)}%`);
    console.log(`Статус: ${status}`);
  }

  console.log("");
}

report(12, 5);
report(0, 0);
report(5, 6);