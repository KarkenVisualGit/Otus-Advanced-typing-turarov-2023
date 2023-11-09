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
    public async testEditTask(taskId: string): Promise<void> {
        return this.editTask(taskId);
    }
    public getAllTasksWrapper(): Promise<Task[]> {
        return this.getAllTasks();
    }
}

describe('editTask Method', () => {
    let taskCalendar: TestableTaskCalendar;
    const mockTask: Task = {
        id: '1',
        text: 'Test Task',
        date: '2023-01-01',
        status: 'new',
        tags: ['test', 'task']
    };

    const localStorageMockData = [{
        id: '1',
        text: 'Test Task',
        date: '2023-01-01',
        status: 'new',
        tags: ['test', 'task']
    }];

    const firebaseMockData = {
        '2': {
            text: 'Firebase Task',
            date: '2023-01-02',
            status: 'in progress',
            tags: 'firebase, task'
        }
    };


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
        `;

        taskCalendar = new TestableTaskCalendar('testNamespace');

        Storage.prototype.getItem = jest.fn().mockImplementation(() => JSON.stringify(localStorageMockData));

        (get as jest.Mock).mockImplementation(() => Promise.resolve({
            exists: () => true,
            val: () => firebaseMockData
        }));

        jest.spyOn(taskCalendar, 'getAllTasksWrapper').mockResolvedValue([mockTask]);
    });

    it('should fill the form with task data for editing', async () => {
        await taskCalendar.testEditTask('1');

        expect((document.getElementById('taskText') as HTMLTextAreaElement).value).toBe(mockTask.text);
        expect((document.getElementById('taskDate') as HTMLInputElement).value).toBe(mockTask.date);
        expect((document.getElementById('taskStatus') as HTMLSelectElement).value).toBe(mockTask.status);
        expect((document.getElementById('taskTags') as HTMLInputElement).value).toBe(mockTask.tags.join(', '));
        expect((document.getElementById('addOrUpdateTaskButton') as HTMLButtonElement).dataset.editingId).toBe(mockTask.id);
    });
});
