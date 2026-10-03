"use client";

import { useState } from "react";

export interface TeacherData {
  id: string;
  name: string;
  headline: string;
  subjects: string;
  bio: string;
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  currency: string;
}

export default function TeacherCard({ teacher }: { teacher: TeacherData }) {
  const [open, setOpen] = useState(false);
  const [slot, setSlot] = useState("");
  const [status, setStatus] = useState<"idle" | "booking" | "booked" | "error">("idle");

  async function book() {
    if (!slot) return;
    setStatus("booking");
    try {
      const res = await fetch("/api/teachers/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacherId: teacher.id, slot, subject: teacher.subjects.split(",")[0] }),
      });
      if (!res.ok) throw new Error();
      setStatus("booked");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="border border-line rounded-md bg-white p-5 flex flex-col">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-amber-dim text-ink flex items-center justify-center font-display">
          {teacher.name.charAt(0)}
        </div>
        <div>
          <p className="font-medium text-ink text-sm">{teacher.name}</p>
          <p className="text-xs text-ink/50">{teacher.headline}</p>
        </div>
      </div>
      <p className="text-xs text-ink/60 mb-3">{teacher.bio}</p>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {teacher.subjects.split(",").map((s) => (
          <span key={s} className="text-[11px] bg-teal-dim text-teal px-2 py-0.5 rounded-sm">
            {s.trim()}
          </span>
        ))}
      </div>
      <div className="flex items-center justify-between text-sm mb-3">
        <span className="text-ink/70">★ {teacher.rating.toFixed(1)} ({teacher.reviewCount})</span>
        <span className="font-medium text-ink">
          {teacher.currency} {teacher.hourlyRate}/hr
        </span>
      </div>

      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="mt-auto text-sm font-medium px-4 py-2 rounded-md bg-ink text-white"
        >
          Book a session
        </button>
      ) : status === "booked" ? (
        <p className="text-sm text-teal">Session requested for {new Date(slot).toLocaleString()}. Payment step will follow once a payment provider is connected.</p>
      ) : (
        <div className="mt-auto space-y-2">
          <input
            type="datetime-local"
            value={slot}
            onChange={(e) => setSlot(e.target.value)}
            className="w-full text-sm px-3 py-2 rounded-md border border-line"
          />
          <button
            onClick={book}
            disabled={!slot || status === "booking"}
            className="w-full text-sm font-medium px-4 py-2 rounded-md bg-amber text-ink disabled:opacity-50"
          >
            {status === "booking" ? "Requesting..." : "Confirm request"}
          </button>
          {status === "error" && (
            <p className="text-xs text-rose">Couldn't book that slot. Try again.</p>
          )}
        </div>
      )}
    </div>
  );
}
