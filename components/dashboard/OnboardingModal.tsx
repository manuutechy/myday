"use client";

import { useState, useEffect } from "react";
import { useTaskStore } from "@/store/tasks";
import { Check, Bell, Clock, FileText, Sparkles } from "lucide-react";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function OnboardingModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [startTime, setStartTime] = useState("07:30");
  const [tasksInput, setTasksInput] = useState({
    freelance: "",
    product: "",
    wildcard: "",
  });
  const [pushEnabled, setPushEnabled] = useState<boolean | null>(null);
  const { addTask } = useTaskStore();

  useEffect(() => {
    // Show modal if not completed previously
    const completed = localStorage.getItem("myday_onboarding_complete");
    if (!completed) {
      setIsOpen(true);
    }
  }, []);

  const handleNext = () => {
    setStep((prev) => prev + 1);
  };

  const handleSaveTasks = async () => {
    if (tasksInput.freelance.trim()) await addTask(tasksInput.freelance.trim(), "freelance");
    if (tasksInput.product.trim()) await addTask(tasksInput.product.trim(), "product");
    if (tasksInput.wildcard.trim()) await addTask(tasksInput.wildcard.trim(), "wildcard");
    handleNext();
  };

  const handleEnableNotifications = async () => {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      alert("Push notifications are not supported in this browser.");
      handleComplete();
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        const registration = await navigator.serviceWorker.ready;
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

        if (!vapidPublicKey) {
          throw new Error("VAPID public key not set in environment.");
        }

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });

        // Send subscription to API
        const res = await fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(subscription),
        });

        if (res.ok) {
          setPushEnabled(true);
        } else {
          setPushEnabled(false);
        }
      } else {
        setPushEnabled(false);
      }
    } catch (error) {
      console.error("Error setting up push notifications:", error);
      setPushEnabled(false);
    }
    
    // Auto proceed shortly after subscribing
    setTimeout(() => {
      handleComplete();
    }, 1500);
  };

  const handleComplete = () => {
    localStorage.setItem("myday_onboarding_complete", "true");
    localStorage.setItem("myday_routine_start", startTime);
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-customSurface rounded-card border border-customBorder overflow-hidden shadow-sm animate-in fade-in zoom-in-95 duration-200">
        <div className="h-2 w-full bg-accent" />
        
        <div className="p-6">
          {/* Step indicators */}
          <div className="flex items-center justify-center gap-3 mb-6">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all duration-300 ${
                  s === step ? "w-8 bg-accent" : "w-2 bg-customBorder"
                }`}
              />
            ))}
          </div>

          {/* STEP 1: Start Time */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center text-accent mx-auto mb-3">
                  <Clock className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-textPrimary">Your Routine Start Time</h3>
                <p className="text-xs text-textSecondary mt-1">
                  Adjust when your daily routine begins. Default is 7:30 AM.
                </p>
              </div>

              <div className="flex items-center justify-center py-4">
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="px-4 py-2 text-xl font-bold border border-customBorder rounded-element outline-none focus:border-accent text-textPrimary bg-white"
                />
              </div>

              <button
                onClick={handleNext}
                className="w-full py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-element transition-colors shadow-sm"
              >
                Confirm Time
              </button>
            </div>
          )}

          {/* STEP 2: Add 3 Tasks */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center text-accent mx-auto mb-3">
                  <FileText className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-textPrimary">Today's 3 Tasks</h3>
                <p className="text-xs text-textSecondary mt-1">
                  Enter one core task for each routine pillar.
                </p>
              </div>

              <div className="space-y-3 py-2">
                <div>
                  <label className="text-[10px] font-bold text-textSecondary uppercase tracking-wider block mb-1">
                    Freelance Task
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Follow up on custom storefront proposal"
                    value={tasksInput.freelance}
                    onChange={(e) =>
                      setTasksInput((prev) => ({ ...prev, freelance: e.target.value }))
                    }
                    className="w-full px-3 py-2 text-sm border border-customBorder rounded-element outline-none focus:border-accent bg-white text-textPrimary font-medium"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-textSecondary uppercase tracking-wider block mb-1">
                    Product Task
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Design webhook verification in Munchify"
                    value={tasksInput.product}
                    onChange={(e) =>
                      setTasksInput((prev) => ({ ...prev, product: e.target.value }))
                    }
                    className="w-full px-3 py-2 text-sm border border-customBorder rounded-element outline-none focus:border-accent bg-white text-textPrimary font-medium"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-textSecondary uppercase tracking-wider block mb-1">
                    Wildcard Task
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Install PWA service worker packages"
                    value={tasksInput.wildcard}
                    onChange={(e) =>
                      setTasksInput((prev) => ({ ...prev, wildcard: e.target.value }))
                    }
                    className="w-full px-3 py-2 text-sm border border-customBorder rounded-element outline-none focus:border-accent bg-white text-textPrimary font-medium"
                  />
                </div>
              </div>

              <button
                onClick={handleSaveTasks}
                className="w-full py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-element transition-colors shadow-sm"
              >
                Save Tasks
              </button>
            </div>
          )}

          {/* STEP 3: Notifications */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center text-accent mx-auto mb-3">
                  <Bell className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-textPrimary">Enable Push Alerts</h3>
                <p className="text-xs text-textSecondary mt-1">
                  Get notified of focus block transitions and Pomodoro timer intervals.
                </p>
              </div>

              <div className="py-4 text-center">
                {pushEnabled === null ? (
                  <p className="text-xs text-textSecondary">
                    We require permission to send push notifications.
                  </p>
                ) : pushEnabled ? (
                  <span className="flex items-center justify-center gap-1.5 text-sm text-customSuccess font-semibold">
                    <Check className="h-4 w-4" />
                    Subscribed successfully!
                  </span>
                ) : (
                  <span className="text-sm text-red-500 font-semibold">
                    Notification permission denied or blocked.
                  </span>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleComplete}
                  className="flex-1 py-2.5 border border-customBorder hover:bg-customBg text-textSecondary text-sm font-semibold rounded-element transition-colors"
                >
                  Skip
                </button>
                <button
                  onClick={handleEnableNotifications}
                  className="flex-1 py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-element transition-colors shadow-sm"
                >
                  Enable Notifications
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
