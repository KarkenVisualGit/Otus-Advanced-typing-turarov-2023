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
        document.addEventListener('DOMContentLoaded', this.init.bind(this));
    }

    private async init(): Promise<void> {
        document.getElementById('addOrUpdateTaskButton')?.addEventListener('click', async () => {
            await this.addOrUpdateTask();
        });
        document.getElementById('applyFiltersButton')?.addEventListener('click', async () => {
            await this.applyFilters();
        });
        await this.renderTasks();
    }

    private async getTasks(): Promise<Task[]> {
        const tasksJSON = localStorage.getItem(this.namespace);
        if (tasksJSON) {
            return JSON.parse(tasksJSON);
        }
        return [];
    }

    private async setTasks(tasks: Task[]): Promise<void> {
        localStorage.setItem(this.namespace, JSON.stringify(tasks));
    }

    private async editTask(taskId: string): Promise<void> {
        const task = await this.getTasks().then(tasks => tasks.find(task => task.id === taskId));
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

    private async renderTasks(tasks?: Task[]): Promise<void> {
        const taskListElement = document.getElementById('taskList') as HTMLUListElement;
        taskListElement.innerHTML = '';
        const tasksToRender = tasks || await this.getTasks();

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

    private async deleteTask(taskId: string): Promise<void> {
        const tasks = await this.getTasks().then(tasks => tasks.filter(task => task.id !== taskId));
        await this.setTasks(tasks);
        await this.renderTasks(tasks);
    }

    private async clearForm(): Promise<void> {
        (document.getElementById('taskText') as HTMLTextAreaElement).value = '';
        (document.getElementById('taskDate') as HTMLInputElement).value = '';
        (document.getElementById('taskStatus') as HTMLSelectElement).value = '';
        (document.getElementById('taskTags') as HTMLInputElement).value = '';
        delete (document.getElementById('addOrUpdateTaskButton') as HTMLButtonElement)
            .dataset.editingId;
    }

    public async addOrUpdateTask(): Promise<void> {
        const taskTextElement = document.getElementById('taskText') as HTMLTextAreaElement;
        const taskDateElement = document.getElementById('taskDate') as HTMLInputElement;
        const taskStatusElement = document.getElementById('taskStatus') as HTMLSelectElement;
        const taskTagsElement = document.getElementById('taskTags') as HTMLInputElement;
        const editingId = (document.getElementById('addOrUpdateTaskButton') as HTMLButtonElement)
            .dataset.editingId;

        const newTask: Task = {
            id: this.generateId(),
            text: taskTextElement.value,
            date: taskDateElement.value,
            status: taskStatusElement.value as 'new' | 'in progress' | 'done',
            tags: taskTagsElement.value.split(',').map(tag => tag.trim()),
        };


        let tasks = await this.getTasks();
        if (editingId) {
            const taskIndex = tasks.findIndex(task => task.id === editingId);
            if (taskIndex > -1) {
                tasks[taskIndex] = { ...tasks[taskIndex], ...newTask, id: editingId };
            }
        } else {
            tasks.push({ ...newTask, id: this.generateId() });
        }

        await this.setTasks(tasks);
        await this.renderTasks();

        await this.clearForm();
    }

    public async applyFilters(): Promise<void> {
        const filterTextElement = document.getElementById('filterText') as HTMLInputElement;
        const filterDateElement = document.getElementById('filterDate') as HTMLInputElement;
        const filterStatusElement = document.getElementById('filterStatus') as HTMLSelectElement;
        const filterTagsElement = document.getElementById('filterTags') as HTMLInputElement;

        const filter: TaskFilter = {
            text: filterTextElement.value,
            date: filterDateElement.value,
            status: filterStatusElement.value as 'new' | 'in progress' | 'done' || undefined,

            tags: filterTagsElement.value ? filterTagsElement.value.split(',')
                .map(tag => tag.trim()) : undefined,
        };

        const tasks = await this.getTasks();
        const filteredTasks = tasks.filter(task => this.taskMatchesFilter(task, filter));
        await this.renderTasks(filteredTasks);
    }

    private taskMatchesFilter(task: Task, filter: TaskFilter): boolean {
        const textToCompare = filter.text?.trim().toLowerCase() ?? "";
        const tagsToCompare = filter.tags?.map(tag => tag.trim().toLowerCase()) ?? [];

        const textMatches = !filter.text || task.text.toLowerCase().includes(textToCompare);
        const dateMatches = !filter.date || task.date === filter.date;
        const statusMatches = !filter.status || task.status === filter.status;
        const tagsMatches = tagsToCompare.length === 0 || tagsToCompare.some(filterTag =>
            task.tags.some(taskTag => taskTag.toLowerCase().includes(filterTag)));

        return textMatches && dateMatches && statusMatches && tagsMatches;
    }

    private generateId(): string {

        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }


}