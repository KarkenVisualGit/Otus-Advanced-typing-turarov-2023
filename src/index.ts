import "./style/style.css";
import { TaskCalendar } from "./TaskCalendar";
import { FirebaseTaskService } from "./FirebaseTaskService";
import { LocalStorageTaskService } from "./LocalStorageTaskService";
import { TaskCalendarUI } from "./TaskCalendarUI";

const localTaskService = new LocalStorageTaskService("local_tasks");
const firebaseTaskService = new FirebaseTaskService();

const taskCalendar = new TaskCalendar(localTaskService, firebaseTaskService);
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const taskCalendarUI = new TaskCalendarUI(taskCalendar);
