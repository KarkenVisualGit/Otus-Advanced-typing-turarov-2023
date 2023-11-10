import { TaskCalendar, Task } from "./TaskCalendar";

jest.mock("firebase/app", () => ({
	initializeApp: jest.fn(),
}));

jest.mock("firebase/database", () => ({
	getDatabase: jest.fn(),
	ref: jest.fn(),
	set: jest.fn(),
	get: jest.fn(),
	remove: jest.fn(),
}));

jest.mock("firebase/database", () => ({
	getDatabase: jest.fn(),
	ref: jest.fn(),
	set: jest.fn(),
	get: jest.fn().mockImplementation(() =>
		Promise.resolve({
			exists: () => false,
			val: () => ({}),
		})
	),
	remove: jest.fn(),
}));

class TestableTaskCalendar extends TaskCalendar {
	public getNamespace() {
		return this.namespace;
	}

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

	public testsetTasks(tasks: Task[]): Promise<void> {
		return this.setTasks(tasks);
	}

	public testDeleteTask(
		taskId: string,
		deleteButton: HTMLButtonElement
	): Promise<void> {
		return this.deleteTask(taskId, deleteButton);
	}
}

describe("deleteTask Method", () => {
	let taskCalendar: TestableTaskCalendar;
	const mockTasks: Task[] = [
		{ id: "1", text: "Task 1", date: "2021-01-01", status: "new", tags: [] },
		{
			id: "2",
			text: "Task 2",
			date: "2021-01-02",
			status: "in progress",
			tags: ["urgent"],
		},
	];

	beforeEach(() => {
		document.body.innerHTML = "<ul id=\"taskList\"></ul>";
		taskCalendar = new TestableTaskCalendar("testNamespace");

		jest.spyOn(taskCalendar, "testgetTasks").mockResolvedValue(mockTasks);
		Storage.prototype.setItem = jest.fn();
		Storage.prototype.getItem = jest
			.fn()
			.mockImplementation(() => JSON.stringify(mockTasks));
	});

	afterEach(() => {
		document.body.innerHTML = "";
	});

	it("should remove the task with given ID and update delete button", async () => {
		const deleteButton = document.createElement("button");

		await taskCalendar.testDeleteTask("1", deleteButton);

		expect(deleteButton.textContent).toBe("Deleted locally");
		expect(deleteButton.disabled).toBeTruthy();

		expect(Storage.prototype.setItem).toHaveBeenCalledWith(
			taskCalendar.getNamespace(),
			JSON.stringify(mockTasks.filter((task) => task.id !== "1"))
		);

		const taskListElement = document.getElementById(
			"taskList"
		) as HTMLUListElement;
		console.log(taskListElement.childElementCount);
		expect(taskListElement.childElementCount).toBe(2);
	});
});
