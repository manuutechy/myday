"use client";

import { useEffect, useState } from "react";
import { useTimerStore } from "@/store/timer";
import { Settings, Shield, Bell, Globe, Smartphone, LogOut } from "lucide-react";
import { signOut, useSession } from "next-auth/react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const { workDuration, breakDuration, setDurations } = useTimerStore();

  // Local settings states
  const [startTime, setStartTime] = useState("07:30");
  const [pomodoroWork, setPomodoroWork] = useState(25);
  const [pomodoroBreak, setPomodoroBreak] = useState(5);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [blockReminders, setBlockReminders] = useState<string[]>([
    "deep1",
    "deep2",
    "deep3",
  ]);

  useEffect(() => {
    // Load from localStorage if present
    const localStart = localStorage.getItem("myday_routine_start");
    if (localStart) setStartTime(localStart);

    const localWork = localStorage.getItem("myday_pomodoro_work");
    const localBreak = localStorage.getItem("myday_pomodoro_break");
    if (localWork) setPomodoroWork(Number(localWork));
    if (localBreak) setPomodoroBreak(Number(localBreak));

    const complete = localStorage.getItem("myday_onboarding_complete");
    if (complete) {
      // Check if notifications are allowed
      if ("Notification" in window) {
        setPushEnabled(Notification.permission === "granted");
      }
    }
  }, []);

  const handleSaveTimer = () => {
    localStorage.setItem("myday_pomodoro_work", String(pomodoroWork));
    localStorage.setItem("myday_pomodoro_break", String(pomodoroBreak));
    setDurations(pomodoroWork, pomodoroBreak);
    alert("Timer settings saved successfully!");
  };

  const handleSaveRoutine = () => {
    localStorage.setItem("myday_routine_start", startTime);
    alert("Routine settings saved successfully!");
  };

  const handleTogglePush = async () => {
    if (!("Notification" in window)) {
      alert("Push notifications are not supported by your browser.");
      return;
    }

    if (Notification.permission === "denied") {
      alert("Notification permission is blocked. Please reset site permissions in your browser settings.");
      return;
    }

    if (!pushEnabled) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setPushEnabled(true);
        // Save flag in localStorage
        localStorage.setItem("myday_push_notifications", "true");
        alert("Push notifications enabled!");
      }
    } else {
      setPushEnabled(false);
      localStorage.setItem("myday_push_notifications", "false");
      alert("Notifications disabled in settings.");
    }
  };

  const handleToggleReminder = (id: string) => {
    setBlockReminders((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-textPrimary">Configuration Settings</h2>
        <p className="text-xs text-textSecondary mt-0.5">
          Tune Myday routine properties, Pomodoro settings, and API sync details.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Column 1: Routine and Timer */}
        <div className="space-y-6">
          {/* Routine Config */}
          <div className="bg-customSurface rounded-card border border-customBorder p-5 space-y-4">
            <h3 className="font-bold text-sm text-textPrimary flex items-center gap-2">
              <Settings className="h-4.5 w-4.5 text-accent" />
              Routine Config
            </h3>
            
            <div>
              <label className="text-[10px] font-bold text-textSecondary uppercase tracking-wider block mb-1">
                Routine Start Time
              </label>
              <div className="flex gap-3">
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-customBorder rounded-element outline-none focus:border-accent bg-white text-textPrimary font-semibold"
                />
                <button
                  onClick={handleSaveRoutine}
                  className="px-4 py-1.5 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded-element transition-colors shadow-sm"
                >
                  Save Time
                </button>
              </div>
            </div>
          </div>

          {/* Pomodoro Timer Config */}
          <div className="bg-customSurface rounded-card border border-customBorder p-5 space-y-4">
            <h3 className="font-bold text-sm text-textPrimary flex items-center gap-2">
              <Shield className="h-4.5 w-4.5 text-accent" />
              Focus Timer Config
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-textSecondary uppercase tracking-wider block mb-1">
                  Work Duration (min)
                </label>
                <input
                  type="number"
                  value={pomodoroWork}
                  onChange={(e) => setPomodoroWork(Number(e.target.value))}
                  min={5}
                  max={60}
                  className="w-full px-3 py-1.5 text-sm border border-customBorder rounded-element outline-none focus:border-accent bg-white text-textPrimary font-semibold"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-textSecondary uppercase tracking-wider block mb-1">
                  Break Duration (min)
                </label>
                <input
                  type="number"
                  value={pomodoroBreak}
                  onChange={(e) => setPomodoroBreak(Number(e.target.value))}
                  min={1}
                  max={30}
                  className="w-full px-3 py-1.5 text-sm border border-customBorder rounded-element outline-none focus:border-accent bg-white text-textPrimary font-semibold"
                />
              </div>
            </div>

            <button
              onClick={handleSaveTimer}
              className="w-full py-2 bg-accent hover:bg-accent-hover text-white text-xs font-bold rounded-element transition-colors shadow-sm"
            >
              Update Durations
            </button>
          </div>
        </div>

        {/* Column 2: Push Notifications & Account */}
        <div className="space-y-6">
          {/* Notifications config */}
          <div className="bg-customSurface rounded-card border border-customBorder p-5 space-y-4">
            <h3 className="font-bold text-sm text-textPrimary flex items-center gap-2">
              <Bell className="h-4.5 w-4.5 text-accent" />
              Push Notification Toggles
            </h3>

            <div className="flex items-center justify-between pb-3 border-b border-customBorder">
              <div>
                <span className="text-xs font-bold text-textPrimary">Browser Web Push</span>
                <p className="text-[10px] text-textSecondary mt-0.5">Toggle alert status on block transitions.</p>
              </div>
              <button
                onClick={handleTogglePush}
                className={`w-12 h-6 rounded-full flex items-center p-1 transition-all ${
                  pushEnabled ? "bg-accent justify-end" : "bg-customBorder justify-start"
                }`}
              >
                <span className="h-4 w-4 rounded-full bg-white shadow-sm" />
              </button>
            </div>

            {/* Which blocks config */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-textSecondary uppercase tracking-wider block">
                Reminder Blocks
              </span>
              {[
                { id: "deep1", label: "Deep work #1 reminder" },
                { id: "deep2", label: "Deep work #2 reminder" },
                { id: "deep3", label: "Deep work #3 reminder" },
                { id: "client-acq", label: "Client acquisition hour" },
              ].map((item) => {
                const isActive = blockReminders.includes(item.id);
                return (
                  <label key={item.id} className="flex items-center justify-between text-xs cursor-pointer select-none">
                    <span className="text-textPrimary font-medium">{item.label}</span>
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={() => handleToggleReminder(item.id)}
                      className="rounded border-customBorder accent-accent h-4 w-4"
                    />
                  </label>
                );
              })}
            </div>
          </div>

          {/* Account status */}
          <div className="bg-customSurface rounded-card border border-customBorder p-5 space-y-4">
            <h3 className="font-bold text-sm text-textPrimary flex items-center gap-2">
              <Globe className="h-4.5 w-4.5 text-accent" />
              Google Account Sync
            </h3>

            <div className="flex items-center gap-3">
              {session?.user?.image ? (
                <img
                  src={session.user.image}
                  alt="Avatar"
                  className="h-10 w-10 rounded-full border border-customBorder object-cover"
                />
              ) : (
                <div className="h-10 w-10 bg-accent/20 text-accent rounded-full flex items-center justify-center font-bold">
                  M
                </div>
              )}

              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-textPrimary block truncate">
                  {session?.user?.name || "Manuu"}
                </span>
                <span className="text-[10px] text-textSecondary block truncate">
                  {session?.user?.email || "developer@myday.com"}
                </span>
              </div>
            </div>

            <div className="pt-2 flex gap-3 text-xs">
              <button
                onClick={() => {
                  alert("Google Account API sync is handled during session connection. Disconnect mocked.");
                }}
                className="flex-1 py-2 border border-customBorder text-textSecondary font-semibold rounded-element hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all text-center"
              >
                Disconnect API
              </button>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex-1 py-2 bg-accent hover:bg-accent-hover text-white font-bold rounded-element transition-all text-center"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
