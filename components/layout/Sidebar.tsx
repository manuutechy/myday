"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  CheckSquare,
  Kanban,
  Flame,
  ClipboardList,
  Settings,
  LogOut,
} from "lucide-react";

interface SidebarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Tasks", href: "/tasks", icon: CheckSquare },
    { label: "Pipeline", href: "/pipeline", icon: Kanban },
    { label: "Habits", href: "/habits", icon: Flame },
    { label: "Review", href: "/review", icon: ClipboardList },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-customBorder bg-customSurface md:flex md:flex-col">
      {/* App Logo & Name */}
      <div className="flex h-16 items-center px-6 border-b border-customBorder">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-element bg-accent text-white font-bold text-lg">
            M
          </div>
          <span className="text-xl font-bold tracking-tight text-textPrimary">Myday</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 px-4 py-6">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-element text-sm font-medium transition-all ${
                isActive
                  ? "bg-accent/10 text-accent font-semibold"
                  : "text-textSecondary hover:bg-customBg hover:text-accent"
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? "text-accent" : "text-textSecondary group-hover:text-accent"}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Profile Section */}
      <div className="border-t border-customBorder p-4 flex flex-col gap-4 bg-customSurface">
        <div className="flex items-center gap-3">
          {user?.image ? (
            <img
              src={user.image}
              alt={user.name || "User"}
              className="h-10 w-10 rounded-full border border-customBorder object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold">
              {user?.name?.[0] || "M"}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-textPrimary truncate">{user?.name || "Manuu"}</p>
            <p className="text-xs text-textSecondary truncate">{user?.email || "developer@myday.com"}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center justify-center gap-2 w-full py-2 px-3 border border-customBorder rounded-element text-sm text-textSecondary font-medium hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
