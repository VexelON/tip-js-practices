import { demoTasks } from "./src/data.js";
import { setTaskCompleted, findTaskById } from "./src/task-service.js";

const result = setTaskCompleted(demoTasks, 4, true);
console.log("ok:", result.ok);
console.log("новая запись id=4:", findTaskById(result.tasks, 4));
console.log("исходная запись id=4:", findTaskById(demoTasks, 4));

const failed = setTaskCompleted(demoTasks, 777, true);
console.log("отказ:", failed);