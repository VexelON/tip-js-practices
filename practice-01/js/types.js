"use strict";

// Задание 2. Для каждого выражения сначала записан прогноз (см. таблицу в README),
// затем выводятся фактическое значение и тип результата.

const concatResult = "8" + 2;
console.log("1) \"8\" + 2 =", concatResult, "| тип:", typeof concatResult);

const subtractResult = "8" - 2;
console.log("2) \"8\" - 2 =", subtractResult, "| тип:", typeof subtractResult);

const numericSum = Number("8") + 2;
console.log("3) Number(\"8\") + 2 =", numericSum, "| тип:", typeof numericSum);

const stringCompare = "12" > "3";
console.log("4) \"12\" > \"3\" =", stringCompare, "| тип:", typeof stringCompare);

const strictCompare = 12 === "12";
console.log("5) 12 === \"12\" =", strictCompare, "| тип:", typeof strictCompare);

const emptyToNumber = Number("");
console.log("6) Number(\"\") =", emptyToNumber, "| тип:", typeof emptyToNumber);

const textToNumber = Number("text");
console.log("7) Number(\"text\") =", textToNumber, "| тип:", typeof textToNumber);

const textToBoolean = Boolean("false");
console.log("8) Boolean(\"false\") =", textToBoolean, "| тип:", typeof textToBoolean);

const typeOfNull = typeof null;
console.log("9) typeof null =", typeOfNull, "| тип самого результата:", typeof typeOfNull);

const typeOfNaN = typeof NaN;
console.log("10) typeof NaN =", typeOfNaN, "| тип самого результата:", typeof typeOfNaN);
