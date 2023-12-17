import { LocalStorageTaskService } from "./LocalStorageTaskService";
import { Task } from "./types";
import { TaskCalendar } from "./TaskCalendar";

jest.mock("./TaskCalendar");

describe("LocalStorageTaskService", () => {
  /* eslint-disable @typescript-eslint/no-unused-vars */
  let taskCalendar: TaskCalendar;
  /* eslint-enable @typescript-eslint/no-unused-vars */
  let localStorageTaskService: LocalStorageTaskService;

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
    /* eslint-disable @typescript-eslint/no-unused-vars */
    taskCalendar = {
      getTasksFromFirebase: jest.fn(),
      getTasksLocalStorage: jest.fn(),
      getAllTasks: jest.fn().mockResolvedValue([]),
      deleteTaskLocalStorage: jest.fn(),
      deleteTaskFromFirebase: jest.fn(),
    } as unknown as TaskCalendar;
    /* eslint-enable @typescript-eslint/no-unused-vars */
    localStorageTaskService = new LocalStorageTaskService("testNamespace");
    localStorage.clear();
  });

  test("getTasks should return tasks from localStorage", async () => {
    const mockTasks = [
      {
        id: "1",
        text: "Task 1",
        date: "2021-01-01",
        status: "new",
        tags: [],
        isDeletedLocally: false,
        isDeletedFromFirebase: false,
      },
    ];
    localStorage.setItem("testNamespace", JSON.stringify(mockTasks));

    const tasks = await localStorageTaskService.getTasks();

    expect(tasks).toEqual(mockTasks);
  });

  test("deleteTask should remove a task from localStorage", async () => {
    const taskToDelete = {
      id: "1",
      text: "Task 1",
      date: "2021-01-01",
      status: "new",
      tags: [],
      isDeletedLocally: false,
      isDeletedFromFirebase: false,
    };
    localStorage.setItem("testNamespace", JSON.stringify([taskToDelete]));

    const deleteSuccessful = await localStorageTaskService.deleteTask("1");
    const storedItem = localStorage.getItem("testNamespace");
    const tasksAfterDeletion = storedItem ? JSON.parse(storedItem) : [];

    expect(deleteSuccessful).toBe(true);
    expect(tasksAfterDeletion).not.toContainEqual(taskToDelete);
  });

  test("saveTask should add or update a task in localStorage", async () => {
    const newTask: Task = {
      id: "2",
      text: "Task 2",
      date: "2021-01-02",
      status: "in progress",
      tags: [],
      isDeletedLocally: false,
      isDeletedFromFirebase: false,
    };
    await localStorageTaskService.saveTask(newTask);

    const savedTasks = JSON.parse(
      localStorage.getItem("testNamespace") || "[]"
    );
    expect(savedTasks).toContainEqual(newTask);
  });
});
