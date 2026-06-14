"use client";

import { useEffect, useState } from "react";
import { useTaskStore, Task } from "@/store/tasks";
import { Trash, Check, Plus, Calendar, Filter, Archive } from "lucide-react";

export default function TasksPage() {
  const { tasks, fetchTasks, addTask, toggleTask, deleteTask, loading } = useTaskStore();
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<"freelance" | "product" | "wildcard">("freelance");
  const [filter, setFilter] = useState<"all" | "freelance" | "product" | "wildcard">("all");

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await addTask(newTitle.trim(), newCategory);
    setNewTitle("");
  };

  // Filter tasks based on category tab
  const filteredTasks = tasks.filter((t) => filter === "all" || t.category === filter);

  // Split tasks into active and completed
  const activeTasks = filteredTasks.filter((t) => !t.done);
  const completedTasks = filteredTasks.filter((t) => t.done);

  // Group active tasks by date (toDateString)
  const groupTasksByDate = (taskList: Task[]) => {
    const groups: { [key: string]: Task[] } = {};
    taskList.forEach((t) => {
      const dateStr = new Date(t.date).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
      if (!groups[dateStr]) groups[dateStr] = [];
      groups[dateStr].push(t);
    });
    return groups;
  };

  const groupedActiveTasks = groupTasksByDate(activeTasks);

  const categoryBadges = {
    freelance: "bg-blue-50 text-blue-700 border-blue-200",
    product: "bg-indigo-50 text-indigo-700 border-indigo-200",
    wildcard: "bg-amber-50 text-amber-700 border-amber-200",
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-textPrimary">Task Backlog</h2>
        <p className="text-xs text-textSecondary mt-0.5">
          Manage all tasks beyond today's daily 3 priority slots.
        </p>
      </div>

      {/* Task Creation Form */}
      <form onSubmit={handleCreate} className="bg-customSurface rounded-card border border-customBorder p-4 flex flex-col md:flex-row gap-3">
        <input
          type="text"
          placeholder="What needs to be done?"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="flex-1 px-4 py-2 text-sm border border-customBorder rounded-element outline-none focus:border-accent bg-white text-textPrimary font-medium"
          required
        />
        
        <div className="flex gap-3 shrink-0">
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value as any)}
            className="px-3 py-2 text-sm border border-customBorder rounded-element outline-none focus:border-accent bg-white text-textPrimary font-semibold"
          >
            <option value="freelance">Freelance</option>
            <option value="product">Product</option>
            <option value="wildcard">Wildcard</option>
          </select>

          <button
            type="submit"
            className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-element transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Add Task
          </button>
        </div>
      </form>

      {/* Tabs / Filters */}
      <div className="flex bg-customSurface p-1 rounded-card border border-customBorder gap-1 text-xs md:text-sm font-semibold">
        {(["all", "freelance", "product", "wildcard"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`flex-1 py-2 rounded-element capitalize transition-all ${
              filter === tab
                ? "bg-accent text-white shadow-sm"
                : "text-textSecondary hover:text-accent hover:bg-customBg"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tasks List Container */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-12 text-sm text-textSecondary">Loading tasks...</div>
        ) : (
          <>
            {/* Active Tasks Grouped by Date */}
            {activeTasks.length > 0 ? (
              <div className="space-y-6">
                {Object.entries(groupedActiveTasks).map(([dateLabel, group]) => (
                  <div key={dateLabel} className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-textSecondary flex items-center gap-1.5 px-1">
                      <Calendar className="h-3.5 w-3.5 text-accent" />
                      {dateLabel}
                    </h3>
                    <div className="space-y-2">
                      {group.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center justify-between p-3.5 bg-customSurface border border-customBorder rounded-element hover:border-accent/40 group transition-all"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <button
                              onClick={() => toggleTask(task.id, true)}
                              className="h-5 w-5 rounded border border-customBorder flex items-center justify-center hover:border-accent bg-white transition-all shrink-0"
                            >
                              <span className="opacity-0 group-hover:opacity-100"><Check className="h-3 w-3 text-accent stroke-[3]" /></span>
                            </button>
                            <span className="text-sm font-medium text-textPrimary truncate">{task.title}</span>
                          </div>

                          <div className="flex items-center gap-3 shrink-0 pl-2">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase ${categoryBadges[task.category]}`}>
                              {task.category}
                            </span>
                            <button
                              onClick={() => deleteTask(task.id)}
                              className="p-1 text-textSecondary hover:text-red-500 rounded hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <Trash className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-customSurface rounded-card border border-customBorder border-dashed p-10 text-center">
                <div className="h-10 w-10 bg-accent/10 rounded-full flex items-center justify-center text-accent mx-auto mb-3">
                  <Archive className="h-5 w-5" />
                </div>
                <h4 className="text-sm font-bold text-textPrimary">No active tasks</h4>
                <p className="text-xs text-textSecondary mt-1">
                  Everything caught up. Time to schedule new targets.
                </p>
              </div>
            )}

            {/* Completed Tasks List */}
            {completedTasks.length > 0 && (
              <div className="border-t border-customBorder pt-6 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-textSecondary px-1">
                  Completed ({completedTasks.length})
                </h3>
                <div className="space-y-2 opacity-65">
                  {completedTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-3.5 bg-customSurface border border-customBorder rounded-element group hover:border-customBorder transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <button
                          onClick={() => toggleTask(task.id, false)}
                          className="h-5 w-5 rounded border border-accent bg-accent text-white flex items-center justify-center shrink-0"
                        >
                          <Check className="h-3.5 w-3.5 stroke-[3]" />
                        </button>
                        <span className="text-sm font-medium text-textSecondary line-through decoration-textSecondary/50 truncate">
                          {task.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 pl-2">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase ${categoryBadges[task.category]}`}>
                          {task.category}
                        </span>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="p-1 text-textSecondary hover:text-red-500 rounded hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
