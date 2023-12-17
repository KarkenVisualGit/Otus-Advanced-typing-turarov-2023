import { TaskCalendarUI } from "./TaskCalendarUI";
import { TaskCalendar } from "./TaskCalendar";
import { Task } from "./types";

jest.mock("./TaskCalendar");

describe("TaskCalendarUI", () => {
  let taskCalendar: TaskCalendar;
  let taskCalendarUI: TaskCalendarUI;

  beforeEach(() => {
    taskCalendar = {
      getTasksFromFirebase: jest.fn(),
      getTasksLocalStorage: jest.fn(),
      getAllTasks: jest.fn().mockResolvedValue([]),
      deleteTaskLocalStorage: jest.fn(),
      deleteTaskFromFirebase: jest.fn(),
    } as unknown as TaskCalendar;

    document.body.innerHTML = `
      <button id="addOrUpdateTaskButton"></button>
      <button id="applyFiltersButton"></button>
      <button id="loadFromFirebaseButton"></button>
      <button id="loadFromLocalButton"></button>
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
    taskCalendarUI = new TaskCalendarUI(taskCalendar);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("handleDeleteTaskLocally should delete task and update UI", async () => {
    const mockTaskId = "task1";
    jest.spyOn(taskCalendar, "deleteTaskLocalStorage").mockResolvedValue(true);
    jest.spyOn(taskCalendarUI, "renderTasks");

    await taskCalendarUI.handleDeleteTaskLocally(mockTaskId);

    expect(taskCalendar.deleteTaskLocalStorage).toHaveBeenCalledWith(
      mockTaskId
    );
    expect(taskCalendarUI.renderTasks).toHaveBeenCalled();
  });

  test("handleDeleteTaskFromFirebase should call deleteTask Firebase and renderTasks", async () => {
    const mockTaskId = "testTaskId";

    (taskCalendar.deleteTaskFromFirebase as jest.Mock).mockResolvedValue(true);
    const renderTasksSpy = jest.spyOn(taskCalendarUI, "renderTasks");

    await taskCalendarUI.handleDeleteTaskFromFirebase(mockTaskId);

    expect(taskCalendar.deleteTaskFromFirebase).toHaveBeenCalledWith(
      mockTaskId
    );
    expect(renderTasksSpy).toHaveBeenCalled();
  });

  test("renderTasks should create and append task elements to the list", async () => {
    const mockTasks: Task[] = [
      {
        id: "1",
        text: "Task 1",
        date: "2021-01-01",
        status: "new",
        tags: [],
        isDeletedLocally: false,
        isDeletedFromFirebase: false,
      },
      {
        id: "2",
        text: "Task 2",
        date: "2021-01-02",
        status: "in progress",
        tags: [],
        isDeletedLocally: false,
        isDeletedFromFirebase: false,
      },
    ];

    (taskCalendar.getAllTasks as jest.Mock).mockResolvedValue(mockTasks);

    await taskCalendarUI.renderTasks();

    const taskListElement = document.getElementById(
      "taskList"
    ) as HTMLUListElement;
    expect(taskListElement.children).toHaveLength(2);

    const firstTaskElement = taskListElement.children[0];
    expect(firstTaskElement.textContent).toContain("Task 1");
    expect(firstTaskElement.querySelector(".edit-btn")).not.toBeNull();
    expect(firstTaskElement.querySelector(".delete-btn")).not.toBeNull();
    expect(
      firstTaskElement.querySelector(".delete-btn-firebase")
    ).not.toBeNull();
  });
});

describe("TaskCalendarUI test editTask", () => {
  let taskCalendar: TaskCalendar;
  let taskCalendarUI: TaskCalendarUI;

  beforeEach(() => {
    document.body.innerHTML = `
      <textarea id="taskText"></textarea>
      <input id="taskDate" type="date" />
      <select id="taskStatus">
			<option value="new">New</option>
			<option value="in progress">In Progress</option>
			<option value="done">Done</option>
			</select>
      <input id="taskTags" />
      <button id="addOrUpdateTaskButton"></button>
			<ul id="taskList"></ul>
    `;

    taskCalendar = {
      getTasksFromFirebase: jest.fn(),
      getTasksLocalStorage: jest.fn(),
      getTaskById: jest.fn(),
      getAllTasks: jest.fn().mockResolvedValue([]),
      deleteTaskLocalStorage: jest.fn(),
      deleteTaskFromFirebase: jest.fn(),
    } as unknown as TaskCalendar;

    taskCalendarUI = new TaskCalendarUI(taskCalendar);
  });

  test("editTask should populate the form with task data", async () => {
    const mockTask: Task = {
      id: "1",
      text: "Test Task",
      date: "2021-01-01",
      status: "new",
      tags: ["tag1", "tag2"],
      isDeletedLocally: false,
      isDeletedFromFirebase: false,
    };

    (taskCalendar.getTaskById as jest.Mock).mockResolvedValue(mockTask);

    await taskCalendarUI.editTask(mockTask.id);

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

  test("clearForm should reset form fields", async () => {
    (document.getElementById("taskText") as HTMLTextAreaElement).value =
      "Sample text";
    (document.getElementById("taskDate") as HTMLInputElement).value =
      "2021-01-01";
    (document.getElementById("taskStatus") as HTMLSelectElement).value = "new";
    (document.getElementById("taskTags") as HTMLInputElement).value =
      "tag1, tag2";
    (
      document.getElementById("addOrUpdateTaskButton") as HTMLButtonElement
    ).dataset.editingId = "123";

    await taskCalendarUI.clearForm();

    expect(
      (document.getElementById("taskText") as HTMLTextAreaElement).value
    ).toBe("");
    expect(
      (document.getElementById("taskDate") as HTMLInputElement).value
    ).toBe("");
    expect(
      (document.getElementById("taskStatus") as HTMLSelectElement).value
    ).toBe("");
    expect(
      (document.getElementById("taskTags") as HTMLInputElement).value
    ).toBe("");
    expect(
      (document.getElementById("addOrUpdateTaskButton") as HTMLButtonElement)
        .dataset.editingId
    ).toBeUndefined();
  });
});

describe("TaskCalendarUI applyFilters", () => {
  let taskCalendar: TaskCalendar;
  let taskCalendarUI: TaskCalendarUI;

  beforeEach(() => {
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

    taskCalendar = {
      getAllTasks: jest.fn().mockResolvedValue([]),
      deleteTaskLocalStorage: jest.fn(),
      deleteTaskFromFirebase: jest.fn(),
      getTasksLocalStorage: jest.fn(),
      getTasksFromFirebase: jest.fn(),
      taskMatchesFilter: jest.fn(),
    } as unknown as TaskCalendar;

    taskCalendarUI = new TaskCalendarUI(taskCalendar);
  });

  test("applyFilters should filter tasks based on selected filter and render them", async () => {
    const mockTasks: Task[] = [
      {
        id: "1",
        text: "Task 1",
        date: "2021-01-01",
        status: "new",
        tags: [],
        isDeletedLocally: false,
        isDeletedFromFirebase: false,
      },
      {
        id: "2",
        text: "Task 2",
        date: "2021-01-02",
        status: "done",
        tags: ["tag1"],
        isDeletedLocally: false,
        isDeletedFromFirebase: false,
      },
    ];

    (taskCalendar.getAllTasks as jest.Mock).mockResolvedValue(mockTasks);
    (taskCalendar.getTasksLocalStorage as jest.Mock).mockResolvedValue(
      mockTasks
    );
    (taskCalendar.getTasksFromFirebase as jest.Mock).mockResolvedValue(
      mockTasks
    );

    (document.getElementById("filterSource") as HTMLSelectElement).value =
      "all";
    (document.getElementById("filterText") as HTMLInputElement).value = "Task";
    (document.getElementById("filterDate") as HTMLInputElement).value =
      "2021-01-01";
    (document.getElementById("filterStatus") as HTMLSelectElement).value =
      "new";
    (document.getElementById("filterTags") as HTMLInputElement).value = "tag1";

    await taskCalendarUI.applyFilters();

    expect(taskCalendar.getAllTasks).toHaveBeenCalled();
    expect(taskCalendar.taskMatchesFilter).toHaveBeenCalled();
  });
});
