import { Task } from "./TaskCalendar";

export interface TaskFilter {
  text?: string;
  date?: string;
  status?: "new" | "in progress" | "done";
  tags?: string[];
}

export interface TaskService {
  getTasks(filter?: TaskFilter): Promise<Task[]>;
  saveTask(task: Task): Promise<void>;
  deleteTask(taskId: string): Promise<boolean>;
}
