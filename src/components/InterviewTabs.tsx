"use client";

import { useState } from "react";
import InterviewClient from "./InterviewClient";
import VideoInterviewClient from "./VideoInterviewClient";

export default function InterviewTabs({ defaultCompany }: { defaultCompany: string }) {
  const [mode, setMode] = useState<"text" | "video">("video");

  return (
    <div className="p-6 md:p-10">
      <div className="inline-flex border border-line rounded-md overflow-hidden mb-4">
        <button
          onClick={() => setMode("video")}
          className={`px-4 py-2 text-sm ${mode === "video" ? "bg-ink text-white" : "bg-white text-ink/60"}`}
        >
          Video Call Interview
        </button>
        <button
          onClick={() => setMode("text")}
          className={`px-4 py-2 text-sm ${mode === "text" ? "bg-ink text-white" : "bg-white text-ink/60"}`}
        >
          Text Chat Interview
        </button>
      </div>

      {mode === "video" ? (
        <VideoInterviewClient defaultCompany={defaultCompany} />
      ) : (
        <InterviewClient defaultCompany={defaultCompany} />
      )}
    </div>
  );
}
