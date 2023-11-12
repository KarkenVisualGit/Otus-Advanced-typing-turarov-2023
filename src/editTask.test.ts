import { get } from "firebase/database";
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

class TestableTaskCalendar extends TaskCalendar {
	public async testEditTask(taskId: string): Promise<void> {
		return this.editTask(taskId);
	}

	public getAllTasksWrapper(): Promise<Task[]> {
		return this.getAllTasks();
	}
}

describe("editTask Method", () => {
	let taskCalendar: TestableTaskCalendar;
	const mockTask: Task = {
		id: "1",
		text: "Test Task",
		date: "2023-01-01",
		status: "new",
		tags: ["test", "task"],
	};

	const localStorageMockData = [
		{
			id: "1",
			text: "Test Task",
			date: "2023-01-01",
			status: "new",
			tags: ["test", "task"],
		},
	];

	const firebaseMockData = {
		"2": {
			text: "Firebase Task",
			date: "2023-01-02",
			status: "in progress",
			tags: "firebase, task",
		},
	};

	jest.mock("firebase/database", () => ({
		getDatabase: jest.fn(),
		ref: jest.fn(),
		set: jest.fn(),
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

		taskCalendar = new TestableTaskCalendar("testNamespace");

		Storage.prototype.getItem = jest
			.fn()
			.mockImplementation(() => JSON.stringify(localStorageMockData));

		(get as jest.Mock).mockImplementation(() =>
			Promise.resolve({
				exists: () => true,
				val: () => firebaseMockData,
			})
		);

		jest
			.spyOn(taskCalendar, "getAllTasksWrapper")
			.mockResolvedValue([mockTask]);
	});

	afterEach(() => {
		jest.restoreAllMocks();
		document.body.innerHTML = ``;
	});

	it("should fill the form with task data for editing", async () => {
		await taskCalendar.testEditTask("1");

		expect(
			(document.getElementById("taskText") as HTMLTextAreaElement).value
		).toBe(mockTask.text);
		expect(
			(document.getElementById("taskDate") as HTMLInputElement).value
		).toBe(mockTask.date);
		expect(
			(document.getElementById("taskStatus") as HTMLSelectElement).value
		).toBe(mockTask.status);
		expect(
			(document.getElementById("taskTags") as HTMLInputElement).value
		).toBe(mockTask.tags.join(", "));
		expect(
			(document.getElementById("addOrUpdateTaskButton") as HTMLButtonElement)
				.dataset.editingId
		).toBe(mockTask.id);
	});

	it('editTask should return if task is not found', async () => {
		(document.getElementById("taskText") as HTMLTextAreaElement).value = "Initial value";
		(document.getElementById("taskDate") as HTMLInputElement).value = "2023-01-01";
		(document.getElementById("taskStatus") as HTMLSelectElement).value = "new";
		(document.getElementById("taskTags") as HTMLInputElement).value = "initial, tags";

		jest.spyOn(taskCalendar, 'getAllTasksWrapper').mockResolvedValue([]);

		await taskCalendar.testEditTask('nonexistentId');

		expect((document.getElementById("taskText") as HTMLTextAreaElement).value).toBe("Initial value");
		expect((document.getElementById("taskDate") as HTMLInputElement).value).toBe("2023-01-01");
		expect((document.getElementById("taskStatus") as HTMLSelectElement).value).toBe("new");
		expect((document.getElementById("taskTags") as HTMLInputElement).value).toBe("initial, tags");;
	});

});
