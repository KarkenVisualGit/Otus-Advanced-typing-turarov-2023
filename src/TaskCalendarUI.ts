import { TaskCalendar } from "./TaskCalendar";
import { Task, TaskFilter } from "./types";

export class TaskCalendarUI {
  private taskCalendar: TaskCalendar;

  protected deletedFromFirebase: Set<string> = new Set();

  protected idsFromFirebase: Set<string> = new Set();

  constructor(taskCalendar: TaskCalendar) {
    this.taskCalendar = taskCalendar;
    this.initEventListeners();
  }

  private async initEventListeners(): Promise<void> {
    document
      .getElementById("addOrUpdateTaskButton")
      ?.addEventListener("click", async () => {
        await this.addOrUpdateTask();
      });
    document
      .getElementById("applyFiltersButton")
      ?.addEventListener("click", async () => {
        await this.applyFilters();
      });
    document
      .getElementById("loadFromFirebaseButton")
      ?.addEventListener("click", async () => {
        const tasksFromFirebase =
          await this.taskCalendar.getTasksFromFirebase();
        this.renderTasks(tasksFromFirebase);
      });

    document
      .getElementById("loadFromLocalButton")
      ?.addEventListener("click", async () => {
        const tasksFromLocal = await this.taskCalendar.getTasksLocalStorage();
        this.renderTasks(tasksFromLocal);
      });
    await this.renderTasks();
  }

  public async handleDeleteTaskLocally(taskId: string): Promise<void> {
    const deleteSuccessful =
      await this.taskCalendar.deleteTaskLocalStorage(taskId);
    if (deleteSuccessful) {
      await this.renderTasks();
    }
  }

  public async handleDeleteTaskFromFirebase(taskId: string): Promise<void> {
    const deleteSuccessful =
      await this.taskCalendar.deleteTaskFromFirebase(taskId);
    if (deleteSuccessful) {
      await this.renderTasks();
    }
  }

  public async renderTasks(tasks?: Task[]): Promise<void> {
    const taskListElement = document.getElementById(
      "taskList"
    ) as HTMLUListElement;
    taskListElement.innerHTML = "";

    const tasksToRender = tasks || (await this.taskCalendar.getAllTasks());

    tasksToRender.forEach((task) => {
      const taskElement = document.createElement("li");
      taskElement.classList.add("task-item-flex");
      const editButton = document.createElement("button");
      editButton.textContent = "Edit";
      editButton.classList.add("edit-btn");
      editButton.addEventListener("click", () => this.editTask(task.id));

      const deleteButton = document.createElement("button");
      deleteButton.textContent = task.isDeletedLocally
        ? "Deleted locally"
        : "Delete local";
      deleteButton.classList.add("delete-btn");

      deleteButton.disabled = task.isDeletedLocally;
      deleteButton.addEventListener("click", async () => {
        await this.handleDeleteTaskLocally(task.id);
      });

      const deleteButtonFirebase = document.createElement("button");
      deleteButtonFirebase.textContent = task.isDeletedFromFirebase
        ? "Deleted from Firebase"
        : "Delete from Firebase";
      deleteButtonFirebase.classList.add("delete-btn-firebase");
      deleteButtonFirebase.disabled = task.isDeletedFromFirebase;
      deleteButtonFirebase.addEventListener("click", async () => {
        await this.handleDeleteTaskFromFirebase(task.id);
      });

      const dateElement = document.createElement("span");
      dateElement.textContent = `Date: ${task.date}`;
      const statusElement = document.createElement("span");
      statusElement.textContent = `Status: ${task.status}`;
      const tagsElement = document.createElement("span");
      tagsElement.textContent = `Tags: ${task.tags.join(", ")}`;

      taskElement.appendChild(document.createTextNode(task.text));
      taskElement.appendChild(dateElement);
      taskElement.appendChild(statusElement);
      taskElement.appendChild(tagsElement);
      taskElement.appendChild(editButton);
      taskElement.appendChild(deleteButton);
      taskElement.appendChild(deleteButtonFirebase);

      taskListElement.appendChild(taskElement);
    });
  }

