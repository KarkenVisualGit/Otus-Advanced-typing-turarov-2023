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
    public async testGetAllTasks(): Promise<Task[]> {
        return this.getAllTasks();
    }
}

describe('getAllTasks Method', () => {
    let taskCalendar: TaskCalendar;

    beforeEach(() => {
        taskCalendar = new TaskCalendar('testNamespace');

        Storage.prototype.getItem = jest.fn().mockImplementation(() => JSON.stringify([
            { id: 'localStorageTaskId', text: 'Local Task', date: '2023-01-03', status: 'done', tags: ['local'] }
        ]));

        (get as jest.Mock).mockImplementation(() => Promise.resolve({
            exists: () => true,
            val: () => ({
                'firebaseTaskId': {
                    text: 'Firebase Task',
                    date: '2023-01-04',
                    status: 'new',
                    tags: 'firebase,task'
                }
            })
        }));
    });

    afterEach(() => {
        localStorage.clear();
        jest.clearAllMocks();
    });

    it('should combine tasks from localStorage and Firebase', async () => {
        const allTasks = await taskCalendar['getAllTasks']();

        expect(allTasks).toHaveLength(2);
        expect(allTasks).toEqual(expect.arrayContaining([
            expect.objectContaining({ id: 'localStorageTaskId', text: 'Local Task' }),
            expect.objectContaining({ id: 'firebaseTaskId', text: 'Firebase Task' })
        ]));
    });
});

