import { TaskCalendar, Task } from './TaskCalendar';
import { get } from 'firebase/database';

jest.mock('firebase/app', () => ({
    initializeApp: jest.fn(),
}));

jest.mock('firebase/database', () => ({
    getDatabase: jest.fn(),
    ref: jest.fn(),
    set: jest.fn(),
    get: jest.fn(),
    remove: jest.fn(),
}));

class TestableTaskCalendar extends TaskCalendar {
    public deletedFromFirebase: Set<string> = new Set();
    public async testEditTask(taskId: string): Promise<void> {
        return this.editTask(taskId);
    }
    public getAllTasksWrapper(): Promise<Task[]> {
        return this.getAllTasks();
    }

    public getToDoListWrapper(): Promise<Task[]> {
        return this.getToDoList();
    }

    public delToDoListWrapper(id: string): Promise<boolean> {
        return this.delToDoList(id);
    }

    public testgetTasks(): Promise<Task[]> {
        return this.getTasks();
    }

    public async renderMyTasks(tasks?: Task[]): Promise<void> {
        await this.renderTasks(tasks);
    }
}

