"use client";

import { useEffect, useState } from "react";
import HabitCard, { Habit } from "@/components/habits/HabitCard";
import * as Icons from "lucide-react";

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Form states
  const [habitName, setHabitName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("Flame");
  const [selectedColor, setSelectedColor] = useState("#FF6B00");

  const iconsList = [
    "Flame",
    "SmartphoneOff",
    "Mail",
    "Star",
    "CheckSquare",
    "Moon",
    "Activity",
    "BookOpen",
    "Compass",
    "Heart",
  ];

  const colorsList = [
    { value: "#FF6B00", label: "Orange" },
    { value: "#1D9E75", label: "Success Green" },
    { value: "#534AB7", label: "Deep Purple" },
    { value: "#3C3489", label: "Navy Blue" },
    { value: "#D4537E", label: "Pink" },
    { value: "#BA7517", label: "Brown" },
  ];

  const fetchHabits = async () => {
    try {
      const res = await fetch("/api/habits");
      if (res.ok) {
        const data = await res.json();
        setHabits(data);
      }
    } catch (err) {
      console.error("Error fetching habits:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  const handleToggleLog = async (id: string) => {
    // Optimistic check-in toggle
    const previous = [...habits];
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === id) {
          const isChecked = h.logs && h.logs.length > 0;
          return {
            ...h,
            // Toggle logs list
            logs: isChecked ? [] : [{ id: "temp", date: new Date().toISOString() }],
            // Adjust streak optimistically
            streak: isChecked ? Math.max(0, h.streak - 1) : h.streak + 1,
          };
        }
        return h;
      })
    );

    try {
      const res = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habitId: id }),
      });

      if (!res.ok) throw new Error();
      const result = await res.json();
      
      // Update with exact backend result
      setHabits((prev) =>
        prev.map((h) => (h.id === id ? { ...h, ...result.habit, logs: result.checkedIn ? [{}] : [] } : h))
      );
    } catch {
      // Rollback on failure
      setHabits(previous);
    }
  };

  const handleCreateHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitName.trim()) return;

    try {
      const res = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: habitName.trim(),
          icon: selectedIcon,
          color: selectedColor,
        }),
      });

      if (res.ok) {
        const newHabit = await res.json();
        setHabits((prev) => [...prev, { ...newHabit, logs: [] }]);
        setHabitName("");
        setSelectedIcon("Flame");
        setSelectedColor("#FF6B00");
        setModalOpen(false);
      }
    } catch (err) {
      console.error("Error creating habit:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-textPrimary">Habit Streaks</h2>
          <p className="text-xs text-textSecondary mt-0.5">
            Log routine rituals daily to protect your streaks.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-element transition-colors shadow-sm flex items-center gap-1.5 shrink-0"
        >
          <Icons.Plus className="h-4 w-4" />
          Add Habit
        </button>
      </div>

      {/* Habits Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Icons.Loader2 className="h-8 w-8 text-accent animate-spin" />
          <span className="text-sm text-textSecondary mt-2">Loading habits...</span>
        </div>
      ) : habits.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onToggleLog={handleToggleLog}
            />
          ))}
        </div>
      ) : (
        <div className="bg-customSurface rounded-card border border-customBorder border-dashed p-12 text-center max-w-lg mx-auto">
          <div className="h-10 w-10 bg-accent/10 rounded-full flex items-center justify-center text-accent mx-auto mb-3">
            <Icons.Flame className="h-5 w-5" />
          </div>
          <h4 className="text-sm font-bold text-textPrimary">No habits set</h4>
          <p className="text-xs text-textSecondary mt-1">
            Build habits to frame your day productively.
          </p>
        </div>
      )}

      {/* Add Habit Overlay Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-customSurface rounded-card border border-customBorder overflow-hidden shadow-sm animate-in fade-in zoom-in-95 duration-200">
            <div className="h-2 w-full bg-accent" />

            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-textPrimary flex items-center gap-2">
                  <Icons.Flame className="h-5 w-5 text-accent" />
                  Add Custom Habit
                </h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1 rounded hover:bg-customBg text-textSecondary hover:text-textPrimary transition-all"
                >
                  <Icons.X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateHabit} className="space-y-4">
                {/* Habit name */}
                <div>
                  <label className="text-xs font-bold text-textSecondary uppercase tracking-wider block mb-1">
                    Habit Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Read 10 pages of tech docs"
                    value={habitName}
                    onChange={(e) => setHabitName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-customBorder rounded-element outline-none focus:border-accent bg-white text-textPrimary font-semibold"
                    required
                  />
                </div>

                {/* Icon selection */}
                <div>
                  <label className="text-xs font-bold text-textSecondary uppercase tracking-wider block mb-2">
                    Select Icon
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {iconsList.map((iconName) => {
                      const IconComp = (Icons as any)[iconName] || Icons.Flame;
                      const isSelected = selectedIcon === iconName;
                      return (
                        <button
                          key={iconName}
                          type="button"
                          onClick={() => setSelectedIcon(iconName)}
                          className={`p-2 rounded border flex items-center justify-center transition-all ${
                            isSelected
                              ? "border-accent bg-accent/5 text-accent shadow-sm"
                              : "border-customBorder hover:border-accent text-textSecondary bg-white"
                          }`}
                          title={iconName}
                        >
                          <IconComp className="h-5 w-5" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Color selection */}
                <div>
                  <label className="text-xs font-bold text-textSecondary uppercase tracking-wider block mb-2">
                    Select Accent Color
                  </label>
                  <div className="flex gap-3">
                    {colorsList.map((col) => {
                      const isSelected = selectedColor === col.value;
                      return (
                        <button
                          key={col.value}
                          type="button"
                          onClick={() => setSelectedColor(col.value)}
                          className={`h-8 w-8 rounded-full border transition-all flex items-center justify-center shadow-sm`}
                          style={{ backgroundColor: col.value, borderColor: isSelected ? "#111" : "transparent" }}
                          title={col.label}
                        >
                          {isSelected && <span className="h-2 w-2 rounded-full bg-white animate-pulse" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-element transition-colors shadow-sm"
                >
                  Create Habit
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
