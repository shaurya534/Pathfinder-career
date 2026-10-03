"use client";

import { useState } from "react";
import RoadmapTimeline from "./RoadmapTimeline";
import type { RoadmapWeek } from "@/types";

export default function RoadmapClient({
  initialRoadmapId,
  initialWeeks,
  initialCompany,
  initialRole,
  defaultRole,
  defaultCompany,
  companyNote,
}: {
  initialRoadmapId: string | null;
  initialWeeks: RoadmapWeek[] | null;
  initialCompany: string;
  initialRole: string;
  defaultRole: string;
  defaultCompany: string;
  companyNote: string | null;
}) {
  const [roadmapId, setRoadmapId] = useState(initialRoadmapId);
  const [weeks, setWeeks] = useState<RoadmapWeek[] | null>(initialWeeks);
  const [note, setNote] = useState(companyNote);
  const [role, setRole] = useState(defaultRole);
  const [company, setCompany] = useState(defaultCompany);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/roadmap/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetRole: role, targetCompany: company }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not generate roadmap.");
      setRoadmapId(data.roadmapId);
      setWeeks(data.plan.weeks);
      setNote(data.plan.companyInsightsNote);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not generate roadmap.");
    } finally {
      setLoading(false);
    }
  }

  async function advance() {
    if (!roadmapId) return;
    const res = await fetch("/api/roadmap/advance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roadmapId }),
    });
    const data = await res.json();
    if (res.ok) setWeeks(data.weeks);
  }

  return (
    <div className="p-6 md:p-10 space-y-6">
      <form onSubmit={generate} className="border border-line rounded-md bg-white p-6 grid md:grid-cols-4 gap-4 items-end">
        <div className="md:col-span-1">
          <label className="text-xs text-ink/50 block mb-1">Target role</label>
          <input value={role} onChange={(e) => setRole(e.target.value)} className="w-full text-sm border border-line rounded-md px-3 py-2" placeholder="Software Engineer" />
        </div>
        <div className="md:col-span-1">
          <label className="text-xs text-ink/50 block mb-1">Target company</label>
          <input value={company} onChange={(e) => setCompany(e.target.value)} className="w-full text-sm border border-line rounded-md px-3 py-2" placeholder="TCS" />
        </div>
        <div className="md:col-span-2">
          <button disabled={loading} className="px-5 py-2.5 rounded-md bg-ink text-white text-sm font-medium disabled:opacity-50">
            {loading ? "Building roadmap..." : weeks ? "Regenerate roadmap" : "Generate roadmap"}
          </button>
          {error && <span className="text-xs text-rose ml-3">{error}</span>}
        </div>
      </form>

      {note && (
        <p className="text-xs text-ink/40 bg-amber-dim/40 border border-line rounded-md px-4 py-3">
          {note}
        </p>
      )}

      {weeks ? (
        <div className="border border-line rounded-md bg-white p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-lg text-ink">{weeks.length}-week plan</h2>
            <button onClick={advance} className="text-sm px-4 py-2 rounded-md bg-teal text-white">
              Mark current week complete
            </button>
          </div>
          <RoadmapTimeline weeks={weeks} />
        </div>
      ) : (
        <p className="text-sm text-ink/50">No roadmap yet — set a target role and company above and generate one.</p>
      )}
    </div>
  );
}
