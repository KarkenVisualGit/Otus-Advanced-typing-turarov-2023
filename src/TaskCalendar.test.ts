import { TaskCalendar, Task } from "./TaskCalendar";
import { TaskService } from "./TaskService";

describe("TaskCalendar", () => {
  let localTaskService: TaskService;
  let firebaseTaskService: TaskService;
  let taskCalendar: TaskCalendar;

  beforeEach(() => {
    localTaskService = {
      getTasks: jest.fn(),
      saveTask: jest.fn(),
      deleteTask: jest.fn(),
    } as unknown as TaskService;

    firebaseTaskService = {
      getTasks: jest.fn(),
      saveTask: jest.fn(),
      deleteTask: jest.fn(),
    } as unknown as TaskService;

    taskCalendar = new TaskCalendar(localTaskService, firebaseTaskService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("getAllTasks should return combined tasks from both services", async () => {
    const mockLocalTasks = [
      {
        id: "1",
        text: "Test Local",
        date: "2021-01-01",
        status: "new",
        tags: [],
        isDeletedLocally: false,
        isDeletedFromFirebase: false,
      },
    ];
    const mockFirebaseTasks = [
      {
        id: "2",
        text: "Test Firebase",
        date: "2021-01-02",
        status: "done",
        tags: [],
        isDeletedLocally: false,
        isDeletedFromFirebase: false,
      },
    ];

    (localTaskService.getTasks as jest.Mock).mockResolvedValue(mockLocalTasks);
    (firebaseTaskService.getTasks as jest.Mock).mockResolvedValue(
      mockFirebaseTasks
    );

    const tasks = await taskCalendar.getAllTasks();
    expect(tasks).toHaveLength(2);
    expect(tasks[0]).toEqual(mockLocalTasks[0]);
    expect(tasks[1]).toEqual(mockFirebaseTasks[0]);
  });

  test("getTaskById should return the task with given id if it exists", async () => {
    const mockTasks = [
      {
        id: "1",
        text: "Test Task 1",
        date: "2021-01-01",
        status: "new",
        tags: [],
        isDeletedLocally: false,
        isDeletedFromFirebase: false,
      },
      {
        id: "2",
        text: "Test Task 2",
        date: "2021-01-02",
        status: "done",
        tags: [],
        isDeletedLocally: false,
        isDeletedFromFirebase: false,
      },
    ];

    const mockGetAllTasks = (
      localTaskService.getTasks as jest.Mock
    ).mockResolvedValue(mockTasks);
    (firebaseTaskService.getTasks as jest.Mock).mockResolvedValue([]);

    const foundTask = await taskCalendar.getTaskById("1");
    expect(foundTask).toEqual(mockTasks[0]);
    expect(mockGetAllTasks).toHaveBeenCalled();
  });

  test("getTaskById should return null if the task does not exist", async () => {
    (localTaskService.getTasks as jest.Mock).mockResolvedValue([]);
    (firebaseTaskService.getTasks as jest.Mock).mockResolvedValue([]);

    const foundTask = await taskCalendar.getTaskById("3");
    expect(foundTask).toBeNull();
  });

  test("getTasksFromFirebase should return tasks from firebaseTaskService", async () => {
    const mockFirebaseTasks = [
      {
        id: "1",
        text: "Firebase Task 1",
        date: "2021-01-01",
        status: "new",
        tags: [],
        isDeletedLocally: false,
        isDeletedFromFirebase: false,
      },
      {
        id: "2",
        text: "Firebase Task 2",
        date: "2021-01-02",
        status: "done",
        tags: [],
        isDeletedLocally: false,
        isDeletedFromFirebase: false,
      },
    ];

    (firebaseTaskService.getTasks as jest.Mock).mockResolvedValue(
      mockFirebaseTasks
    );

    const tasks = await taskCalendar.getTasksFromFirebase();
    expect(tasks).toEqual(mockFirebaseTasks);
    expect(firebaseTaskService.getTasks).toHaveBeenCalled();
  });

  test("getTasksLocalStorage should return tasks from localTaskService", async () => {
    const mockLocalTasks = [
      {
        id: "3",
        text: "Local Task 1",
        date: "2021-01-03",
        status: "in progress",
        tags: [],
        isDeletedLocally: false,
        isDeletedFromFirebase: false,
      },
      {
        id: "4",
        text: "Local Task 2",
        date: "2021-01-04",
        status: "done",
        tags: [],
        isDeletedLocally: false,
        isDeletedFromFirebase: false,
      },
    ];

    (localTaskService.getTasks as jest.Mock).mockResolvedValue(mockLocalTasks);

    const tasks = await taskCalendar.getTasksLocalStorage();
    expect(tasks).toEqual(mockLocalTasks);
    expect(localTaskService.getTasks).toHaveBeenCalled();
  });
});

describe("TaskCalendar saveTask", () => {
  let localTaskService: TaskService & { saveTask: jest.Mock };
  let firebaseTaskService: TaskService;
  let taskCalendar: TaskCalendar;

  beforeEach(() => {
    localTaskService = {
      getTasks: jest.fn(),
      saveTask: jest.fn(),
      deleteTask: jest.fn(),
    } as unknown as TaskService & { saveTask: jest.Mock };
    firebaseTaskService = {
      getTasks: jest.fn(),
      saveTask: jest.fn(),
      deleteTask: jest.fn(),
    } as unknown as TaskService & { saveTask: jest.Mock };

    taskCalendar = new TaskCalendar(localTaskService, firebaseTaskService);
  });

  test("saveTaskLocally should call localTaskService.saveTask with the task", async () => {
    const mockTask: Task = {
      id: "1",
      text: "Test Task",
      date: "2021-01-01",
      status: "new",
      tags: [],
      isDeletedLocally: false,
      isDeletedFromFirebase: false,
    };

    await taskCalendar.saveTaskLocally(mockTask);

    expect(localTaskService.saveTask).toHaveBeenCalledWith(mockTask);
  });

  test("saveTaskInFirebase should call firebaseTaskService.saveTask with the task", async () => {
    const mockTask: Task = {
      id: "1",
      text: "Test Task",
      date: "2021-01-01",
      status: "new",
      tags: [],
      isDeletedLocally: false,
      isDeletedFromFirebase: false,
    };

    await taskCalendar.saveTaskInFirebase(mockTask);

    expect(firebaseTaskService.saveTask).toHaveBeenCalledWith(mockTask);
  });
});

describe("TaskCalendar", () => {
  let localTaskService: TaskService;
  let firebaseTaskService: TaskService & { deleteTask: jest.Mock };
  let taskCalendar: TaskCalendar;

  beforeEach(() => {
    localTaskService = {
      getTasks: jest.fn(),
      saveTask: jest.fn(),
      deleteTask: jest.fn(),
    } as unknown as TaskService;

    firebaseTaskService = {
      getTasks: jest.fn(),
      saveTask: jest.fn(),
      deleteTask: jest.fn(),
    } as unknown as TaskService & { deleteTask: jest.Mock };

    taskCalendar = new TaskCalendar(localTaskService, firebaseTaskService);
  });

  test("deleteTaskFromFirebase should call firebaseTaskService.deleteTask and update task status if successful", async () => {
    const taskId = "1";
    const mockTask: Task = {
      id: taskId,
      text: "Test Task",
      date: "2021-01-01",
      status: "new",
      tags: [],
      isDeletedLocally: false,
      isDeletedFromFirebase: false,
    };

    firebaseTaskService.deleteTask.mockResolvedValue(true);
    (localTaskService.getTasks as jest.Mock).mockResolvedValue([mockTask]);
    (firebaseTaskService.getTasks as jest.Mock).mockResolvedValue([]);

    const result = await taskCalendar.deleteTaskFromFirebase(taskId);

    expect(result).toBe(true);
    expect(firebaseTaskService.deleteTask).toHaveBeenCalledWith(taskId);
    const updatedTask = await taskCalendar.getTaskById(taskId);
    expect(updatedTask?.isDeletedFromFirebase).toBe(true);
  });

  test("deleteTaskFromFirebase should return false if firebaseTaskService.deleteTask fails", async () => {
    const taskId = "2";
    firebaseTaskService.deleteTask.mockResolvedValue(false);

    const result = await taskCalendar.deleteTaskFromFirebase(taskId);

    expect(result).toBe(false);
    expect(firebaseTaskService.deleteTask).toHaveBeenCalledWith(taskId);
  });
});
