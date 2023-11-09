import { TaskCalendar, Task, TaskFilter } from './TaskCalendar';
import { get, ref } from 'firebase/database';

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
    public async testGetToDoList(): Promise<Task[]> {
        return this.getToDoList();
    }
}

describe('TaskCalendar testing', () => {
    let taskCalendar: TaskCalendar;

    beforeEach(() => {

        document.body.innerHTML = `
      <div>
        <button id="addOrUpdateTaskButton"></button>
        <button id="applyFiltersButton"></button>
        <button id="loadFromFirebaseButton"></button>
        <button id="loadFromLocalButton"></button>
        <ul id="taskList"></ul>
      </div>
    `;
        taskCalendar = new TaskCalendar('testNamespace');
    });

    it('should initialize correctly', () => {
        expect(taskCalendar).toBeDefined();

    });

    const mockLocalStorage = (() => {
        let store: { [key: string]: string } = {};

        return {
            getItem: jest.fn((key: string): string | null => store[key] || null),
            setItem: jest.fn((key: string, value: string): void => { store[key] = value; }),
            clear: jest.fn((): void => { store = {}; }),
        };
    })();

    Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage,
    });

    describe('getTasks', () => {
        beforeEach(() => {
            mockLocalStorage.clear();
        });

        it('should retrieve tasks from localStorage', async () => {
            const sampleTasks = [
                { id: '1', text: 'Task 1', date: '2021-01-01', status: 'new', tags: [] },
            ];

            mockLocalStorage.setItem('testNamespace', JSON.stringify(sampleTasks));

            const taskCalendar = new TaskCalendar('testNamespace');

            const tasks = await taskCalendar['getTasks']();

            expect(tasks).toEqual(sampleTasks);
            expect(mockLocalStorage.getItem).toHaveBeenCalledWith('testNamespace');
        });

        it('should return an empty array if no tasks in localStorage', async () => {
            const taskCalendar = new TaskCalendar('testNamespace');
            const tasks = await taskCalendar['getTasks']();

            expect(tasks).toEqual([]);
            expect(mockLocalStorage.getItem).toHaveBeenCalledWith('testNamespace');
        });
    });

    describe('TaskCalendar get tests', () => {
        let taskCalendar: TaskCalendar;

        beforeEach(() => {
            (get as jest.Mock).mockReset();
            (get as jest.Mock).mockImplementation(() => {
                return {
                    exists: () => true,
                    val: () => ({
                        'lopxsixid920y3syk5c': {
                            date: '2023-11-08',
                            status: 'new',
                            tags: '1',
                            text: '1',
                        },
                        'lopxsrhi2hfv1vfhde2': {
                            date: '2023-11-08',
                            status: 'new',
                            tags: '2',
                            text: '2',
                        }
                    })
                };
            });

            taskCalendar = new TaskCalendar('testNamespace');
        });

        afterEach(() => {
            localStorage.clear(); 
        });

        it('getToDoList should correctly process tasks from Firebase', async () => {
            const tasks: Task[] = await taskCalendar['getToDoList']();

            expect(tasks).toHaveLength(2);

            expect(tasks[0]).toEqual({
                id: 'lopxsixid920y3syk5c',
                date: '2023-11-08',
                status: 'new',
                tags: ['1'],
                text: '1'
            });

            expect(tasks[1]).toEqual({
                id: 'lopxsrhi2hfv1vfhde2',
                date: '2023-11-08',
                status: 'new',
                tags: ['2'],
                text: '2'
            });
        });
    });


    describe('TaskCalendar set methods', () => {
        let taskCalendar: TaskCalendar;

        beforeEach(() => {
            taskCalendar = new TaskCalendar('testNamespace');
            Storage.prototype.setItem = jest.fn();
            Storage.prototype.clear = jest.fn(); 
        });

        afterEach(() => {
            (get as jest.Mock).mockReset();
            localStorage.clear(); 
        });

        it('setTasks should save tasks to localStorage', async () => {
            const tasks: Task[] = [{
                id: '1',
                text: 'Task 1',
                date: '2021-01-01',
                status: 'new',
                tags: []
            }];
            await taskCalendar['setTasks'](tasks);

            expect(localStorage.setItem).toHaveBeenCalledWith('testNamespace', JSON.stringify(tasks));
        });

    })
});



