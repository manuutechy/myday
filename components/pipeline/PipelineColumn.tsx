"use client";

import LeadCard, { Lead } from "./LeadCard";

interface PipelineColumnProps {
  id: string;
  title: string;
  leads: Lead[];
  onUpdateStatus: (id: string, status: string) => void;
  onDelete: (id: string) => void;
}

export default function PipelineColumn({ id, title, leads, onUpdateStatus, onDelete }: PipelineColumnProps) {
  
  // Custom styling for specific pipeline phases
  const getColumnBg = (columnId: string) => {
    switch (columnId) {
      case "won":
        return "bg-green-50/45 border-green-200/50";
      case "lost":
        return "bg-gray-100/50 border-gray-200/50";
      default:
        return "bg-customBg/50 border-customBorder";
    }
  };

  const getHeaderTextColor = (columnId: string) => {
    switch (columnId) {
      case "won":
        return "text-customSuccess";
      case "lost":
        return "text-textSecondary";
      default:
        return "text-textPrimary";
    }
  };

  return (
    <div className={`flex flex-col min-w-[280px] w-full max-h-[650px] rounded-card border p-4 transition-all ${getColumnBg(id)}`}>
      {/* Column Title and count */}
      <div className="flex items-center justify-between mb-4 px-1 shrink-0">
        <h3 className={`font-bold text-sm uppercase tracking-wider ${getHeaderTextColor(id)}`}>
          {title}
        </h3>
        <span className="text-xs font-bold text-textSecondary bg-white border border-customBorder px-2.5 py-0.5 rounded-full shadow-sm">
          {leads.length}
        </span>
      </div>

      {/* Cards List container */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 pb-4 no-scrollbar">
        {leads.length > 0 ? (
          leads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onUpdateStatus={onUpdateStatus}
              onDelete={onDelete}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-customBorder rounded-element bg-white/20">
            <span className="text-[10px] text-textSecondary font-semibold uppercase tracking-wider">Empty Slot</span>
          </div>
        )}
      </div>
    </div>
  );
}
