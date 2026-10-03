"use client";

import { useState, useRef } from "react";
import type { LessonContent } from "@/types";

/**
 * A real, working "video tutor" experience: it generates a lesson via Claude,
 * then narrates it using the browser's built-in speech synthesis with a
 * simple animated avatar and synced captions. This avoids depending on a
 * paid AI-avatar/TTS vendor while still delivering the core UX (narrated,
 * pausable, ask-a-question video-style lesson). Swap the narration call for
 * a provider like ElevenLabs + D-ID/HeyGen later for a photoreal avatar —
 * see README "What's stubbed".
 */
export default function VideoTutorClient() {
  const [topic, setTopic] = useState("");
  const [lesson, setLesson] = useState<LessonContent | null>(null);
  const [sentences, setSentences] = useState<string[]>([]);
  const [current, setCurrent] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  async function generate() {
    if (!topic.trim()) return;
    setLoading(true);
    setError(null);
    setLesson(null);
    try {
      const res = await fetch("/api/learn/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not generate video lesson.");
      setLesson(data.content);
      const script = stripMarkdown(data.content.notes);
      const split = script.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 3);
      setSentences(split);
      setCurrent(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not generate video lesson.");
    } finally {
      setLoading(false);
    }
  }

  function playFrom(index: number) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setError("Your browser doesn't support speech playback. The transcript is still shown below.");
      return;
    }
    window.speechSynthesis.cancel();
    if (index >= sentences.length) {
      setSpeaking(false);
      return;
    }
    const utter = new SpeechSynthesisUtterance(sentences[index]);
    utter.rate = 1;
    utter.onend = () => {
      setCurrent(index + 1);
      playFrom(index + 1);
    };
    utterRef.current = utter;
    setSpeaking(true);
    setCurrent(index);
    window.speechSynthesis.speak(utter);
  }

  function pause() {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }

  async function askQuestion() {
    if (!question.trim() || !lesson) return;
    pause();
    setAnswer("Thinking...");
    try {
      const res = await fetch("/api/tutor/quick-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: lesson.topic, question }),
      });
      const data = await res.json();
      setAnswer(res.ok ? data.reply : data.error);
    } catch {
      setAnswer("Couldn't reach the tutor right now.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="border border-line rounded-md bg-white p-6 flex gap-3">
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. How TCP handshakes work"
          className="flex-1 text-sm border border-line rounded-md px-3 py-2"
        />
        <button onClick={generate} disabled={loading} className="px-5 py-2 rounded-md bg-ink text-white text-sm font-medium disabled:opacity-50">
          {loading ? "Preparing..." : "Generate video lesson"}
        </button>
      </div>
      {error && <p className="text-xs text-rose">{error}</p>}

      {lesson && (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 border border-line rounded-md bg-ink p-8 flex flex-col items-center justify-center min-h-[320px] relative overflow-hidden">
            <div
              className={`w-32 h-32 rounded-full bg-gradient-to-br from-amber to-teal flex items-center justify-center transition-transform ${
                speaking ? "scale-105" : ""
              }`}
            >
              <div className={`w-20 h-20 rounded-full bg-ink/80 flex items-end justify-center overflow-hidden`}>
                <div
                  className={`w-16 bg-amber rounded-t-full transition-all ${speaking ? "h-6 animate-pulse" : "h-2"}`}
                />
              </div>
            </div>
            <p className="text-white text-sm mt-6 max-w-md text-center min-h-[3em]">
              {sentences[current] ?? "Ready to explain — press play."}
            </p>
            <div className="flex gap-3 mt-6">
              {!speaking ? (
                <button onClick={() => playFrom(current)} className="px-4 py-2 rounded-md bg-amber text-ink text-sm font-medium">
                  {current >= sentences.length - 1 && current !== 0 ? "Replay" : "Play"}
                </button>
              ) : (
                <button onClick={pause} className="px-4 py-2 rounded-md bg-white/10 text-white text-sm font-medium">
                  Pause
                </button>
              )}
            </div>
          </div>

          <div className="border border-line rounded-md bg-white p-5 flex flex-col">
            <h3 className="font-display text-base text-ink mb-3">Ask about this lesson</h3>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Pause and ask a question..."
              className="text-sm border border-line rounded-md px-3 py-2 flex-1 min-h-[80px]"
            />
            <button onClick={askQuestion} className="mt-2 text-sm px-4 py-2 rounded-md bg-teal text-white">
              Ask
            </button>
            {answer && <p className="text-xs text-ink/70 mt-3 whitespace-pre-wrap">{answer}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

function stripMarkdown(md: string) {
  return md
    .replace(/[#*`]/g, "")
    .replace(/\n+/g, " ")
    .trim();
}
