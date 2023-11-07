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

   
}