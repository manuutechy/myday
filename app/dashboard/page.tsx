import CurrentBlock from "@/components/dashboard/CurrentBlock";
import TasksWidget from "@/components/dashboard/TasksWidget";
import ScheduleWidget from "@/components/dashboard/ScheduleWidget";
import GmailWidget from "@/components/dashboard/GmailWidget";
import OnboardingModal from "@/components/dashboard/OnboardingModal";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Onboarding Wizard for new sessions */}
      <OnboardingModal />

      {/* Section 1: Current Active block */}
      <CurrentBlock />

      {/* Grid: Tasks & Schedule Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TasksWidget />
        <ScheduleWidget />
      </div>

      {/* Grid: Gmail snapshot & Profile routine details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GmailWidget />

        {/* Command center quick info card */}
        <div className="bg-customSurface rounded-card border border-customBorder p-6 flex flex-col justify-between min-h-[300px]">
          <div>
            <h3 className="font-bold text-textPrimary text-md mb-2">Myday Command Center</h3>
            <p className="text-xs text-textSecondary leading-relaxed">
              A private workspace designed for Manuu. Maintain your deep work slots, follow up on Munchify, Nuru, and Plottwear pipelines, and maintain your routine streaks.
            </p>
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-2.5 text-xs text-textPrimary font-semibold">
                <span className="h-2 w-2 rounded-full bg-accent" />
                Nairobi, Kenya Local Time (GMT+3)
              </div>
              <div className="flex items-center gap-2.5 text-xs text-textPrimary font-semibold">
                <span className="h-2 w-2 rounded-full bg-customSuccess" />
                Night-owl routine: Wake 7:30 AM • Sleep 12:30 AM
              </div>
            </div>
          </div>
          
          <div className="border-t border-customBorder pt-4 mt-6 text-[10px] text-textSecondary font-semibold flex items-center justify-between">
            <span>Version 1.0.0 (PWA Ready)</span>
            <span>Local Database Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
