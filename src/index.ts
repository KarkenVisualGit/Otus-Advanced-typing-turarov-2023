import "./style/style.css";
import { TaskCalendar } from "../src/TaskCalendar";
import { FirebaseTaskService } from "../src/FirebaseTaskService";
import { LocalStorageTaskService } from "../src/LocalStorageTaskService";
import { TaskCalendarUI } from "./TaskCalendarUI";

const localTaskService = new LocalStorageTaskService("local_tasks");
const firebaseTaskService = new FirebaseTaskService();

const taskCalendar = new TaskCalendar(localTaskService, firebaseTaskService);
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const taskCalendarUI = new TaskCalendarUI(taskCalendar);
