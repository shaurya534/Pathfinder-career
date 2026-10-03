"use client";

import { useState } from "react";
import ChatPanel, { ChatPanelMessage } from "./ChatPanel";
import InterviewReportView from "./InterviewReportView";
import type { InterviewReport } from "@/types";

const MODES = [
  { id: "technical", label: "Technical" },
  { id: "hr", label: "HR" },
  { id: "behavioral", label: "Behavioral" },
  { id: "resume", label: "Resume-Based" },
  { id: "coding", label: "Coding" },
  { id: "company", label: "Company-Specific" },
];

export default function InterviewClient({ defaultCompany }: { defaultCompany: string }) {
  const [mode, setMode] = useState<string | null>(null);
  const [company, setCompany] = useState(defaultCompany);
  const [interviewId, setInterviewId] = useState<string | null>(null);
  const [initialMessages, setInitialMessages] = useState<ChatPanelMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [ended, setEnded] = useState(false);
  const [report, setReport] = useState<InterviewReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function start(chosenMode: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/interview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: chosenMode, targetCompany: company }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not start interview.");
      setMode(chosenMode);
      setInterviewId(data.interviewId);
      setInitialMessages([{ role: "assistant", content: data.opening }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start interview.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchReport() {
    if (!interviewId) return;
    setLoading(true);
    try {
      const res = await fetch("/api/interview/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interviewId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not generate report.");
      setReport(data.report);
      setEnded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not generate report.");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setMode(null);
    setInterviewId(null);
    setEnded(false);
    setReport(null);
    setInitialMessages([]);
  }

  if (report) {
    return (
      <div className="">
        <InterviewReportView report={report} onRestart={reset} />
      </div>
    );
  }

  if (mode && interviewId) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-ink/50 capitalize">{mode} interview{company ? ` · ${company}` : ""}</p>
          <button
            onClick={fetchReport}
            disabled={loading}
            className="text-sm px-4 py-2 rounded-md bg-amber text-ink font-medium disabled:opacity-50"
          >
            {loading ? "Scoring..." : "End interview & get report"}
          </button>
        </div>
        <ChatPanel
          endpoint="/api/interview/message"
          sessionId={interviewId}
          initialMessages={initialMessages}
          placeholder="Type your answer..."
          onDone={() => fetchReport()}
        />
        {error && <p className="text-xs text-rose">{error}</p>}
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      <div className="border border-line rounded-md bg-white p-6 max-w-xl">
        <label className="text-xs text-ink/50 block mb-1">Target company (optional)</label>
        <input
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="TCS"
          className="w-full text-sm border border-line rounded-md px-3 py-2 mb-4"
        />
        <p className="text-xs text-ink/50 mb-2">Choose interview type</p>
        <div className="grid grid-cols-2 gap-2">
          {MODES.map((m) => (
            <button
              key={m.id}
              disabled={loading}
              onClick={() => start(m.id)}
              className="text-sm px-4 py-3 rounded-md border border-line hover:border-teal hover:text-teal text-left disabled:opacity-50"
            >
              {m.label}
            </button>
          ))}
        </div>
        {error && <p className="text-xs text-rose mt-3">{error}</p>}
      </div>
    </div>
  );
}
