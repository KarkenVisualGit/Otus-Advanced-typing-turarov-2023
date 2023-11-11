import { set, ref } from "firebase/database";
import { TaskCalendar } from "./TaskCalendar";

jest.mock("firebase/app", () => ({
	initializeApp: jest.fn(),
}));

jest.mock("firebase/database", () => ({
	getDatabase: jest.fn().mockReturnValue("mockedDatabaseInstance"),
	ref: jest.fn().mockImplementation((database, path) => `${database}-${path}`),
	set: jest.fn(),
	get: jest.fn().mockImplementation(() =>
		Promise.resolve({
			exists: () => true,
			val: () => ({}),
		})
	),
	remove: jest.fn(),
}));

class TestableTaskCalendar extends TaskCalendar {
	public async testAddOrUpdateTask(taskId?: string): Promise<void> {
		if (taskId) {
			(
        document.getElementById("addOrUpdateTaskButton") as HTMLButtonElement
			).dataset.editingId = taskId;
		}
		return this.addOrUpdateTask();
	}

	public testgenerateId(): string {
		return this.generateId();
	}
}

describe("addOrUpdateTask", () => {
	let taskCalendar: TestableTaskCalendar;

	beforeEach(() => {
		taskCalendar = new TestableTaskCalendar("testNamespace");
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
      `;

		Storage.prototype.setItem = jest.fn();
		Storage.prototype.getItem = jest.fn().mockReturnValue("[]");
	});

	it("should add a new task to local storage", async () => {
		await taskCalendar.testAddOrUpdateTask();

		expect(Storage.prototype.setItem).toHaveBeenCalledWith(
			"testNamespace",
			expect.any(String)
		);
	});

	it("should add a new task to Firebase", async () => {
		const mockTask = {
			id: "testId",
			text: "Test Task",
			date: "2023-01-01",
			status: "new",
			tags: ["tag1", "tag2"],
		};
		(document.getElementById("saveOption") as HTMLSelectElement).value =
      "firebase";

		await taskCalendar.testAddOrUpdateTask("testId");

		expect(ref).toHaveBeenCalledWith(
			"mockedDatabaseInstance",
			`todos/${mockTask.id}`
		);
		expect(set).toHaveBeenCalledWith(
			`${"mockedDatabaseInstance"}-todos/${mockTask.id}`,
			{
				text: "Test Task",
				date: "2023-01-01",
				status: "new",
				tags: "tag1, tag2",
			}
		);
	});

	it("should update an existing task", async () => {
		Storage.prototype.getItem = jest.fn().mockReturnValue(
			JSON.stringify([
				{
					id: "1",
					text: "Old Task",
					date: "2022-01-01",
					status: "done",
					tags: [],
				},
			])
		);

		(
      document.getElementById("addOrUpdateTaskButton") as HTMLButtonElement
		).dataset.editingId = "1";

		await taskCalendar.testAddOrUpdateTask();

		expect(Storage.prototype.setItem).toHaveBeenCalledWith(
			"testNamespace",
			expect.stringContaining("Test Task")
		);
	});
});
