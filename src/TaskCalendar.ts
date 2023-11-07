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

    private renderTasks(tasks?: Task[]): void {
        const taskListElement = document.getElementById('taskList') as HTMLUListElement;
        taskListElement.innerHTML = '';
        const tasksToRender = tasks || this.getTasks();

        tasksToRender.forEach((task) => {
            const taskElement = document.createElement('li');
            taskElement.classList.add('task-item-flex');
            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.classList.add('edit-btn');
            editButton.addEventListener('click', () => this.editTask(task.id));

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.classList.add('delete-btn');
            deleteButton.addEventListener('click', () => this.deleteTask(task.id));

            const dateElement = document.createElement('span');
            dateElement.textContent = `Date: ${task.date}`;
            const statusElement = document.createElement('span');
            statusElement.textContent = `Status: ${task.status}`;
            const tagsElement = document.createElement('span');
            tagsElement.textContent = `Tags: ${task.tags.join(', ')}`;

            taskElement.appendChild(document.createTextNode(task.text));
            taskElement.appendChild(dateElement);
            taskElement.appendChild(statusElement);
            taskElement.appendChild(tagsElement);
            taskElement.appendChild(editButton);

            taskElement.appendChild(deleteButton);
            taskListElement.appendChild(taskElement);
        });
    }

    private deleteTask(taskId: string): void {
        let tasks = this.getTasks().filter(task => task.id !== taskId);

        this.setTasks(tasks);

        this.renderTasks(tasks);
    }

    private clearForm(): void {
        (document.getElementById('taskText') as HTMLTextAreaElement).value = '';
        (document.getElementById('taskDate') as HTMLInputElement).value = '';
        (document.getElementById('taskStatus') as HTMLSelectElement).value = '';
        (document.getElementById('taskTags') as HTMLInputElement).value = '';
        delete (document.getElementById('addOrUpdateTaskButton') as HTMLButtonElement)
            .dataset.editingId;
    }




}