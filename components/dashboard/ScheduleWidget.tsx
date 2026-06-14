"use client";

import { useEffect, useState } from "react";
import { ROUTINE_BLOCKS, toMinutes, getCurrentBlock } from "@/lib/routine";
import * as Icons from "lucide-react";

interface CalendarEvent {
  id: string;
  summary: string;
  start: string;
  end: string;
  htmlLink?: string;
}

export default function ScheduleWidget() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMinutes, setCurrentMinutes] = useState(0);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentMinutes(now.getHours() * 60 + now.getMinutes());
    };
    updateTime();
    const interval = setInterval(updateTime, 30000); // Update every 30s

    fetch("/api/calendar")
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        setEvents(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });

    return () => clearInterval(interval);
  }, []);

  const formatEventTime = (isoString: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  return (
    <div className="bg-customSurface rounded-card border border-customBorder p-6 flex flex-col min-h-[400px]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-textPrimary text-md flex items-center gap-2">
          Today's Schedule
        </h3>
        <span className="text-xs text-textSecondary font-medium">Google Calendar Synced</span>
      </div>

      {/* Vertical Timeline Wrapper */}
      <div className="flex-1 overflow-y-auto max-h-[500px] pr-2 space-y-3 scrollbar-thin">
        {ROUTINE_BLOCKS.map((block) => {
          const startMin = toMinutes(block.start);
          const endMin = block.end === "00:00" ? 1440 : toMinutes(block.end);
          
          let status: "past" | "current" | "future" = "future";
          if (currentMinutes >= startMin && currentMinutes < endMin) {
            status = "current";
          } else if (currentMinutes >= endMin) {
            status = "past";
          }

          // Filter Google Calendar events that fall into this block
          const blockEvents = events.filter((ev) => {
            const evStart = new Date(ev.start);
            const evEnd = new Date(ev.end);
            const evStartMin = evStart.getHours() * 60 + evStart.getMinutes();
            const evEndMin = evEnd.getHours() * 60 + evEnd.getMinutes();
            return evStartMin < endMin && evEndMin > startMin;
          });

          const IconComponent = (Icons as any)[block.icon] || Icons.Activity;

          return (
            <div
              key={block.id}
              className={`flex items-start gap-4 p-3 rounded-element transition-all border ${
                status === "current"
                  ? "bg-accent/5 border-accent shadow-sm"
                  : status === "past"
                  ? "opacity-50 bg-customBg/40 border-customBorder"
                  : "bg-customSurface border-customBorder hover:border-textSecondary/20"
              }`}
            >
              {/* Timing */}
              <div className="w-14 text-xs font-mono font-medium text-textSecondary shrink-0 pt-0.5">
                {block.start}
              </div>

              {/* Block Accent Dot & Icon */}
              <div className="flex flex-col items-center justify-center shrink-0">
                <div
                  className="h-7 w-7 rounded-full flex items-center justify-center border text-white transition-all shadow-sm"
                  style={{ backgroundColor: status === "past" ? "#9CA3AF" : block.color, borderColor: block.color }}
                >
                  <IconComponent className="h-4 w-4" />
                </div>
              </div>

              {/* Description & Nested Calendar Events */}
              <div className="flex-1 min-w-0">
                <h4
                  className={`text-sm font-semibold truncate ${
                    status === "current"
                      ? "text-accent"
                      : "text-textPrimary"
                  }`}
                >
                  {block.label}
                </h4>
                <p className="text-xs text-textSecondary font-medium mt-0.5">
                  {block.start} - {block.end}
                </p>

                {/* Calendar Events Injected */}
                {blockEvents.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {blockEvents.map((ev) => (
                      <a
                        key={ev.id}
                        href={ev.htmlLink || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-2 text-xs rounded border border-accent/40 bg-white hover:bg-accent/5 transition-all"
                      >
                        <div className="flex items-center gap-1.5 font-medium text-accent">
                          <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent animate-ping" />
                          <span className="truncate">{ev.summary}</span>
                        </div>
                        <span className="text-[10px] text-textSecondary ml-3">
                          {formatEventTime(ev.start)} - {formatEventTime(ev.end)}
                        </span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
