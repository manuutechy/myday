import { create } from "zustand";

export interface Task {
  id: string;
  title: string;
  category: "freelance" | "product" | "wildcard";
  done: boolean;
  date: Date;
}

interface TaskStore {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  fetchTasks: () => Promise<void>;
  addTask: (title: string, category: "freelance" | "product" | "wildcard") => Promise<void>;
  toggleTask: (id: string, done: boolean) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  updateTaskTitle: (id: string, title: string) => Promise<void>;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  loading: false,
  error: null,

  fetchTasks: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch("/api/tasks");
      if (!res.ok) throw new Error("Failed to load tasks");
      const data = await res.json();
      set({ tasks: data, loading: false });
    } catch (err: any) {
      set({ error: err.message || "Failed to load tasks", loading: false });
    }
  },

  addTask: async (title, category) => {
    set({ error: null });
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, category }),
      });
      if (!res.ok) throw new Error("Failed to create task");
      const newTask = await res.json();
      set({ tasks: [newTask, ...get().tasks] });
    } catch (err: any) {
      set({ error: err.message || "Failed to create task" });
    }
  },

  toggleTask: async (id, done) => {
    const previousTasks = get().tasks;
    // Optimistic UI update
    set({
      tasks: previousTasks.map((t) => (t.id === id ? { ...t, done } : t)),
      error: null,
    });

    try {
      const res = await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, done }),
      });
      if (!res.ok) throw new Error("Failed to update task");
    } catch (err: any) {
      // Rollback on failure
      set({ tasks: previousTasks, error: err.message || "Failed to update task" });
    }
  },

  deleteTask: async (id) => {
    const previousTasks = get().tasks;
    // Optimistic UI update
    set({
      tasks: previousTasks.filter((t) => t.id !== id),
      error: null,
    });

    try {
      const res = await fetch(`/api/tasks?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete task");
    } catch (err: any) {
      // Rollback on failure
      set({ tasks: previousTasks, error: err.message || "Failed to delete task" });
    }
  },

  updateTaskTitle: async (id, title) => {
    const previousTasks = get().tasks;
    set({
      tasks: previousTasks.map((t) => (t.id === id ? { ...t, title } : t)),
      error: null,
    });

    try {
      const res = await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, title }),
      });
      if (!res.ok) throw new Error("Failed to update task name");
    } catch (err: any) {
      set({ tasks: previousTasks, error: err.message || "Failed to update task name" });
    }
  },
}));
