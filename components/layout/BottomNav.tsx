"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CheckSquare,
  Timer,
  Flame,
  Kanban,
} from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: "Home", href: "/dashboard", icon: LayoutDashboard },
    { label: "Tasks", href: "/tasks", icon: CheckSquare },
    { label: "Timer", href: "/timer", icon: Timer },
    { label: "Habits", href: "/habits", icon: Flame },
    { label: "Pipeline", href: "/pipeline", icon: Kanban },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-customBorder bg-customSurface px-2 py-1 md:hidden">
      <div className="flex justify-around items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-element transition-all min-w-[64px] ${
                isActive
                  ? "text-accent font-semibold"
                  : "text-textSecondary hover:text-accent"
              }`}
            >
              <Icon className={`h-5.5 w-5.5 ${isActive ? "text-accent" : "text-textSecondary"}`} />
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
