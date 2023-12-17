import { TaskService } from "./TaskService";
import { Task } from "./types";

export class LocalStorageTaskService implements TaskService {
  private namespace: string;

  constructor(namespace: string) {
    this.namespace = namespace;
  }

  async deleteTask(taskId: string): Promise<boolean> {
    try {
      let tasks = await this.getTasks();
      tasks = tasks.filter((task) => task.id !== taskId);
      localStorage.setItem(this.namespace, JSON.stringify(tasks));
      return true;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      return false;
    }
  }

  public async getTasks(): Promise<Task[]> {
    const tasksJSON = localStorage.getItem(this.namespace);
    return tasksJSON ? JSON.parse(tasksJSON) : [];
  }

  public async saveTask(task: Task): Promise<void> {
    const tasks = await this.getTasks();
    const taskIndex = tasks.findIndex((t) => t.id === task.id);

    if (taskIndex > -1) {
      tasks[taskIndex] = task;
    } else {
      tasks.push(task);
    }

    localStorage.setItem(this.namespace, JSON.stringify(tasks));
  }
}

export default LocalStorageTaskService;
