"use client";

import { useEffect } from "react";
import { useTimerStore } from "@/store/timer";
import { Play, Pause, RotateCcw, Award } from "lucide-react";

export default function PomodoroTimer() {
  const {
    timeLeft,
    isRunning,
    mode,
    workDuration,
    breakDuration,
    sessionsCompleted,
    start,
    pause,
    reset,
    tick,
    setMode,
  } = useTimerStore();

  // Run countdown ticks
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        tick();
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, tick]);

  // Format time (e.g. 1500 sec -> "25:00")
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Compute percentage for progress bar
  const totalSeconds = (mode === "work" ? workDuration : breakDuration) * 60;
  const progressPercent = Math.min(100, Math.max(0, ((totalSeconds - timeLeft) / totalSeconds) * 100));

  return (
    <div className="bg-customSurface rounded-card border border-customBorder p-6 flex flex-col items-center justify-between min-h-[300px]">
      {/* Header and Modes */}
      <div className="w-full flex items-center justify-between mb-4">
        <h3 className="font-bold text-textPrimary text-md flex items-center gap-2">
          Focus Timer
        </h3>
        
        {/* Mode Selector */}
        <div className="flex bg-customBg p-1 rounded-element gap-1 text-xs">
          <button
            onClick={() => setMode("work")}
            className={`px-3 py-1 rounded-element font-medium transition-colors ${
              mode === "work"
                ? "bg-accent text-white shadow-sm"
                : "text-textSecondary hover:text-accent"
            }`}
          >
            Deep Work
          </button>
          <button
            onClick={() => setMode("break")}
            className={`px-3 py-1 rounded-element font-medium transition-colors ${
              mode === "break"
                ? "bg-accent text-white shadow-sm"
                : "text-textSecondary hover:text-accent"
            }`}
          >
            Break
          </button>
        </div>
      </div>

      {/* Timer Display */}
      <div className="flex flex-col items-center justify-center py-6 w-full relative">
        <div className="text-5xl font-bold font-mono tracking-tight text-textPrimary mb-1">
          {formatTime(timeLeft)}
        </div>
        <div className="text-xs text-textSecondary font-medium uppercase tracking-wider mb-4">
          {mode === "work" ? "Stay focused" : "Take a breath"}
        </div>
        
        {/* Simple Progress Bar */}
        <div className="w-full max-w-[200px] h-1.5 bg-customBg rounded-full overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 w-full justify-center">
        {isRunning ? (
          <button
            onClick={pause}
            className="flex items-center justify-center h-12 w-12 rounded-full border border-customBorder bg-customSurface text-textPrimary hover:text-accent hover:border-accent transition-colors"
          >
            <Pause className="h-5 w-5" />
          </button>
        ) : (
          <button
            onClick={start}
            className="flex items-center justify-center h-12 w-12 rounded-full bg-accent text-white hover:bg-accent-hover transition-colors"
          >
            <Play className="h-5 w-5 fill-current ml-0.5" />
          </button>
        )}
        <button
          onClick={reset}
          className="flex items-center justify-center h-10 w-10 rounded-full border border-customBorder bg-customSurface text-textSecondary hover:text-textPrimary hover:border-textSecondary transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      {/* Session tracker info */}
      <div className="w-full border-t border-customBorder mt-6 pt-4 flex items-center justify-center gap-2 text-xs text-textSecondary">
        <Award className="h-4 w-4 text-accent" />
        <span>Completed today: <strong className="text-textPrimary">{sessionsCompleted} sessions</strong></span>
      </div>
    </div>
  );
}
