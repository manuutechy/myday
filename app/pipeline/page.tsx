"use client";

import { useEffect, useState } from "react";
import PipelineColumn from "@/components/pipeline/PipelineColumn";
import { Lead } from "@/components/pipeline/LeadCard";
import { Plus, X, Kanban, Loader2 } from "lucide-react";

export default function PipelinePage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Add lead form inputs
  const [formInput, setFormInput] = useState({
    business: "",
    name: "",
    channel: "DM",
    notes: "",
    followUpAt: "",
  });

  const fetchLeads = async () => {
    try {
      const res = await fetch("/api/pipeline");
      if (res.ok) {
        const data = await res.json();
        setLeads(data);
      }
    } catch (err) {
      console.error("Error loading leads:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formInput.business.trim() || !formInput.name.trim()) return;

    try {
      const res = await fetch("/api/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formInput,
          status: "outreach", // Default start status
        }),
      });

      if (res.ok) {
        const newLead = await res.json();
        setLeads((prev) => [newLead, ...prev]);
        setFormInput({
          business: "",
          name: "",
          channel: "DM",
          notes: "",
          followUpAt: "",
        });
        setModalOpen(false);
      }
    } catch (err) {
      console.error("Error creating lead:", err);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    // Optimistic update
    const previous = [...leads];
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l))
    );

    try {
      const res = await fetch("/api/pipeline", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (!res.ok) throw new Error();
    } catch {
      // Rollback
      setLeads(previous);
    }
  };

  const handleDeleteLead = async (id: string) => {
    const previous = [...leads];
    setLeads((prev) => prev.filter((l) => l.id !== id));

    try {
      const res = await fetch(`/api/pipeline?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
    } catch {
      setLeads(previous);
    }
  };

  // Group leads by status
  const outreachLeads = leads.filter((l) => l.status === "outreach");
  const repliedLeads = leads.filter((l) => l.status === "replied");
  const proposalLeads = leads.filter((l) => l.status === "proposal");
  const negotiatingLeads = leads.filter((l) => l.status === "negotiating");
  const wonLeads = leads.filter((l) => l.status === "won");
  const lostLeads = leads.filter((l) => l.status === "lost");

  return (
    <div className="space-y-6">
      {/* Top Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-textPrimary">Client Acquisition Pipeline</h2>
          <p className="text-xs text-textSecondary mt-0.5">
            Track and manage freelance leads from outreach to signed contract.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-element transition-colors shadow-sm flex items-center gap-1.5 shrink-0"
        >
          <Plus className="h-4 w-4" />
          Add Lead
        </button>
      </div>

      {/* Kanban Scrollable Board */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-accent animate-spin" />
          <span className="text-sm text-textSecondary mt-2">Loading pipeline...</span>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x scrollbar-thin">
          <PipelineColumn
            id="outreach"
            title="Outreach"
            leads={outreachLeads}
            onUpdateStatus={handleUpdateStatus}
            onDelete={handleDeleteLead}
          />
          <PipelineColumn
            id="replied"
            title="Replied"
            leads={repliedLeads}
            onUpdateStatus={handleUpdateStatus}
            onDelete={handleDeleteLead}
          />
          <PipelineColumn
            id="proposal"
            title="Proposal Sent"
            leads={proposalLeads}
            onUpdateStatus={handleUpdateStatus}
            onDelete={handleDeleteLead}
          />
          <PipelineColumn
            id="negotiating"
            title="Negotiating"
            leads={negotiatingLeads}
            onUpdateStatus={handleUpdateStatus}
            onDelete={handleDeleteLead}
          />
          <PipelineColumn
            id="won"
            title="Won"
            leads={wonLeads}
            onUpdateStatus={handleUpdateStatus}
            onDelete={handleDeleteLead}
          />
          <PipelineColumn
            id="lost"
            title="Lost"
            leads={lostLeads}
            onUpdateStatus={handleUpdateStatus}
            onDelete={handleDeleteLead}
          />
        </div>
      )}

      {/* Add Lead Overlay Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-customSurface rounded-card border border-customBorder overflow-hidden shadow-sm animate-in fade-in zoom-in-95 duration-200">
            <div className="h-2 w-full bg-accent" />

            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-textPrimary flex items-center gap-2">
                  <Kanban className="h-5 w-5 text-accent" />
                  Add Client Lead
                </h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1 rounded hover:bg-customBg text-textSecondary hover:text-textPrimary transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateLead} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-textSecondary uppercase tracking-wider block mb-1">
                    Business Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Munchify Merchants"
                    value={formInput.business}
                    onChange={(e) => setFormInput((prev) => ({ ...prev, business: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-customBorder rounded-element outline-none focus:border-accent bg-white text-textPrimary font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-textSecondary uppercase tracking-wider block mb-1">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. David Kimani"
                    value={formInput.name}
                    onChange={(e) => setFormInput((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-customBorder rounded-element outline-none focus:border-accent bg-white text-textPrimary font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-textSecondary uppercase tracking-wider block mb-1">
                    Channel
                  </label>
                  <select
                    value={formInput.channel}
                    onChange={(e) => setFormInput((prev) => ({ ...prev, channel: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-customBorder rounded-element outline-none focus:border-accent bg-white text-textPrimary font-semibold"
                  >
                    <option value="DM">LinkedIn/Twitter DM</option>
                    <option value="email">Cold Email</option>
                    <option value="referral">Referral</option>
                    <option value="inbound">Inbound</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-textSecondary uppercase tracking-wider block mb-1">
                    Follow-up Date
                  </label>
                  <input
                    type="date"
                    value={formInput.followUpAt}
                    onChange={(e) => setFormInput((prev) => ({ ...prev, followUpAt: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-customBorder rounded-element outline-none focus:border-accent bg-white text-textPrimary font-semibold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-textSecondary uppercase tracking-wider block mb-1">
                    Interaction Notes
                  </label>
                  <textarea
                    placeholder="Briefly state next action or contact context..."
                    value={formInput.notes}
                    onChange={(e) => setFormInput((prev) => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-customBorder rounded-element outline-none focus:border-accent bg-white text-textPrimary font-medium"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-element transition-colors shadow-sm"
                >
                  Create Opportunity
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
