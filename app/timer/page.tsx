import PomodoroTimer from "@/components/dashboard/PomodoroTimer";

export default function TimerPage() {
  return (
    <div className="max-w-md mx-auto py-4">
      <h2 className="text-xl font-bold text-textPrimary mb-4 md:hidden">Focus Timer</h2>
      <PomodoroTimer />
    </div>
  );
}
