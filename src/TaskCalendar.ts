import { TaskService } from "./TaskService";

export interface Task {
  id: string;
  text: string;
  date: string;
  status: "new" | "in progress" | "done";
  tags: string[];
  isDeletedLocally: boolean;
  isDeletedFromFirebase: boolean;
}

export interface TaskFilter {
  text?: string;
  date?: string;
  status?: "new" | "in progress" | "done";
  tags?: string[];
}

export class TaskCalendar {
  private localTaskService: TaskService;
  private firebaseTaskService: TaskService;
  constructor(localTaskService: TaskService, firebaseTaskService: TaskService) {
    this.localTaskService = localTaskService;
    this.firebaseTaskService = firebaseTaskService;
  }

  public async getAllTasks(): Promise<Task[]> {
    const localTasks = await this.localTaskService.getTasks();
    const firebaseTasks = await this.firebaseTaskService.getTasks();
    return [...localTasks, ...firebaseTasks];
  }

  async getTaskById(taskId: string): Promise<Task | null> {
    const tasks = await this.getAllTasks();
    return tasks.find((task) => task.id === taskId) || null;
  }

  async getTasksFromFirebase(): Promise<Task[]> {
    return this.firebaseTaskService.getTasks();
  }

  async getTasksLocalStorage(): Promise<Task[]> {
    return this.localTaskService.getTasks();
  }

  async saveTaskLocally(task: Task): Promise<void> {
    await this.localTaskService.saveTask(task);
  }

  async saveTaskInFirebase(task: Task): Promise<void> {
    await this.firebaseTaskService.saveTask(task);
    // this.firebaseTaskService.markAsAdded(task.id);
  }

  async deleteTaskFromFirebase(taskId: string): Promise<boolean> {
    const success = await this.firebaseTaskService.deleteTask(taskId);
    if (success) {
      const task = await this.getTaskById(taskId);
      if (task) {
        task.isDeletedFromFirebase = true;
      }
    }
    return success;
  }

  async deleteTaskLocalStorage(taskId: string): Promise<boolean> {
    const success = await this.localTaskService.deleteTask(taskId);
    if (success) {
      const task = await this.getTaskById(taskId);
      if (task) {
        task.isDeletedLocally = true;
      }
    }
    return success;
  }

  // eslint-disable-next-line class-methods-use-this
  public taskMatchesFilter(task: Task, filter: TaskFilter): boolean {
    const textToCompare = filter.text?.trim().toLowerCase() ?? "";
    const tagsToCompare =
      filter.tags?.map((tag) => tag.trim().toLowerCase()) ?? [];

    const textMatches =
      !filter.text || task.text.toLowerCase().includes(textToCompare);
    const dateMatches = !filter.date || task.date === filter.date;
    const statusMatches = !filter.status || task.status === filter.status;
    const tagsMatches =
      tagsToCompare.length === 0 ||
      tagsToCompare.some((filterTag) =>
        task.tags.some((taskTag) => taskTag.toLowerCase().includes(filterTag))
      );

    return textMatches && dateMatches && statusMatches && tagsMatches;
  }

  // eslint-disable-next-line class-methods-use-this
  public generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
}
