import { TaskCalendar, Task } from "./TaskCalendar";

jest.mock("firebase/app", () => ({
	initializeApp: jest.fn(),
}));

jest.mock("firebase/database", () => ({
	getDatabase: jest.fn(),
	ref: jest.fn(),
	set: jest.fn(),
	get: jest.fn().mockImplementation(() =>
		Promise.resolve({
			exists: () => true,
			val: () => ({}),
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

Object.defineProperty(window, "localStorage", {
	value: localStorageMock,
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
}

describe("TaskCalendar", () => {
	let taskCalendar: TestableTaskCalendar;
	beforeEach(() => {
		taskCalendar = new TestableTaskCalendar("testNamespace");
		document.body.innerHTML = `
            <select id="filterSource">
                <option value="all">All</option>
                <option value="local">Local</option>
                <option value="firebase">Firebase</option>
            </select>
            <input id="filterText" />
            <input id="filterDate" />
            <select id="filterStatus">
                <option value="new">New</option>
                <option value="in progress">In Progress</option>
                <option value="done">Done</option>
            </select>
            <input id="filterTags" />
            <ul id="taskList"></ul>
        `;
	});

	it("should apply filters and render filtered tasks", async () => {
		(document.getElementById("filterText") as HTMLInputElement).value = "Task";
		(document.getElementById("filterDate") as HTMLInputElement).value =
      "2023-01-01";
		(document.getElementById("filterStatus") as HTMLSelectElement).value =
      "new";
		(document.getElementById("filterTags") as HTMLInputElement).value =
      "urgent";

		const mockTasks: Task[] = [
			{
				id: "1",
				text: "Task 1",
				date: "2023-01-01",
				status: "new",
				tags: ["urgent"],
			},
			{
				id: "2",
				text: "Task 2",
				date: "2023-01-02",
				status: "done",
				tags: ["important"],
			},
		];
		localStorageMock.setItem("testNamespace", JSON.stringify(mockTasks));

		jest.spyOn(taskCalendar, "testgetTasks").mockResolvedValue(mockTasks);
		jest.spyOn(taskCalendar, "getToDoListWrapper").mockResolvedValue(mockTasks);

		await taskCalendar.applyFilters();

		const taskListElement = document.getElementById(
			"taskList"
		) as HTMLUListElement;
		expect(taskListElement.children).toHaveLength(1);
		expect(taskListElement.textContent).toContain("Task 1");
	});

	afterEach(() => {
		localStorageMock.clear();
		jest.restoreAllMocks();
		document.body.innerHTML = "";
	});
});
