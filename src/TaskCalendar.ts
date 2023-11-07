export interface Task {
    id: string;
    text: string;
    date: string;
    status: 'new' | 'in progress' | 'done';
    tags: string[];
}

export interface TaskFilter {
    text?: string;
    date?: string;
    status?: 'new' | 'in progress' | 'done';
    tags?: string[];
}

export class TaskCalendar {
    private namespace: string;

    constructor(namespace: string) {
        this.namespace = namespace;

    }

    private getTasks(): Task[] {
        const tasksJSON = localStorage.getItem(this.namespace);
        if (tasksJSON) {
            return JSON.parse(tasksJSON);
        }
        return [];
    }

    private setTasks(tasks: Task[]): void {
        localStorage.setItem(this.namespace, JSON.stringify(tasks));
    }

    private editTask(taskId: string): void {
        const task = this.getTasks().find(task => task.id === taskId);
        if (!task) {
            return;
        }

        (document.getElementById('taskText') as HTMLTextAreaElement).value = task.text;
        (document.getElementById('taskDate') as HTMLInputElement).value = task.date;
        (document.getElementById('taskStatus') as HTMLSelectElement).value = task.status;
        (document.getElementById('taskTags') as HTMLInputElement).value = task.tags.join(', ');

        (document.getElementById('addOrUpdateTaskButton') as HTMLButtonElement)
            .dataset.editingId = task.id;
    }

    


}