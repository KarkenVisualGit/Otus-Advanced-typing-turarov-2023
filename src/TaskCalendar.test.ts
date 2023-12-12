import { TaskCalendar } from "./TaskCalendar";
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
});
