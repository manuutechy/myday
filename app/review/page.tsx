"use client";

import { useEffect, useState } from "react";
import { Check, ClipboardList, AlertCircle, Calendar, Sparkles, TrendingUp } from "lucide-react";

export default function ReviewPage() {
  const [dailySubmitted, setDailySubmitted] = useState<any>(null);
  const [weeklyStats, setWeeklyStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Daily Form States
  const [completedTasks, setCompletedTasks] = useState("yes");
  const [productiveBlock, setProductiveBlock] = useState("deep1");
  const [outreachDone, setOutreachDone] = useState(false);
  const [hobbyProtected, setHobbyProtected] = useState(false);
  const [differentWord, setDifferentWord] = useState("");

  const isSunday = new Date().getDay() === 0;

  const fetchData = async () => {
    try {
      // 1. Fetch today's review status
      const resDaily = await fetch("/api/review");
      if (resDaily.ok) {
        const dataDaily = await resDaily.json();
        setDailySubmitted(dataDaily);
        if (dataDaily) {
          setCompletedTasks(dataDaily.completedTasks);
          setProductiveBlock(dataDaily.productiveBlock);
          setOutreachDone(dataDaily.outreachDone);
          setHobbyProtected(dataDaily.hobbyProtected);
          setDifferentWord(dataDaily.differentWord);
        }
      }

      // 2. Fetch weekly statistics
      const resWeekly = await fetch("/api/review?weekly=true");
      if (resWeekly.ok) {
        const dataWeekly = await resWeekly.json();
        setWeeklyStats(dataWeekly);
      }
    } catch (err) {
      console.error("Error loading reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          completedTasks,
          productiveBlock,
          outreachDone,
          hobbyProtected,
          differentWord,
        }),
      });

      if (res.ok) {
        const result = await res.json();
        setDailySubmitted(result);
        // Refresh weekly list
        const resWeekly = await fetch("/api/review?weekly=true");
        if (resWeekly.ok) {
          setWeeklyStats(await resWeekly.json());
        }
      }
    } catch (err) {
      console.error("Error submitting review:", err);
    }
  };

  const getProductiveBlockLabel = (blockId: string) => {
    const blocks: { [key: string]: string } = {
      deep1: "Deep Work #1 (10:00 AM - 12:30 PM)",
      deep2: "Deep Work #2 (01:30 PM - 04:00 PM)",
      deep3: "Deep Work #3 ⭐ (09:00 PM - 11:30 PM)",
    };
    return blocks[blockId] || blockId;
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-textPrimary">Daily & Weekly Reflection</h2>
        <p className="text-xs text-textSecondary mt-0.5">
          Evaluate your routine alignment, project momentum, and plan for tomorrow.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Daily Review Prompt */}
        <div className="lg:col-span-2 space-y-6">
          {loading ? (
            <div className="text-center py-12 text-sm text-textSecondary">Loading review details...</div>
          ) : dailySubmitted ? (
            // Daily Review Complete State
            <div className="bg-customSurface rounded-card border border-customBorder p-6 space-y-4">
              <div className="flex items-center gap-2 text-customSuccess font-bold text-md">
                <Check className="h-5 w-5 bg-customSuccess/10 rounded-full p-0.5" />
                <span>Reflection Logged for Today</span>
              </div>
              <p className="text-xs text-textSecondary">
                Your entries have been saved. Review your productivity summary for today:
              </p>

              <div className="border-t border-customBorder pt-4 space-y-3">
                <div>
                  <span className="text-[10px] font-bold text-textSecondary uppercase block">Daily 3 Tasks Completed:</span>
                  <span className="text-sm font-semibold capitalize text-textPrimary">{dailySubmitted.completedTasks}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-textSecondary uppercase block">Most Productive focus:</span>
                  <span className="text-sm font-semibold text-textPrimary">
                    {getProductiveBlockLabel(dailySubmitted.productiveBlock)}
                  </span>
                </div>
                <div className="flex gap-6">
                  <div>
                    <span className="text-[10px] font-bold text-textSecondary uppercase block">Outreach Completed:</span>
                    <span className="text-sm font-semibold text-textPrimary">{dailySubmitted.outreachDone ? "Yes" : "No"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-textSecondary uppercase block">Hobby Slot Protected:</span>
                    <span className="text-sm font-semibold text-textPrimary">{dailySubmitted.hobbyProtected ? "Yes" : "No"}</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-textSecondary uppercase block">Action for Tomorrow:</span>
                  <p className="text-xs text-textPrimary italic mt-0.5 bg-customBg p-3 rounded-element border border-customBorder">
                    "{dailySubmitted.differentWord}"
                  </p>
                </div>
              </div>

              <button
                onClick={() => setDailySubmitted(null)}
                className="mt-4 text-xs font-semibold text-accent hover:text-accent-hover transition-colors"
              >
                Edit Reflection
              </button>
            </div>
          ) : (
            // Daily Review Form
            <form onSubmit={handleSubmit} className="bg-customSurface rounded-card border border-customBorder p-6 space-y-6">
              <h3 className="font-bold text-md text-textPrimary flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-accent" />
                Daily Reflection Form
              </h3>

              <div className="space-y-4">
                {/* Q1: Daily 3 Tasks */}
                <div>
                  <label className="text-xs font-bold text-textSecondary uppercase tracking-wider block mb-2">
                    1. Did you complete your 3 daily tasks?
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["yes", "partial", "no"].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setCompletedTasks(opt)}
                        className={`py-2 text-xs font-semibold rounded-element border capitalize transition-all ${
                          completedTasks === opt
                            ? "bg-accent border-accent text-white shadow-sm"
                            : "border-customBorder bg-white text-textSecondary hover:border-accent hover:text-accent"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Q2: Deep Work Block */}
                <div>
                  <label className="text-xs font-bold text-textSecondary uppercase tracking-wider block mb-2">
                    2. Which deep work block was most productive?
                  </label>
                  <select
                    value={productiveBlock}
                    onChange={(e) => setProductiveBlock(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-customBorder rounded-element outline-none focus:border-accent bg-white text-textPrimary font-semibold"
                  >
                    <option value="deep1">Deep work #1 (10:00 AM - 12:30 PM)</option>
                    <option value="deep2">Deep work #2 (01:30 PM - 04:00 PM)</option>
                    <option value="deep3">Deep work #3 ⭐ (09:00 PM - 11:30 PM)</option>
                  </select>
                </div>

                {/* Q3 & Q4: Toggles */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-textSecondary uppercase tracking-wider block mb-2">
                      3. Client Outreach?
                    </label>
                    <div className="flex bg-customBg p-1 rounded-element gap-1 border border-customBorder text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() => setOutreachDone(true)}
                        className={`flex-1 py-1.5 rounded-element transition-all ${
                          outreachDone ? "bg-accent text-white shadow-sm" : "text-textSecondary"
                        }`}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => setOutreachDone(false)}
                        className={`flex-1 py-1.5 rounded-element transition-all ${
                          !outreachDone ? "bg-accent text-white shadow-sm" : "text-textSecondary"
                        }`}
                      >
                        No
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-textSecondary uppercase tracking-wider block mb-2">
                      4. Protect Hobby Slot?
                    </label>
                    <div className="flex bg-customBg p-1 rounded-element gap-1 border border-customBorder text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() => setHobbyProtected(true)}
                        className={`flex-1 py-1.5 rounded-element transition-all ${
                          hobbyProtected ? "bg-accent text-white shadow-sm" : "text-textSecondary"
                        }`}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => setHobbyProtected(false)}
                        className={`flex-1 py-1.5 rounded-element transition-all ${
                          !hobbyProtected ? "bg-accent text-white shadow-sm" : "text-textSecondary"
                        }`}
                      >
                        No
                      </button>
                    </div>
                  </div>
                </div>

                {/* Q5: Different word */}
                <div>
                  <label className="text-xs font-bold text-textSecondary uppercase tracking-wider block mb-2">
                    5. One thing you will do differently tomorrow?
                  </label>
                  <textarea
                    placeholder="Reflect on today and note down a clear adjustment..."
                    value={differentWord}
                    onChange={(e) => setDifferentWord(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-customBorder rounded-element outline-none focus:border-accent bg-white text-textPrimary font-medium"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-bold rounded-element transition-colors shadow-sm"
              >
                Log Reflection
              </button>
            </form>
          )}
        </div>

        {/* Right 1 Column: Weekly Review Summary */}
        <div className="space-y-6">
          {/* Sunday celebration trigger indicator */}
          {isSunday && (
            <div className="bg-accent/10 border border-accent/30 rounded-card p-4 flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-accent shrink-0 mt-0.5 animate-pulse" />
              <div>
                <h4 className="font-bold text-xs text-accent uppercase tracking-wider">Weekly Review Active</h4>
                <p className="text-[11px] text-textSecondary mt-0.5 leading-normal">
                  It's Sunday. Review the weekly pipeline adjustments and habit tracking stats below.
                </p>
              </div>
            </div>
          )}

          {/* Weekly stats card */}
          <div className="bg-customSurface rounded-card border border-customBorder p-5 space-y-5">
            <h3 className="font-bold text-sm text-textPrimary flex items-center gap-2">
              <TrendingUp className="h-4.5 w-4.5 text-accent" />
              Weekly Summary
            </h3>

            {!loading && weeklyStats ? (
              <div className="space-y-4 text-xs">
                {/* Task Stats */}
                <div className="flex justify-between items-center pb-2 border-b border-customBorder">
                  <span className="text-textSecondary font-medium">Tasks Completed:</span>
                  <span className="font-bold text-textPrimary">
                    {weeklyStats.tasksCompleted}/{weeklyStats.tasksCreated} tasks
                  </span>
                </div>

                {/* Habit Stats */}
                <div className="flex justify-between items-center pb-2 border-b border-customBorder">
                  <span className="text-textSecondary font-medium">Habit Log Taps:</span>
                  <span className="font-bold text-textPrimary">
                    {weeklyStats.habitLogsCount} times
                  </span>
                </div>

                {/* Pipeline Stats */}
                <div className="flex justify-between items-center pb-2 border-b border-customBorder">
                  <span className="text-textSecondary font-medium">Opportunities Won:</span>
                  <span className="font-bold text-customSuccess">{weeklyStats.leadsWon} leads</span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-customBorder">
                  <span className="text-textSecondary font-medium">Opportunities Lost:</span>
                  <span className="font-bold text-textSecondary">{weeklyStats.leadsLost} leads</span>
                </div>

                {/* Recent entries */}
                <div className="pt-2">
                  <span className="text-[10px] font-bold text-textSecondary uppercase tracking-wider block mb-2">
                    Recent Reflection Logs
                  </span>
                  {weeklyStats.pastReviews && weeklyStats.pastReviews.length > 0 ? (
                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                      {weeklyStats.pastReviews.map((rev: any) => (
                        <div key={rev.id} className="p-2 border border-customBorder rounded bg-customBg/30">
                          <div className="flex items-center justify-between text-[9px] text-textSecondary font-semibold">
                            <span>{new Date(rev.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                            <span className="capitalize">Tasks: {rev.completedTasks}</span>
                          </div>
                          <p className="text-[10px] text-textPrimary italic mt-1 font-medium truncate">
                            "{rev.differentWord}"
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[10px] text-textSecondary italic block">No entries logged this week.</span>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-textSecondary">Loading summary stats...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
