"use client";

import { useState, useRef, useEffect } from "react";
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

type Phase = "setup" | "live" | "report";

/**
 * Simulates a video-call interview entirely in the browser:
 * - the candidate's own camera feed (getUserMedia)
 * - the AI interviewer's question is spoken aloud (SpeechSynthesis) with a
 *   simple animated avatar, so it feels like the "other side" of the call
 * - answers can be spoken and auto-transcribed (SpeechRecognition, Chrome/Edge)
 *   or typed as a fallback on browsers that don't support it
 * This avoids needing a paid photoreal-avatar/video vendor while still
 * delivering a real hands-free, face-to-face-feeling interview experience.
 */
export default function VideoInterviewClient({ defaultCompany }: { defaultCompany: string }) {
  const [phase, setPhase] = useState<Phase>("setup");
  const [mode, setMode] = useState<string | null>(null);
  const [company, setCompany] = useState(defaultCompany);
  const [interviewId, setInterviewId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [transcript, setTranscript] = useState<{ role: "ai" | "you"; text: string }[]>([]);
  const [answer, setAnswer] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<InterviewReport | null>(null);
  const [camReady, setCamReady] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      typeof window !== "undefined" && ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
    if (!SpeechRecognition) setSpeechSupported(false);
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      window.speechSynthesis?.cancel();
      recognitionRef.current?.stop?.();
    };
  }, []);
    // Re-attach the camera stream whenever the <video> element is recreated
  // (e.g. moving from the setup screen to the live interview screen),
  // otherwise it shows black even though the camera is still active.
  useEffect(() => {
    if (videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [phase, camReady]);

  async function enableCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCamReady(true);
    } catch {
      setError("Couldn't access your camera/mic. You can still continue without video.");
    }
  }

  function speak(text: string, onEnd?: () => void) {
    if (!("speechSynthesis" in window)) {
      onEnd?.();
      return;
    }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.onstart = () => setSpeaking(true);
    utter.onend = () => {
      setSpeaking(false);
      onEnd?.();
    };
    window.speechSynthesis.speak(utter);
  }

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
      setCurrentQuestion(data.opening);
      setTranscript([{ role: "ai", text: data.opening }]);
      setPhase("live");
      speak(data.opening);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start interview.");
    } finally {
      setLoading(false);
    }
  }

  function startListening() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onresult = (event: any) => {
      const text = Array.from(event.results)
        .map((r: any) => r[0].transcript)
        .join(" ");
      setAnswer(text);
    };
    recognition.onend = () => setListening(false);
        recognition.onerror = (event: any) => {
      setListening(false);
      const reason =
        event.error === "not-allowed" || event.error === "service-not-allowed"
          ? "Microphone access was blocked. Check your browser's site permissions and Windows microphone privacy settings."
          : event.error === "network"
          ? "Voice recognition couldn't reach its speech service (this is a known issue in Brave — try Chrome or Edge instead)."
          : event.error === "no-speech"
          ? "Didn't catch any speech — try again and speak right after clicking."
          : `Voice input error: ${event.error}`;
      setError(reason);
    };
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }

  function stopListening() {
    recognitionRef.current?.stop?.();
    setListening(false);
  }

  async function sendAnswer() {
    if (!answer.trim() || !interviewId || loading) return;
    stopListening();
    const myAnswer = answer.trim();
    setTranscript((t) => [...t, { role: "you", text: myAnswer }]);
    setAnswer("");
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/interview/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: interviewId, message: myAnswer }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setTranscript((t) => [...t, { role: "ai", text: data.reply }]);
      setCurrentQuestion(data.reply);
      speak(data.reply);
      if (data.done) {
        setTimeout(() => fetchReport(), 800);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
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
      setPhase("report");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not generate report.");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    window.speechSynthesis?.cancel();
    setPhase("setup");
    setMode(null);
    setInterviewId(null);
    setTranscript([]);
    setAnswer("");
    setReport(null);
  }

  if (phase === "report" && report) {
    return <InterviewReportView report={report} onRestart={reset} />;
  }

  if (phase === "live") {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-ink/50 capitalize">{mode} interview{company ? ` · ${company}` : ""} · video call</p>
          <button
  onClick={fetchReport}
  disabled={loading || transcript.filter((t) => t.role === "you").length === 0}
  className="text-sm px-4 py-2 rounded-md bg-amber text-ink font-medium disabled:opacity-50"
>
  {loading ? "Scoring..." : "End interview & get report"}
</button>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* AI interviewer side */}
          <div className="border border-line rounded-md bg-ink p-6 flex flex-col items-center justify-center min-h-[320px]">
            <div className={`w-28 h-28 rounded-full bg-gradient-to-br from-amber to-teal flex items-center justify-center ${speaking ? "scale-105" : ""} transition-transform`}>
              <div className="w-18 h-18 rounded-full bg-ink/80 flex items-end justify-center overflow-hidden" style={{ width: 72, height: 72 }}>
                <div className={`w-14 bg-amber rounded-t-full transition-all ${speaking ? "h-5 animate-pulse" : "h-1.5"}`} />
              </div>
            </div>
            <p className="text-white/60 text-xs mt-3">AI Interviewer {speaking && "· speaking..."}</p>
            <p className="text-white text-sm mt-3 text-center max-w-sm">{currentQuestion}</p>
          </div>

          {/* Candidate side: own camera */}
          <div className="border border-line rounded-md bg-black relative min-h-[320px] flex items-center justify-center overflow-hidden">
            {camReady ? (
              <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
            ) : (
              <button onClick={enableCamera} className="text-sm px-4 py-2 rounded-md bg-white/10 text-white">
                Enable camera
              </button>
            )}
            {listening && (
              <span className="absolute top-3 right-3 text-xs bg-rose text-white px-2 py-1 rounded-sm animate-pulse">
                Listening...
              </span>
            )}
            <span className="absolute bottom-3 left-3 text-xs text-white/70">You</span>
          </div>
        </div>

        <div className="border border-line rounded-md bg-white p-4">
          <div className="flex gap-2 mb-2">
            {speechSupported ? (
              <button
                onClick={listening ? stopListening : startListening}
                disabled={loading || speaking}
                className={`px-4 py-2 rounded-md text-sm font-medium ${listening ? "bg-rose text-white" : "bg-teal text-white"} disabled:opacity-50`}
              >
                {listening ? "Stop & review" : "🎙 Speak your answer"}
              </button>
            ) : (
              <span className="text-xs text-ink/40 self-center">
                Voice input isn't supported in this browser — try Chrome or Edge, or just type below.
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Your answer appears here as you speak, or type it directly..."
              className="flex-1 text-sm border border-line rounded-md px-3 py-2 min-h-[70px]"
            />
            <button
              onClick={sendAnswer}
              disabled={loading || !answer.trim()}
              className="px-5 py-2 rounded-md bg-ink text-white text-sm font-medium disabled:opacity-50 self-end"
            >
              {loading ? "Sending..." : "Send"}
            </button>
          </div>
          {error && <p className="text-xs text-rose mt-2">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      <div className="border border-line rounded-md bg-white p-6">
        <p className="text-xs text-ink/50 mb-3">
          Enable your camera for the full video-call feel, and use Chrome or Edge for voice-to-text answers.
        </p>
        {!camReady && (
          <button onClick={enableCamera} className="text-sm px-4 py-2 rounded-md bg-teal text-white mb-4">
            Enable camera & mic
          </button>
        )}
        {camReady && (
          <video ref={videoRef} autoPlay muted playsInline className="w-full rounded-md mb-4 bg-black" style={{ maxHeight: 180 }} />
        )}
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
