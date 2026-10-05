import { readFileSync, globSync } from "node:fs";

const files = [...globSync("tests/**/*.js"), ...globSync("checks/**/*.js")];
const forbidden = /\btest\.(only|skip|todo)\s*\(/;
let failed = false;

for (const file of files) {
  const text = readFileSync(file, "utf8");

  if (forbidden.test(text) || text.includes("t.skip(")) {
    console.error(`Маркер only/skip/todo: ${file}`);
    failed = true;
  }
}

if (failed) {
  process.exit(1);
}

console.log("Маркеры only/skip/todo отсутствуют.");
