"use client";

import { useState } from "react";
import { Mail, Calendar, Trash2, ArrowRight, CheckCircle2, XCircle } from "lucide-react";

export interface Lead {
  id: string;
  name: string;
  business: string;
  channel: "DM" | "email" | "referral" | "inbound" | string;
  status: "outreach" | "replied" | "proposal" | "negotiating" | "won" | "lost" | string;
  notes: string | null;
  followUpAt: string | null;
  createdAt: string;
}

interface LeadCardProps {
  lead: Lead;
  onUpdateStatus: (id: string, status: string) => void;
  onDelete: (id: string) => void;
}

export default function LeadCard({ lead, onUpdateStatus, onDelete }: LeadCardProps) {
  const [loading, setLoading] = useState(false);

  const getChannelStyle = (channel: string) => {
    switch (channel) {
      case "email":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "DM":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "referral":
        return "bg-purple-50 text-purple-700 border-purple-200";
      default:
        return "bg-teal-50 text-teal-700 border-teal-200";
    }
  };

  const isFollowUpDue = () => {
    if (!lead.followUpAt || lead.status === "won" || lead.status === "lost") return false;
    return new Date(lead.followUpAt) < new Date();
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const handleStatusChange = async (newStatus: string) => {
    setLoading(true);
    await onUpdateStatus(lead.id, newStatus);
    setLoading(false);
  };

  const statuses = [
    { value: "outreach", label: "Outreach" },
    { value: "replied", label: "Replied" },
    { value: "proposal", label: "Proposal Sent" },
    { value: "negotiating", label: "Negotiating" },
    { value: "won", label: "Won" },
    { value: "lost", label: "Lost" },
  ];

  return (
    <div className={`p-4 bg-white border rounded-element shadow-sm space-y-3 transition-all relative ${
      isFollowUpDue() ? "border-red-300 bg-red-50/10" : "border-customBorder hover:border-textSecondary/30"
    } ${loading ? "opacity-50 pointer-events-none" : ""}`}>
      {/* Lead details */}
      <div>
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-bold text-sm text-textPrimary truncate">{lead.business}</h4>
          
          <button
            onClick={() => onDelete(lead.id)}
            className="text-textSecondary hover:text-red-500 p-0.5 rounded transition-all"
            title="Delete Lead"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="text-xs text-textSecondary font-medium mt-0.5">{lead.name}</p>
      </div>

      {/* Tags and badges */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase ${getChannelStyle(lead.channel)}`}>
          {lead.channel}
        </span>

        {isFollowUpDue() && (
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
            Follow up due
          </span>
        )}
      </div>

      {/* Notes */}
      {lead.notes && (
        <p className="text-xs text-textSecondary leading-normal line-clamp-2 italic bg-customBg/40 p-2 rounded-element">
          {lead.notes}
        </p>
      )}

      {/* Dates & Status flow */}
      <div className="flex items-center justify-between border-t border-customBorder pt-3 mt-1 text-[10px] text-textSecondary font-semibold">
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {lead.followUpAt ? `Follow up: ${formatDate(lead.followUpAt)}` : `Added: ${formatDate(lead.createdAt)}`}
        </span>

        {/* Change status dropdown */}
        <select
          value={lead.status}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="bg-transparent hover:text-accent font-semibold cursor-pointer outline-none max-w-[100px] text-right"
        >
          {statuses.map((st) => (
            <option key={st.value} value={st.value}>
              {st.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
