"use client";

import { useEffect, useState } from "react";
import { Bell, Menu } from "lucide-react";

interface HeaderProps {
  user?: {
    name?: string | null;
    image?: string | null;
  };
}

export default function Header({ user }: HeaderProps) {
  const [greeting, setGreeting] = useState("Good day");
  const [formattedDate, setFormattedDate] = useState("");

  useEffect(() => {
    // Dynamically calculate greeting based on local time
    const updateHeader = () => {
      const hr = new Date().getHours();
      let greet = "Good day";
      if (hr >= 5 && hr < 12) {
        greet = "Good morning";
      } else if (hr >= 12 && hr < 18) {
        greet = "Good afternoon";
      } else if (hr >= 18 && hr < 21) {
        greet = "Good evening";
      } else {
        greet = "Night owl mode 🦉";
      }
      setGreeting(greet);

      // Format current date, e.g., "Sunday, 15 Jun"
      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const months = ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May"];
      const now = new Date();
      const dayName = days[now.getDay()];
      const dateNum = now.getDate();
      const monthName = now.toLocaleString("en-US", { month: "short" });
      setFormattedDate(`${dayName}, ${dateNum} ${monthName}`);
    };

    updateHeader();
    const interval = setInterval(updateHeader, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const displayName = user?.name?.split(" ")[0] || "Manuu";

  return (
    <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b border-customBorder bg-customSurface px-4 md:px-8">
      {/* Dynamic Time-Aware Greeting */}
      <div>
        <h1 className="text-lg font-bold text-textPrimary md:text-xl">
          {greeting}, {displayName} 👋
        </h1>
      </div>

      {/* Date & Icons */}
      <div className="flex items-center gap-4">
        <span className="hidden text-sm font-medium text-textSecondary sm:inline">
          {formattedDate}
        </span>
        
        {/* Offline indicator banner check is handled globally, but here we can show profile or quick status */}
        {user?.image ? (
          <img
            src={user.image}
            alt="Profile"
            className="h-8 w-8 rounded-full border border-customBorder object-cover md:hidden"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-accent/25 text-accent flex items-center justify-center font-bold text-xs md:hidden">
            {displayName[0]}
          </div>
        )}
      </div>
    </header>
  );
}
