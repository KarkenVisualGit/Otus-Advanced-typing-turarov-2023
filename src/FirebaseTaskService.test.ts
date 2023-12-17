import { getDatabase, remove, set } from "firebase/database";
import { FirebaseTaskService } from "./FirebaseTaskService";
import { Task } from "./types";

const mockDb = {};
jest.mock("firebase/database", () => ({
  getDatabase: jest.fn(),
  ref: jest.fn().mockImplementation((db, path) => ({ db: mockDb, path })),
  set: jest.fn(),
  get: jest.fn().mockResolvedValue({
    exists: jest.fn().mockReturnValue(true),
    val: jest.fn().mockReturnValue({
      "task-id-1": {
        text: "Task 1",
        date: "2021-01-01",
        status: "new",
        tags: "tag1, tag2",
      },
      "task-id-2": {
        text: "Task 2",
        date: "2021-01-02",
        status: "in progress",
        tags: "tag3, tag4",
      },
    }),
  }),
  remove: jest.fn(),
}));

describe("FirebaseTaskService", () => {
  let firebaseTaskService: FirebaseTaskService;
  beforeEach(() => {
    (getDatabase as jest.Mock).mockReturnValue(mockDb);
    firebaseTaskService = new FirebaseTaskService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("getTasks should retrieve tasks from Firebase", async () => {
    const tasks = await firebaseTaskService.getTasks();
    expect(tasks).toEqual([
      {
        id: "task-id-1",
        text: "Task 1",
        date: "2021-01-01",
        status: "new",
        tags: ["tag1", "tag2"],
        isDeletedLocally: false,
        isDeletedFromFirebase: false,
      },
      {
        id: "task-id-2",
        text: "Task 2",
        date: "2021-01-02",
        status: "in progress",
        tags: ["tag3", "tag4"],
        isDeletedLocally: false,
        isDeletedFromFirebase: false,
      },
    ]);
  });

  test("deleteTask should remove a task from Firebase", async () => {
    const taskId = "1";
    await firebaseTaskService.deleteTask(taskId);
    expect(remove).toHaveBeenCalledWith({
      db: mockDb,
      path: `todos/${taskId}`,
    });
  });

  test("saveTask should save a task in Firebase", async () => {
    const newTask: Task = {
      id: "2",
      text: "Test Task 2",
      date: "2021-01-02",
      status: "in progress",
      tags: ["tag3"],
      isDeletedLocally: false,
      isDeletedFromFirebase: false,
    };
    await firebaseTaskService.saveTask(newTask);
    expect(set).toHaveBeenCalledWith(
      { db: mockDb, path: `todos/${newTask.id}` },
      {
        text: newTask.text,
        date: newTask.date,
        status: newTask.status,
        tags: newTask.tags.join(", "),
      }
    );
  });
});
