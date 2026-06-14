"use client";

import { useEffect, useState } from "react";
import { getCurrentBlock } from "@/lib/routine";
import * as Icons from "lucide-react";
import Link from "next/link";

export default function CurrentBlock() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const update = () => {
      setData(getCurrentBlock());
    };
    update();
    const interval = setInterval(update, 1000); // Update every second for precise countdown
    return () => clearInterval(interval);
  }, []);

  if (!data) {
    return (
      <div className="bg-customSurface rounded-card border border-customBorder p-6 border-l-4 border-l-accent min-h-[160px] animate-pulse">
        <div className="h-4 w-1/4 bg-customBg rounded mb-4"></div>
        <div className="h-8 w-1/2 bg-customBg rounded"></div>
      </div>
    );
  }

  const { activeBlock, progressPercent, minutesRemaining, nextBlock } = data;

  // Dynamically load the Lucide icon from string name
  const IconComponent = (Icons as any)[activeBlock.icon] || Icons.Activity;

  const isDeepWork = activeBlock.id.startsWith("deep");

  return (
    <div className="bg-customSurface rounded-card border border-customBorder p-6 border-l-4 border-l-accent flex flex-col md:flex-row md:items-center justify-between gap-6">
      {/* Block Information */}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2 text-xs font-semibold uppercase tracking-wider text-textSecondary">
          <IconComponent className="h-4 w-4 text-accent" />
          <span>Active Block • {activeBlock.start} - {activeBlock.end}</span>
        </div>
        <h2 className="text-2xl font-bold text-textPrimary mb-1">
          {activeBlock.label}
        </h2>
        <p className="text-sm text-textSecondary">
          {minutesRemaining <= 0
            ? "Wrapping up..."
            : `${minutesRemaining} ${minutesRemaining === 1 ? "minute" : "minutes"} remaining`}
        </p>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-customBg rounded-full mt-4 overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-1000 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Action / Next Block */}
      <div className="flex flex-col justify-end items-start md:items-end gap-2 shrink-0 min-w-[200px]">
        {isDeepWork ? (
          <Link
            href="/timer"
            className="px-4 py-2 bg-accent text-white rounded-element text-sm font-semibold hover:bg-accent-hover transition-colors shadow-sm inline-flex items-center gap-2"
          >
            <Icons.Play className="h-4 w-4 fill-current" />
            Start Pomodoro
          </Link>
        ) : (
          <div className="text-xs text-textSecondary md:text-right">
            <span>Next block:</span>
            <div className="font-semibold text-textPrimary text-sm mt-0.5 flex items-center gap-1.5 justify-start md:justify-end">
              {nextBlock.label}
            </div>
            <div className="text-[10px] text-textSecondary font-medium">
              starts in {minutesRemaining} min
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
