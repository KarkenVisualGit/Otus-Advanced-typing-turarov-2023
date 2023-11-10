import { TaskCalendar, Task } from './TaskCalendar';
import { get, remove } from 'firebase/database';

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

jest.mock('firebase/database', () => ({
    getDatabase: jest.fn(),
    ref: jest.fn(),
    set: jest.fn(),
    get: jest.fn().mockImplementation(() => Promise.resolve({
        exists: () => false,
        val: () => ({}),
    })),
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

    public initWrapper(): Promise<void> {
        return this.init();
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

describe('TaskCalendar', () => {
    let taskCalendar: TestableTaskCalendar;
    beforeEach(() => {
        document.body.innerHTML = `
            <textarea id="taskText"></textarea>
            <input id="taskDate" />
            <select id="taskStatus">
                <option value="new">New</option>
                <option value="in progress">In Progress</option>
                <option value="done">Done</option>
            </select>
            <input id="taskTags" />
            <button id="addOrUpdateTaskButton"></button>
			<ul class="task-list" id="taskList"></ul>
        `;
    });

    it('should delete a task from Firebase and update the deletedFromFirebase set', async () => {
        taskCalendar = new TestableTaskCalendar('testNamespace');
        const id = '1';

        const success = await taskCalendar.delToDoListWrapper(id);

        expect(success).toBe(true);
        expect(taskCalendar.deletedFromFirebase.has(id)).toBe(true);
    });

});
