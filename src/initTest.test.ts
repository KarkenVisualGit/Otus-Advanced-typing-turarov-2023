import { TaskCalendar, Task } from './TaskCalendar';

jest.mock("firebase/app", () => ({
    initializeApp: jest.fn(),
}));

jest.mock("firebase/database", () => ({
    getDatabase: jest.fn(),
    ref: jest.fn(),
    set: jest.fn().mockImplementation(() =>
        Promise.resolve({
            exists: () => true,
            val: () => ({
                "2": {
                    text: "Firebase Task",
                    date: "2023-01-02",
                    status: "in progress",
                    tags: "firebase, task",
                },
            }),
        })
    ),
    get: jest.fn().mockImplementation(() =>
        Promise.resolve({
            exists: () => true,
            val: () => ({
                "2": {
                    text: "Firebase Task",
                    date: "2023-01-02",
                    status: "in progress",
                    tags: "firebase, task",
                },
            }),
        })
    ),
    remove: jest.fn(),
}));

const localStorageMock = (() => {
    let store: { [key: string]: string } = {};

    return {
        getItem: jest.fn((key: string): string | null => store[key] || null),
        setItem: jest.fn((key: string, value: string): void => {
            store[key] = value;
        }),
        clear: jest.fn((): void => {
            store = {};
        }),
    };
})();

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
});

class TestableTaskCalendar extends TaskCalendar {
    public async testGetToDoList(): Promise<Task[]> {
        return this.getToDoList();
    }

    public testgetTasks(): Promise<Task[]> {
        return this.getTasks();
    }

    public getToDoListWrapper(): Promise<Task[]> {
        return this.getToDoList();
    }

    public testsetTasks(tasks: Task[]): Promise<void> {
        return this.setTasks(tasks);
    }

    public testapplyFilters(): Promise<void> {
        return this.applyFilters();
    }

    public async testInit(): Promise<void> {
        return this.init();
    }

    public async testaddOrUpdateTask(): Promise<void> {
        return this.addOrUpdateTask();
    }

    public async renderMyTasks(tasks?: Task[]): Promise<void> {
        await this.renderTasks(tasks);
    }
}

describe('TaskCalendar init method', () => {
    let taskCalendar: TestableTaskCalendar;
    
    beforeEach(() => {
        document.body.innerHTML = `
            <select id="saveOption">
            <option value="local" selected>Local</option>
            <option value="firebase">Firebase</option>
            </select>
            <textarea id="taskText">Test Task</textarea>
            <input id="taskDate" value="2023-01-01" />
            <select id="taskStatus">
            <option value="new">New</option>
            </select>
            <input id="taskTags" value="tag1,tag2" />
            <button id="addOrUpdateTaskButton"></button>
            <ul class="task-list" id="taskList"></ul>
            <button id="addOrUpdateTaskButton"></button>
            <button id="applyFiltersButton"></button>
            <button id="loadFromFirebaseButton"></button>
            <button id="loadFromLocalButton"></button>
        `;
        taskCalendar = new TestableTaskCalendar('testNamespace');

        taskCalendar.testInit();
    });

    it('should assign click event listeners to buttons', () => {

        const addOrUpdateTaskButton = document.getElementById("addOrUpdateTaskButton") as HTMLButtonElement;
        const applyFiltersButton = document.getElementById('applyFiltersButton') as HTMLButtonElement;
        const loadFromFirebaseButton = document.getElementById('loadFromFirebaseButton') as HTMLButtonElement;
        const loadFromLocalButton = document.getElementById('loadFromLocalButton') as HTMLButtonElement;

        expect(addOrUpdateTaskButton.onclick).toBeDefined();
        expect(applyFiltersButton.onclick).toBeDefined();
        expect(loadFromFirebaseButton.onclick).toBeDefined();
        expect(loadFromLocalButton.onclick).toBeDefined();
    });

    afterEach(() => {
        jest.restoreAllMocks();
        document.body.innerHTML = '';
    });
});
