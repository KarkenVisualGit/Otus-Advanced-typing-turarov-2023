import { Task } from "./TaskCalendar"

export interface TaskFilter {
    text?: string;
    date?: string;
    status?: "new" | "in progress" | "done";
    tags?: string[];
}

export interface DataService {
    getTasks(filter?: TaskFilter): Promise<Task[]>;
    createTask(task: Task): Promise<void>;
    updateTask(task: Task): Promise<void>;
    deleteTask(taskId: string): Promise<void>;
}
