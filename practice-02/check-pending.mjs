import { demoTasks } from "./src/data.js";
import { getPendingTasks } from "./src/task-service.js";

console.log("demoTasks:", demoTasks);
console.log("getPendingTasks(demoTasks):", getPendingTasks(demoTasks));
console.log("getPendingTasks([]):", getPendingTasks([]));