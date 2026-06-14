"use client";

import { useEffect, useState } from "react";
import { useTaskStore, Task } from "@/store/tasks";
import { Check, Edit2, Plus, Sparkles } from "lucide-react";

export default function TasksWidget() {
  const { tasks, fetchTasks, addTask, toggleTask, updateTaskTitle, loading } = useTaskStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  
  // Local input state for adding new tasks
  const [newTasksInput, setNewTasksInput] = useState({
    freelance: "",
    product: "",
    wildcard: "",
  });

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Filter tasks created/dated today (in client timezone)
  const getTodayTasks = () => {
    const todayStr = new Date().toDateString();
    return tasks.filter((t) => new Date(t.date).toDateString() === todayStr);
  };

  const todayTasks = getTodayTasks();

  // Find task for each category
  const freelanceTask = todayTasks.find((t) => t.category === "freelance");
  const productTask = todayTasks.find((t) => t.category === "product");
  const wildcardTask = todayTasks.find((t) => t.category === "wildcard");

  // Check if all 3 exist and are complete
  const allCompleted =
    freelanceTask &&
    productTask &&
    wildcardTask &&
    freelanceTask.done &&
    productTask.done &&
    wildcardTask.done;

  const handleAdd = async (category: "freelance" | "product" | "wildcard", title: string) => {
    if (!title.trim()) return;
    await addTask(title.trim(), category);
    setNewTasksInput((prev) => ({ ...prev, [category]: "" }));
  };

  const startEdit = (task: Task) => {
    setEditingId(task.id);
    setEditTitle(task.title);
  };

  const saveEdit = async (id: string) => {
    if (!editTitle.trim()) return;
    await updateTaskTitle(id, editTitle.trim());
    setEditingId(null);
  };

  const renderTaskSlot = (
    category: "freelance" | "product" | "wildcard",
    task?: Task,
    placeholder?: string
  ) => {
    const isEditing = editingId === task?.id;

    const categoryLabels = {
      freelance: { label: "Freelance", bg: "bg-blue-50 text-blue-700 border-blue-200" },
      product: { label: "Product", bg: "bg-indigo-50 text-indigo-700 border-indigo-200" },
      wildcard: { label: "Wildcard", bg: "bg-amber-50 text-amber-700 border-amber-200" },
    };

    const catStyle = categoryLabels[category];

    if (task) {
      return (
        <div className="flex items-center justify-between p-3 border border-customBorder rounded-element hover:bg-customBg group transition-all">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Checkbox */}
            <button
              onClick={() => toggleTask(task.id, !task.done)}
              className={`h-5 w-5 rounded border flex items-center justify-center transition-all shrink-0 ${
                task.done
                  ? "bg-accent border-accent text-white"
                  : "border-customBorder hover:border-accent bg-white"
              }`}
            >
              {task.done && <Check className="h-3.5 w-3.5 stroke-[3]" />}
            </button>

            {/* Title / Inline Edit */}
            {isEditing ? (
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={() => saveEdit(task.id)}
                onKeyDown={(e) => e.key === "Enter" && saveEdit(task.id)}
                className="flex-1 px-2 py-0.5 text-sm border border-accent rounded outline-none bg-white font-medium"
                autoFocus
              />
            ) : (
              <span
                onClick={() => startEdit(task)}
                className={`text-sm font-medium truncate flex-1 cursor-pointer select-none ${
                  task.done ? "text-textSecondary line-through decoration-textSecondary/50" : "text-textPrimary"
                }`}
              >
                {task.title}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 pl-2 shrink-0">
            {/* Category Badge */}
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${catStyle.bg}`}>
              {catStyle.label}
            </span>
            {/* Hover Edit Icon */}
            {!isEditing && (
              <button
                onClick={() => startEdit(task)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:text-accent text-textSecondary transition-all"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      );
    }

    // Empty state slot to add inline
    return (
      <div className="flex items-center justify-between p-3 border border-dashed border-customBorder rounded-element bg-customBg/30 hover:border-accent transition-all">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="h-5 w-5 rounded border border-dashed border-customBorder flex items-center justify-center shrink-0">
            <Plus className="h-3 w-3 text-textSecondary" />
          </div>
          <input
            type="text"
            placeholder={placeholder}
            value={newTasksInput[category]}
            onChange={(e) =>
              setNewTasksInput((prev) => ({ ...prev, [category]: e.target.value }))
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd(category, newTasksInput[category]);
            }}
            className="flex-1 bg-transparent text-sm text-textPrimary placeholder-textSecondary outline-none font-medium border-b border-transparent focus:border-accent/40"
          />
        </div>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border opacity-50 shrink-0 ${catStyle.bg}`}>
          {catStyle.label}
        </span>
      </div>
    );
  };

  return (
    <div className="bg-customSurface rounded-card border border-customBorder p-6 flex flex-col justify-between min-h-[300px]">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-textPrimary text-md flex items-center gap-2">
            Today's 3 Tasks
          </h3>
          {allCompleted && (
            <span className="flex items-center gap-1.5 text-xs text-customSuccess font-semibold animate-bounce">
              <Sparkles className="h-3.5 w-3.5" />
              Shipped. 🔥
            </span>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            <div className="h-[46px] bg-customBg rounded animate-pulse" />
            <div className="h-[46px] bg-customBg rounded animate-pulse" />
            <div className="h-[46px] bg-customBg rounded animate-pulse" />
          </div>
        ) : (
          <div className="space-y-3">
            {renderTaskSlot("freelance", freelanceTask, "Add Freelance block task...")}
            {renderTaskSlot("product", productTask, "Add Product block task...")}
            {renderTaskSlot("wildcard", wildcardTask, "Add Wildcard block task...")}
          </div>
        )}
      </div>

      {/* Empty indicator when absolutely nothing is entered */}
      {!loading && !freelanceTask && !productTask && !wildcardTask && (
        <p className="text-xs text-textSecondary text-center mt-4 italic">
          Tap above to add your 3 tasks for today
        </p>
      )}
    </div>
  );
}