  async editTask(taskId: string): Promise<void> {
    const task = await this.taskCalendar.getTaskById(taskId);
    if (!task) {
      return;
    }

    (document.getElementById("taskText") as HTMLTextAreaElement).value =
      task.text;
    (document.getElementById("taskDate") as HTMLInputElement).value = task.date;
    (document.getElementById("taskStatus") as HTMLSelectElement).value =
      task.status;
    (document.getElementById("taskTags") as HTMLInputElement).value =
      task.tags.join(", ");
    (
      document.getElementById("addOrUpdateTaskButton") as HTMLButtonElement
    ).dataset.editingId = task.id;
  }

  // eslint-disable-next-line class-methods-use-this
  public async clearForm(): Promise<void> {
    (document.getElementById("taskText") as HTMLTextAreaElement).value = "";
    (document.getElementById("taskDate") as HTMLInputElement).value = "";
    (document.getElementById("taskStatus") as HTMLSelectElement).value = "";
    (document.getElementById("taskTags") as HTMLInputElement).value = "";
    delete (
      document.getElementById("addOrUpdateTaskButton") as HTMLButtonElement
    ).dataset.editingId;
  }

  public async applyFilters(): Promise<void> {
    const filterSourceElement = document.getElementById(
      "filterSource"
    ) as HTMLSelectElement;
    const filterSource = filterSourceElement.value;

    const filterTextElement = document.getElementById(
      "filterText"
    ) as HTMLInputElement;
    const filterDateElement = document.getElementById(
      "filterDate"
    ) as HTMLInputElement;
    const filterStatusElement = document.getElementById(
      "filterStatus"
    ) as HTMLSelectElement;
    const filterTagsElement = document.getElementById(
      "filterTags"
    ) as HTMLInputElement;

    const filter: TaskFilter = {
      text: filterTextElement.value,
      date: filterDateElement.value,
      status:
        (filterStatusElement.value as "new" | "in progress" | "done") ||
        undefined,

      tags: filterTagsElement.value
        ? filterTagsElement.value.split(",").map((tag) => tag.trim())
        : undefined,
    };

    let tasks: Task[] = [];
    if (filterSource === "all") {
      tasks = await this.taskCalendar.getAllTasks();
    } else if (filterSource === "local") {
      tasks = await this.taskCalendar.getTasksLocalStorage();
    } else if (filterSource === "firebase") {
      tasks = await this.taskCalendar.getTasksFromFirebase();
    }
    const filteredTasks = tasks.filter((task) =>
      this.taskCalendar.taskMatchesFilter(task, filter)
    );
    await this.renderTasks(filteredTasks);
  }

  public async addOrUpdateTask(): Promise<void> {
    const saveOptionElement = document.getElementById(
      "saveOption"
    ) as HTMLSelectElement;
    const saveOption = saveOptionElement.value;
    const taskTextElement = document.getElementById(
      "taskText"
    ) as HTMLTextAreaElement;
    const taskDateElement = document.getElementById(
      "taskDate"
    ) as HTMLInputElement;
    const taskStatusElement = document.getElementById(
      "taskStatus"
    ) as HTMLSelectElement;
    const taskTagsElement = document.getElementById(
      "taskTags"
    ) as HTMLInputElement;
    const { editingId } = (
      document.getElementById("addOrUpdateTaskButton") as HTMLButtonElement
    ).dataset;

    const taskId = editingId || this.taskCalendar.generateId();

    const task: Task = {
      id: taskId,
      text: taskTextElement.value,
      date: taskDateElement.value,
      status: taskStatusElement.value as "new" | "in progress" | "done",
      tags: taskTagsElement.value.split(",").map((tag) => tag.trim()),
      isDeletedLocally: false,
      isDeletedFromFirebase: false,
    };

    if (saveOption === "local") {
      await this.taskCalendar.saveTaskLocally(task);
    } else if (saveOption === "firebase") {
      await this.taskCalendar.saveTaskInFirebase(task);
    }

    await this.clearForm();
    await this.renderTasks();
  }
}

export default TaskCalendarUI;
