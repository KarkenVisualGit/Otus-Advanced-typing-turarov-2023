export interface Task {
  id: string;
  text: string;
  date: string;
  status: "new" | "in progress" | "done";
  tags: string[];
  isDeletedLocally: boolean;
  isDeletedFromFirebase: boolean;
}

export interface TaskFilter {
  text?: string;
  date?: string;
  status?: "new" | "in progress" | "done";
  tags?: string[];
}
