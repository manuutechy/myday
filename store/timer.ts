import { create } from "zustand";

interface TimerStore {
  timeLeft: number; // in seconds
  isRunning: boolean;
  mode: "work" | "break";
  workDuration: number; // in minutes
  breakDuration: number; // in minutes
  sessionsCompleted: number;

  setDurations: (work: number, breakDur: number) => void;
  start: () => void;
  pause: () => void;
  reset: () => void;
  tick: () => void;
  setMode: (mode: "work" | "break") => void;
  incrementSession: () => void;
}

export const useTimerStore = create<TimerStore>((set, get) => ({
  timeLeft: 25 * 60,
  isRunning: false,
  mode: "work",
  workDuration: 25,
  breakDuration: 5,
  sessionsCompleted: 0,

  setDurations: (work, breakDur) => {
    const { mode } = get();
    set({
      workDuration: work,
      breakDuration: breakDur,
      timeLeft: mode === "work" ? work * 60 : breakDur * 60,
    });
  },

  start: () => set({ isRunning: true }),
  pause: () => set({ isRunning: false }),
  
  reset: () => {
    const { mode, workDuration, breakDuration } = get();
    set({
      isRunning: false,
      timeLeft: mode === "work" ? workDuration * 60 : breakDuration * 60,
    });
  },

  tick: () => {
    const { timeLeft, isRunning, mode, workDuration, breakDuration } = get();
    if (!isRunning) return;

    if (timeLeft <= 1) {
      const nextMode = mode === "work" ? "break" : "work";
      const nextTime = (nextMode === "work" ? workDuration : breakDuration) * 60;
      
      // Local client effects
      if (typeof window !== "undefined") {
        if ("vibrate" in navigator) {
          navigator.vibrate([200, 100, 200]);
        }

        // Play sound cue
        const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-500.wav");
        audio.volume = 0.5;
        audio.play().catch(() => {});

        // Send a push notification trigger request
        fetch("/api/push/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: nextMode === "break" ? "Focus session complete! 🎯" : "Break finished! 💻",
            body: nextMode === "break" 
              ? `${workDuration} minutes done. Take a ${breakDuration} min break.` 
              : "Time to dive back into deep work. Let's get shipping!",
          }),
        }).catch((err) => console.error("Error triggering push:", err));
      }

      set({
        mode: nextMode,
        timeLeft: nextTime,
        isRunning: false,
        sessionsCompleted: mode === "work" ? get().sessionsCompleted + 1 : get().sessionsCompleted,
      });
    } else {
      set({ timeLeft: timeLeft - 1 });
    }
  },

  setMode: (mode) => {
    const { workDuration, breakDuration } = get();
    set({
      mode,
      timeLeft: mode === "work" ? workDuration * 60 : breakDuration * 60,
      isRunning: false,
    });
  },

  incrementSession: () => set((state) => ({ sessionsCompleted: state.sessionsCompleted + 1 })),
}));
