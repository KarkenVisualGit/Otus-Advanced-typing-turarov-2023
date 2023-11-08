import { initializeApp } from "firebase/app";
import { Database, getDatabase, ref, set, get, update, remove } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyCZsRRy7BwXZOnYz-3BIo-o4WuHl5XKkCE",
    authDomain: "task-calendar-turarov.firebaseapp.com",
    databaseURL: "https://task-calendar-turarov-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "task-calendar-turarov",
    storageBucket: "task-calendar-turarov.appspot.com",
    messagingSenderId: "685980356315",
    appId: "1:685980356315:web:b12ef3cf06c0bef5a646fe",
    measurementId: "G-02B3TBFPNX"
};

const app = initializeApp(firebaseConfig);
const db: Database = getDatabase();

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
    private deletedFromFirebase: Set<string> = new Set();
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
        document.getElementById('loadFromFirebaseButton')?.addEventListener('click', async () => {
            const tasksFromFirebase = await this.getToDoList();
            this.renderTasks(tasksFromFirebase);
        });

        document.getElementById('loadFromLocalButton')?.addEventListener('click', async () => {
            const tasksFromLocal = await this.getTasks();
            this.renderTasks(tasksFromLocal);
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

    private async getToDoList(): Promise<Task[]> {
        const reference = ref(db, 'todos/');

        try {
            const snapshot = await get(reference);
            if (snapshot.exists()) {
                const tasksData = snapshot.val();
                return Object.keys(tasksData).map(key => {
                    return {
                        id: key,
                        text: tasksData[key].text,
                        date: tasksData[key].date,
                        status: tasksData[key].status,
                        tags: tasksData[key].tags.split(', ')
                    };
                });
            } else {
                console.log("No data available");
                return [];
            }
        } catch (error) {
            console.error(error);
            return [];
        }
    }

    private async setTasks(tasks: Task[]): Promise<void> {
        localStorage.setItem(this.namespace, JSON.stringify(tasks));
    }

    private async getAllTasks(): Promise<Task[]> {
        const localTasks = await this.getTasks();
        const firebaseTasks = await this.getToDoList();
        return [...localTasks, ...firebaseTasks];
    }

    private async editTask(taskId: string): Promise<void> {
        const tasks = await this.getAllTasks();
        const task = tasks.find(task => task.id === taskId);
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
        const localTasks = await this.getTasks();

        tasksToRender.forEach((task) => {
            const taskElement = document.createElement('li');
            taskElement.classList.add('task-item-flex');
            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.classList.add('edit-btn');
            editButton.addEventListener('click', () => this.editTask(task.id));

            const deleteButton = document.createElement('button');
            deleteButton.textContent = localTasks.some(localTask => localTask.id === task.id)
                ? 'Delete local' : 'Deleted locally';
            deleteButton.classList.add('delete-btn');
            deleteButton.disabled = !localTasks.some(localTask => localTask.id === task.id);
            deleteButton.addEventListener('click', async () => await this.deleteTask(task.id, deleteButton));

            const deleteButtonFirebase = document.createElement('button');
            deleteButtonFirebase.textContent = this.deletedFromFirebase.has(task.id)
                ? 'Deleted from Firebase' : 'Delete from Firebase';
            deleteButtonFirebase.classList.add('delete-btn-firebase');
            deleteButtonFirebase.disabled = this.deletedFromFirebase.has(task.id);
            deleteButtonFirebase.addEventListener('click', async () => {
                const success = await this.delToDoList(task.id);
                if (success) {
                    deleteButtonFirebase.textContent = 'Deleted from Firebase';
                    deleteButtonFirebase.disabled = true;
                    this.deletedFromFirebase.add(task.id);
                }
            });

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
            taskElement.appendChild(deleteButtonFirebase);

            taskElement.appendChild(deleteButton);
            taskListElement.appendChild(taskElement);
        });
    }

    private async delToDoList(id: string): Promise<boolean> {
        const reference = ref(db, 'todos/' + id);

        try {
            await remove(reference);
            this.deletedFromFirebase.add(id);
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    private async deleteTask(taskId: string, deleteButton: HTMLButtonElement): Promise<void> {
        const tasks = await this.getTasks().then(tasks => tasks.filter(task => task.id !== taskId));
        await this.setTasks(tasks);
        await this.renderTasks(tasks);
        deleteButton.textContent = 'Deleted locally';
        deleteButton.disabled = true;
    }

    private async clearForm(): Promise<void> {
        (document.getElementById('taskText') as HTMLTextAreaElement).value = '';
        (document.getElementById('taskDate') as HTMLInputElement).value = '';
        (document.getElementById('taskStatus') as HTMLSelectElement).value = '';
        (document.getElementById('taskTags') as HTMLInputElement).value = '';
        delete (document.getElementById('addOrUpdateTaskButton') as HTMLButtonElement)
            .dataset.editingId;
    }

    private async writeToDoList(id: string, text: string,
        date: string, status: string, tags: string[]): Promise<void> {
        const reference = ref(db, 'todos/' + id);

        await set(reference, {
            text: text,
            date: date,
            status: status,
            tags: tags.join(', ')
        });
    }


    public async addOrUpdateTask(): Promise<void> {

        const saveOptionElement = document.getElementById('saveOption') as HTMLSelectElement;
        const saveOption = saveOptionElement.value;
        const taskTextElement = document.getElementById('taskText') as HTMLTextAreaElement;
        const taskDateElement = document.getElementById('taskDate') as HTMLInputElement;
        const taskStatusElement = document.getElementById('taskStatus') as HTMLSelectElement;
        const taskTagsElement = document.getElementById('taskTags') as HTMLInputElement;
        const editingId = (document.getElementById('addOrUpdateTaskButton') as HTMLButtonElement)
            .dataset.editingId;

        const newTask: Task = {
            id: editingId || this.generateId(),
            text: taskTextElement.value,
            date: taskDateElement.value,
            status: taskStatusElement.value as 'new' | 'in progress' | 'done',
            tags: taskTagsElement.value.split(',').map(tag => tag.trim()),
        };


        if (saveOption === 'local') {
            const tasks = await this.getTasks();
            const taskIndex = tasks.findIndex(task => task.id === newTask.id);
            if (taskIndex > -1) {
                tasks[taskIndex] = newTask;
            } else {
                tasks.push(newTask);
            }
            await this.setTasks(tasks);
        } else if (saveOption === 'firebase') {
            await this.writeToDoList(newTask.id, newTask.text, newTask.date, newTask.status, newTask.tags);
        }
        this.deletedFromFirebase.delete(newTask.id);
        await this.clearForm();

        await this.renderTasks();
    }

    private async getCurrentTasks(): Promise<Task[]> {
        const localTasks = await this.getTasks();
        if (localTasks.length > 0) {
            return localTasks;
        } else {
            return await this.getToDoList();
        }
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

        const tasks = await this.getCurrentTasks();
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