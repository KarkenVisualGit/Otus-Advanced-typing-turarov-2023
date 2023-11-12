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
			exists: () => false,
			val: () => ({}),
		})
	),
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

describe("TaskCalendar", () => {
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

	afterEach(() => {
		jest.restoreAllMocks();
		document.body.innerHTML = '';
	});

	it("should render tasks correctly when tasks are provided", async () => {
		taskCalendar = new TestableTaskCalendar("testNamespace");
		const tasks: Task[] = [
			{
				id: "1",
				text: "Task 1",
				date: "2023-11-08",
				status: "in progress",
				tags: ["Shopping", "Urgent"],
			},
			{
				id: "2",
				text: "Task 2",
				date: "2023-11-09",
				status: "in progress",
				tags: ["Work", "Important"],
			},
		];

		await taskCalendar.renderMyTasks(tasks);

		const taskListElement = document.getElementById(
			"taskList"
		) as HTMLUListElement;
		expect(taskListElement.childElementCount).toBe(2);

		const taskElements = Array.from(taskListElement.children);
		expect(taskElements).toHaveLength(2);

		const firstTaskElement = taskElements[0];
		expect(firstTaskElement.textContent).toContain("Task 1");
		expect(
			firstTaskElement.querySelector("span:nth-child(1)")!.textContent
		).toBe("Date: 2023-11-08");
		expect(
			firstTaskElement.querySelector("span:nth-child(2)")!.textContent
		).toBe("Status: in progress");
		expect(
			firstTaskElement.querySelector("span:nth-child(3)")!.textContent
		).toBe("Tags: Shopping, Urgent");
		const secondTaskElement = taskElements[1];
		expect(secondTaskElement.textContent).toContain("Task 2");
		expect(
			secondTaskElement.querySelector("span:nth-child(1)")!.textContent
		).toBe("Date: 2023-11-09");
		expect(
			secondTaskElement.querySelector("span:nth-child(2)")!.textContent
		).toBe("Status: in progress");
		expect(
			secondTaskElement.querySelector("span:nth-child(3)")!.textContent
		).toBe("Tags: Work, Important");
	});

	it("should not render tasks from getTodoList when tasks are not provided", async () => {
		taskCalendar = new TestableTaskCalendar("testNamespace");

		jest.spyOn(taskCalendar, "getToDoListWrapper").mockResolvedValue([]);

		await taskCalendar.renderMyTasks();

		expect(taskCalendar.getToDoListWrapper).not.toHaveBeenCalled();
		const taskListElement = document.getElementById(
			"taskList"
		) as HTMLUListElement;
		expect(taskListElement.childElementCount).toBe(0);
	});

	it("should render empty tasks correctly", async () => {
		taskCalendar = new TestableTaskCalendar("testNamespace");
		const tasks: Task[] = [
			{
				id: "1",
				text: "",
				date: "",
				status: "new",
				tags: [],
			},
		];

		await taskCalendar.renderMyTasks(tasks);

		const taskListElement = document.getElementById(
			"taskList"
		) as HTMLUListElement;
		expect(taskListElement.childElementCount).toBe(1);
	});

	it('should remove task from DOM on successful deletion from Firebase', async () => {
		taskCalendar = new TestableTaskCalendar("testNamespace");
		const mockTask: Task = {
			id: 'mockId',
			text: 'Mock Task',
			date: '2023-01-01',
			status: 'new',
			tags: ['tag1', 'tag2']
		};

		jest.spyOn(taskCalendar, 'delToDoListWrapper').mockResolvedValue(true);
		jest.spyOn(taskCalendar, 'testgetTasks').mockResolvedValue([]);

		await taskCalendar.renderMyTasks([mockTask]);

		const deleteButtonFirebase = document.querySelector('.delete-btn-firebase') as HTMLButtonElement;

		deleteButtonFirebase.click();
		await taskCalendar.renderMyTasks();

		expect(document.querySelector('.task-item-flex')).toBeNull();
	});
});
