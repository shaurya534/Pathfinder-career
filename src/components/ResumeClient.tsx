"use client";

import { useState } from "react";
import type { ResumeAnalysis } from "@/types";

export default function ResumeClient({
  initialAnalysis,
  defaultRole,
  defaultCompany,
}: {
  initialAnalysis: ResumeAnalysis | null;
  defaultRole: string;
  defaultCompany: string;
}) {
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(initialAnalysis);
  const [targetRole, setTargetRole] = useState(defaultRole);
  const [targetCompany, setTargetCompany] = useState(defaultCompany);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Choose a PDF or DOCX file first.");
      return;
    }
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("targetRole", targetRole);
    formData.append("targetCompany", targetCompany);
    try {
      const res = await fetch("/api/resume/analyze", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Analysis failed.");
      setAnalysis(data.analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 md:p-10 space-y-8">
      <form onSubmit={submit} className="border border-line rounded-md bg-white p-6 grid md:grid-cols-4 gap-4 items-end">
        <div className="md:col-span-2">
          <label className="text-xs text-ink/50 block mb-1">Resume file (PDF or DOCX)</label>
          <input
            type="file"
            accept=".pdf,.docx"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="w-full text-sm border border-line rounded-md px-3 py-2"
          />
        </div>
        <div>
          <label className="text-xs text-ink/50 block mb-1">Target role</label>
          <input
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="Software Engineer"
            className="w-full text-sm border border-line rounded-md px-3 py-2"
          />
        </div>
        <div>
          <label className="text-xs text-ink/50 block mb-1">Target company</label>
          <input
            value={targetCompany}
            onChange={(e) => setTargetCompany(e.target.value)}
            placeholder="TCS"
            className="w-full text-sm border border-line rounded-md px-3 py-2"
          />
        </div>
        <div className="md:col-span-4">
          <button
            disabled={loading}
            className="px-5 py-2.5 rounded-md bg-ink text-white text-sm font-medium disabled:opacity-50"
          >
            {loading ? "Analyzing resume..." : "Analyze resume"}
          </button>
          {error && <span className="text-xs text-rose ml-3">{error}</span>}
        </div>
      </form>

      {analysis && (
        <div className="space-y-6">
          <div className="border border-line rounded-md bg-white p-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-display text-lg text-ink">{analysis.candidateName || "Candidate"}</h2>
              <span className="font-display text-2xl text-amber">{analysis.resumeScore}/100</span>
            </div>
            <p className="text-sm text-ink/60">{analysis.summary}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="border border-line rounded-md bg-white p-6">
              <h3 className="font-display text-base text-ink mb-3">Skills</h3>
              <p className="text-xs text-ink/40 mb-1">Technical</p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {analysis.skills?.technical?.map((s) => (
                  <span key={s} className="text-xs bg-teal-dim text-teal px-2 py-0.5 rounded-sm">{s}</span>
                ))}
              </div>
              <p className="text-xs text-ink/40 mb-1">Non-technical</p>
              <div className="flex flex-wrap gap-1.5">
                {analysis.skills?.nonTechnical?.map((s) => (
                  <span key={s} className="text-xs bg-amber-dim text-ink px-2 py-0.5 rounded-sm">{s}</span>
                ))}
              </div>
            </div>

            <div className="border border-line rounded-md bg-white p-6">
              <h3 className="font-display text-base text-ink mb-3">Missing for your target role</h3>
              {analysis.missingSkillsForTarget?.length ? (
                <ul className="space-y-1.5">
                  {analysis.missingSkillsForTarget.map((s) => (
                    <li key={s} className="text-sm text-ink/70 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose" /> {s}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-ink/50">No major gaps detected.</p>
              )}
            </div>
          </div>

          <div className="border border-line rounded-md bg-white p-6">
            <h3 className="font-display text-base text-ink mb-3">Weak resume statements</h3>
            {analysis.weakStatements?.length ? (
              <div className="space-y-3">
                {analysis.weakStatements.map((w, i) => (
                  <div key={i} className="border border-line rounded-md p-3">
                    <p className="text-sm text-ink/70 italic">"{w.original}"</p>
                    <p className="text-xs text-rose mt-1">{w.issue}</p>
                    <p className="text-xs text-teal mt-1">Suggestion: {w.suggestion}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-ink/50">No weak statements flagged.</p>
            )}
          </div>

          <div className="border border-line rounded-md bg-white p-6">
            <h3 className="font-display text-base text-ink mb-1">Resume Knowledge Map</h3>
            <p className="text-xs text-ink/40 mb-4">Everything you should know cold before an interview, based on what's actually in your resume.</p>
            <div className="space-y-4">
              {analysis.knowledgeMap?.map((k, i) => (
                <div key={i} className="border border-line rounded-md p-4">
                  <p className="font-medium text-sm text-ink mb-2">{k.sourceItem}</p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {k.mustKnowTopics.map((t) => (
                      <span key={t} className="text-xs bg-teal-dim text-teal px-2 py-0.5 rounded-sm">{t}</span>
                    ))}
                  </div>
                  <ul className="text-sm text-ink/60 list-disc pl-4 space-y-0.5">
                    {k.sampleQuestions.map((q) => (
                      <li key={q}>{q}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
