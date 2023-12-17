import { Task, TaskFilter } from "./types";

export interface TaskService {
  getTasks(filter?: TaskFilter): Promise<Task[]>;
  saveTask(task: Task): Promise<void>;
  deleteTask(taskId: string): Promise<boolean>;
}
