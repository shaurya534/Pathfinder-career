"use client";

import { useState, useRef, useEffect } from "react";

export interface ChatPanelMessage {
  role: "user" | "assistant";
  content: string;
}

export default function ChatPanel({
  endpoint,
  sessionId,
  initialMessages,
  placeholder = "Type your message...",
  onDone,
  disabled,
}: {
  endpoint: string;
  sessionId: string;
  initialMessages: ChatPanelMessage[];
  placeholder?: string;
  onDone?: (finalMessages: ChatPanelMessage[]) => void;
  disabled?: boolean;
}) {
  const [messages, setMessages] = useState<ChatPanelMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send() {
    if (!input.trim() || loading || disabled) return;
    const userMsg: ChatPanelMessage = { role: "user", content: input.trim() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, message: userMsg.content }),
      });
      if (!res.ok) throw new Error((await res.json())?.error ?? "Request failed");
      const data = await res.json();
      const withReply: ChatPanelMessage[] = [
        ...next,
        { role: "assistant", content: data.reply },
      ];
      setMessages(withReply);
      if (data.done && onDone) onDone(withReply);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-[65vh] border border-line rounded-md bg-white">
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[80%] px-4 py-2.5 rounded-md text-sm leading-relaxed whitespace-pre-wrap ${
              m.role === "user"
                ? "bg-ink text-white ml-auto"
                : "bg-teal-dim text-ink"
            }`}
          >
            {m.content}
          </div>
        ))}
        {loading && (
          <div className="max-w-[60%] px-4 py-2.5 rounded-md text-sm bg-teal-dim text-ink/50">
            Thinking...
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      {error && <p className="text-xs text-rose px-5 pb-2">{error}</p>}
      <div className="flex items-center gap-2 border-t border-line px-4 py-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          disabled={disabled}
          placeholder={placeholder}
          className="flex-1 text-sm px-3 py-2 rounded-md border border-line focus:border-amber outline-none disabled:bg-paper"
        />
        <button
          onClick={send}
          disabled={loading || disabled}
          className="text-sm font-medium px-4 py-2 rounded-md bg-ink text-white disabled:opacity-40"
        >
          Send
        </button>
      </div>
    </div>
  );
}
