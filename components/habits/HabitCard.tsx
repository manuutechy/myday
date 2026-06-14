"use client";

import { useState } from "react";
import * as Icons from "lucide-react";
import { Check, Flame, Trophy } from "lucide-react";

export interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  streak: number;
  longestStreak: number;
  logs?: any[];
}

interface HabitCardProps {
  habit: Habit;
  onToggleLog: (id: string) => Promise<void>;
}

export default function HabitCard({ habit, onToggleLog }: HabitCardProps) {
  const [loading, setLoading] = useState(false);

  const isCheckedInToday = habit.logs && habit.logs.length > 0;

  const handleToggle = async () => {
    setLoading(true);
    await onToggleLog(habit.id);
    setLoading(false);
  };

  // Dynamically load Lucide icon
  const IconComponent = (Icons as any)[habit.icon] || Icons.Flame;

  return (
    <div
      onClick={handleToggle}
      className={`p-6 bg-white border rounded-card shadow-sm cursor-pointer select-none transition-all flex flex-col justify-between min-h-[160px] ${
        isCheckedInToday
          ? "border-accent bg-accent/5"
          : "border-customBorder hover:border-accent/50"
      } ${loading ? "opacity-50 pointer-events-none" : ""}`}
    >
      {/* Icon & Toggle State */}
      <div className="flex items-start justify-between">
        <div
          className={`h-10 w-10 rounded-element flex items-center justify-center border text-white transition-all shadow-sm`}
          style={{
            backgroundColor: isCheckedInToday ? "#FF6B00" : habit.color,
            borderColor: isCheckedInToday ? "#FF6B00" : habit.color,
          }}
        >
          <IconComponent className="h-5 w-5" />
        </div>

        {/* Checkmark indicator */}
        <div
          className={`h-6 w-6 rounded-full flex items-center justify-center transition-all ${
            isCheckedInToday
              ? "bg-accent text-white"
              : "border border-customBorder bg-customBg"
          }`}
        >
          {isCheckedInToday && <Check className="h-3.5 w-3.5 stroke-[3]" />}
        </div>
      </div>

      {/* Habit Details */}
      <div className="mt-4">
        <h4 className="font-bold text-sm text-textPrimary truncate">{habit.name}</h4>
        
        {/* Streaks */}
        <div className="flex items-center gap-4 mt-3 text-[10px] text-textSecondary font-semibold">
          <span className="flex items-center gap-1">
            <Flame className="h-3.5 w-3.5 text-accent fill-current" />
            Streak: <strong className="text-textPrimary">{habit.streak}d</strong>
          </span>
          <span className="flex items-center gap-1">
            <Trophy className="h-3.5 w-3.5 text-yellow-500 fill-current" />
            Best: <strong className="text-textPrimary">{habit.longestStreak}d</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
