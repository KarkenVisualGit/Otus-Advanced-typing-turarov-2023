import { TaskCalendar, Task } from "./TaskCalendar";

class TestableTaskCalendar extends TaskCalendar {
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

jest.mock("firebase/app", () => ({
	initializeApp: jest.fn(),
}));

jest.mock("firebase/database", () => ({
	getDatabase: jest.fn(),
	ref: jest.fn(),
	get: jest.fn().mockRejectedValue(new Error("Firebase error")),
	remove: jest.fn(),
}));

describe("TaskCalendar getToDoList method", () => {
	let taskCalendar: TestableTaskCalendar;
	beforeEach(() => {
		taskCalendar = new TestableTaskCalendar("testNamespace");
	});

	it("getToDoList should handle errors correctly", async () => {
		const consoleSpy = jest.spyOn(console, "error").mockImplementation();

		const result = await taskCalendar.getToDoListWrapper();

		expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
		expect(result).toEqual([]);
		consoleSpy.mockRestore();
	});

	afterEach(() => {
		jest.clearAllMocks();
	});
});
