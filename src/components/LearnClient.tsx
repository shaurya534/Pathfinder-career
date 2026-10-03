"use client";

import { useState } from "react";
import type { LessonContent } from "@/types";

const SUGGESTED_TOPICS = [
  "Arrays & Strings (DSA)",
  "SQL Joins & Normalization",
  "OOP Design Principles",
  "TCP/IP Networking Basics",
  "Operating System Scheduling",
  "System Design Fundamentals",
];

export default function LearnClient() {
  const [topic, setTopic] = useState("");
  const [content, setContent] = useState<LessonContent | null>(null);
  const [lessonId, setLessonId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  async function generate(t?: string) {
    const chosenTopic = t ?? topic;
    if (!chosenTopic.trim()) return;
    setLoading(true);
    setError(null);
    setSubmitted(false);
    setAnswers({});
    try {
      const res = await fetch("/api/learn/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: chosenTopic }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not generate lesson.");
      setContent(data.content);
      setLessonId(data.lessonId);
      setTopic(chosenTopic);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not generate lesson.");
    } finally {
      setLoading(false);
    }
  }

  async function submitQuiz() {
    if (!content) return;
    const score = content.mcqs.reduce(
      (sum, q, i) => sum + (answers[i] === q.correctIndex ? 1 : 0),
      0
    );
    setSubmitted(true);
    await fetch("/api/learn/quiz-attempt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId, topic: content.topic, score, total: content.mcqs.length }),
    });
  }

  return (
    <div className="p-6 md:p-10 space-y-6">
      <div className="border border-line rounded-md bg-white p-6">
        <div className="flex gap-3 mb-3">
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && generate()}
            placeholder="Enter any topic, e.g. Binary Search Trees"
            className="flex-1 text-sm border border-line rounded-md px-3 py-2"
          />
          <button
            onClick={() => generate()}
            disabled={loading}
            className="px-5 py-2 rounded-md bg-ink text-white text-sm font-medium disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate lesson"}
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_TOPICS.map((t) => (
            <button
              key={t}
              onClick={() => generate(t)}
              className="text-xs px-3 py-1.5 rounded-sm border border-line text-ink/60 hover:border-teal hover:text-teal"
            >
              {t}
            </button>
          ))}
        </div>
        {error && <p className="text-xs text-rose mt-2">{error}</p>}
      </div>

      {content && (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 border border-line rounded-md bg-white p-6">
            <h2 className="font-display text-xl text-ink mb-3">{content.topic}</h2>
            <div
              className="prose-lesson text-sm text-ink/80"
              dangerouslySetInnerHTML={{ __html: renderNotes(content.notes) }}
            />
            <h3 className="font-display text-base text-ink mt-6 mb-2">Key takeaways</h3>
            <ul className="text-sm text-ink/70 list-disc pl-4 space-y-1">
              {content.keyTakeaways.map((k) => (
                <li key={k}>{k}</li>
              ))}
            </ul>

            <h3 className="font-display text-base text-ink mt-6 mb-2">Coding questions</h3>
            <div className="space-y-2">
              {content.codingQuestions.map((c, i) => (
                <div key={i} className="border border-line rounded-md p-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm text-ink font-medium">Q{i + 1}. {c.prompt}</p>
                    <span className="text-[10px] uppercase text-ink/40 shrink-0 ml-2">{c.difficulty}</span>
                  </div>
                  <p className="text-xs text-ink/40">Hint: {c.hint}</p>
                </div>
              ))}
            </div>

            <h3 className="font-display text-base text-ink mt-6 mb-2">Interview questions</h3>
            <ul className="text-sm text-ink/70 list-disc pl-4 space-y-1">
              {content.interviewQuestions.map((q) => (
                <li key={q}>{q}</li>
              ))}
            </ul>
          </div>

          <div className="border border-line rounded-md bg-white p-6">
            <h3 className="font-display text-base text-ink mb-3">Quick quiz</h3>
            <div className="space-y-4">
              {content.mcqs.map((q, i) => (
                <div key={i}>
                  <p className="text-sm text-ink font-medium mb-1.5">{i + 1}. {q.question}</p>
                  <div className="space-y-1">
                    {q.options.map((opt, oi) => {
                      const chosen = answers[i] === oi;
                      const isCorrect = submitted && oi === q.correctIndex;
                      const isWrongChoice = submitted && chosen && oi !== q.correctIndex;
                      return (
                        <button
                          key={oi}
                          disabled={submitted}
                          onClick={() => setAnswers({ ...answers, [i]: oi })}
                          className={`w-full text-left text-xs px-3 py-1.5 rounded-sm border ${
                            isCorrect
                              ? "border-teal bg-teal-dim text-teal"
                              : isWrongChoice
                              ? "border-rose bg-rose/10 text-rose"
                              : chosen
                              ? "border-ink bg-ink/5"
                              : "border-line text-ink/70"
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  {submitted && (
                    <p className="text-[11px] text-ink/40 mt-1">{q.explanation}</p>
                  )}
                </div>
              ))}
            </div>
            {!submitted ? (
              <button
                onClick={submitQuiz}
                className="w-full mt-4 py-2 rounded-md bg-amber text-ink text-sm font-medium"
              >
                Submit quiz
              </button>
            ) : (
              <p className="text-sm text-ink mt-4 font-medium">
                Score: {content.mcqs.reduce((s, q, i) => s + (answers[i] === q.correctIndex ? 1 : 0), 0)}/{content.mcqs.length}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Minimal markdown-ish renderer: handles headings, bold, and paragraphs safely
// without pulling in a full markdown dependency.
function renderNotes(markdown: string): string {
  const escaped = markdown
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return escaped
    .split("\n")
    .map((line) => {
      if (line.startsWith("### ")) return `<h3>${line.slice(4)}</h3>`;
      if (line.startsWith("## ")) return `<h2>${line.slice(3)}</h2>`;
      if (line.startsWith("# ")) return `<h1>${line.slice(2)}</h1>`;
      if (line.startsWith("- ")) return `<li>${line.slice(2)}</li>`;
      if (!line.trim()) return "";
      return `<p>${line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/`(.+?)`/g, "<code>$1</code>")}</p>`;
    })
    .join("\n");
}
