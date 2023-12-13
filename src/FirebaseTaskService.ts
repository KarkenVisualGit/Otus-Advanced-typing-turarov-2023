import { Task } from "./TaskCalendar";
import { TaskService } from "./TaskService";

import { initializeApp } from "firebase/app";
import {
  Database,
  getDatabase,
  ref,
  set,
  get,
  remove,
} from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCZsRRy7BwXZOnYz-3BIo-o4WuHl5XKkCE",
  authDomain: "task-calendar-turarov.firebaseapp.com",
  databaseURL:
    "https://task-calendar-turarov-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "task-calendar-turarov",
  storageBucket: "task-calendar-turarov.appspot.com",
  messagingSenderId: "685980356315",
  appId: "1:685980356315:web:b12ef3cf06c0bef5a646fe",
  measurementId: "G-02B3TBFPNX",
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const app = initializeApp(firebaseConfig);
const db: Database = getDatabase();

export class FirebaseTaskService implements TaskService {
  protected deletedFromFirebase: Set<string> = new Set();

  protected idsFromFirebase: Set<string> = new Set();

  public async getTasks(): Promise<Task[]> {
    const reference = ref(db, "todos/");

    try {
      const snapshot = await get(reference);
      if (snapshot.exists()) {
        const tasksData = snapshot.val();
        this.idsFromFirebase.clear();
        return Object.keys(tasksData).map((key) => {
          this.idsFromFirebase.add(key);
          return {
            id: key,
            text: tasksData[key].text,
            date: tasksData[key].date,
            status: tasksData[key].status,
            tags: tasksData[key].tags.split(", "),
            isDeletedLocally: false,
            isDeletedFromFirebase: false,
          };
        });
      }
      return [];
    } catch (error) {
      if (error) {
        console.error(error);
      }
      return [];
    }
  }

  public async deleteTask(taskid: string): Promise<boolean> {
    const reference = ref(db, `todos/${taskid}`);

    try {
      await remove(reference);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  // eslint-disable-next-line class-methods-use-this
  public async saveTask(task: Task): Promise<void> {
    const reference = ref(db, `todos/${task.id}`);

    await set(reference, {
      text: task.text,
      date: task.date,
      status: task.status,
      tags: task.tags.join(", "),
    });
  }
}
