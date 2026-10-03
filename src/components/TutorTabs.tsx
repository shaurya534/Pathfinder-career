"use client";

import { useState, useEffect } from "react";
import ChatPanel, { ChatPanelMessage } from "./ChatPanel";
import VideoTutorClient from "./VideoTutorClient";

export default function TutorTabs() {
  const [mode, setMode] = useState<"chat" | "video">("chat");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [initialMessages, setInitialMessages] = useState<ChatPanelMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/tutor/start", { method: "POST" })
      .then((res) => res.json())
      .then((data) => {
        setSessionId(data.sessionId);
        setInitialMessages([
          {
            role: "assistant",
            content:
              "Hi! I'm your AI tutor. Tell me what you'd like to work on — a concept to learn, a doubt to clear up, or ask me for a quiz or coding question.",
          },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 md:p-10 space-y-4">
      <div className="inline-flex border border-line rounded-md overflow-hidden">
        <button
          onClick={() => setMode("chat")}
          className={`px-4 py-2 text-sm ${mode === "chat" ? "bg-ink text-white" : "bg-white text-ink/60"}`}
        >
          Chat Tutor
        </button>
        <button
          onClick={() => setMode("video")}
          className={`px-4 py-2 text-sm ${mode === "video" ? "bg-ink text-white" : "bg-white text-ink/60"}`}
        >
          Video Tutor
        </button>
      </div>

      {mode === "chat" ? (
        loading || !sessionId ? (
          <p className="text-sm text-ink/50">Starting your tutor session...</p>
        ) : (
          <ChatPanel
            endpoint="/api/tutor/chat"
            sessionId={sessionId}
            initialMessages={initialMessages}
            placeholder="Ask a question, or say 'quiz me on arrays'..."
          />
        )
      ) : (
        <VideoTutorClient />
      )}
    </div>
  );
}
