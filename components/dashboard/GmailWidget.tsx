"use client";

import { useEffect, useState } from "react";
import { Mail, ExternalLink, Inbox, Loader2 } from "lucide-react";

interface Email {
  id: string;
  sender: string;
  subject: string;
  date: string;
  snippet: string;
}

export default function GmailWidget() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/gmail")
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        // Limit to top 3 as requested in Section 4
        setEmails(data.slice(0, 3));
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const getRelativeDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHrs = Math.floor(diffMins / 60);

      if (diffMins < 60) {
        return `${diffMins}m ago`;
      } else if (diffHrs < 24) {
        return `${diffHrs}h ago`;
      } else {
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      }
    } catch {
      return "";
    }
  };

  return (
    <div className="bg-customSurface rounded-card border border-customBorder p-6 flex flex-col min-h-[300px]">
      {/* Widget Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-textPrimary text-md flex items-center gap-2">
          Gmail Snapshot
        </h3>
        <span className="text-xs text-textSecondary font-medium">Important & Unread</span>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-6 w-6 text-accent animate-spin" />
            <span className="text-xs text-textSecondary mt-2">Checking inbox...</span>
          </div>
        ) : emails.length > 0 ? (
          <div className="space-y-3 flex-1">
            {emails.map((email) => (
              <div
                key={email.id}
                className="p-3 border border-customBorder rounded-element bg-customBg/20 hover:bg-customBg/50 transition-colors flex items-start justify-between gap-3 group"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-bold text-textPrimary truncate">
                      {email.sender}
                    </span>
                    <span className="text-[10px] text-textSecondary font-medium shrink-0">
                      {getRelativeDate(email.date)}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-textPrimary truncate mb-0.5">
                    {email.subject}
                  </h4>
                  <p className="text-[11px] text-textSecondary truncate">
                    {email.snippet}
                  </p>
                </div>

                <a
                  href={`https://mail.google.com/mail/u/0/#inbox/${email.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-textSecondary hover:text-accent hover:bg-white rounded border border-transparent hover:border-customBorder shadow-sm transition-all shrink-0"
                  title="Open in Gmail"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center text-accent mb-3">
              <Inbox className="h-5 w-5" />
            </div>
            <p className="text-sm font-semibold text-textPrimary">Inbox clear. Stay focused.</p>
            <p className="text-[11px] text-textSecondary mt-1">No unread important emails.</p>
          </div>
        )}
      </div>
    </div>
  );
}
