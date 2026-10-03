import Link from "next/link";

const STEPS = [
  { n: "01", t: "Upload your resume", d: "We read your education, skills, projects and experience — and build a knowledge map of everything you should know before an interview." },
  { n: "02", t: "Pick a target company & role", d: "Get a week-by-week roadmap built around your actual gaps, not a generic syllabus." },
  { n: "03", t: "Learn your way", d: "A 1:1 AI tutor, structured text lessons, or bring in a real human teacher whenever you're stuck." },
  { n: "04", t: "Practice under pressure", d: "Technical, HR, behavioral, resume-based and company-specific mock interviews — with a scored report after each one." },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <nav className="flex items-center justify-between px-6 md:px-12 py-6">
        <span className="font-display text-xl text-ink">Pathfinder</span>
        <div className="flex items-center gap-6 text-sm text-ink/70">
          <Link href="/login" className="hover:text-ink">Sign in</Link>
          <Link
            href="/login?mode=register"
            className="px-4 py-2 rounded-md bg-ink text-white hover:bg-ink/90"
          >
            Get started
          </Link>
        </div>
      </nav>

      <section className="px-6 md:px-12 pt-10 pb-20 grid md:grid-cols-2 gap-10 items-center max-w-6xl mx-auto">
        <div>
          <h1 className="font-display text-4xl md:text-5xl leading-[1.1] text-ink">
            Turn your resume into an interview offer.
          </h1>
          <p className="text-ink/60 mt-5 text-lg max-w-md">
            Pathfinder reads your resume, builds you a personal roadmap toward
            the company you actually want, and coaches you there — through AI
            tutoring, mock interviews, and real human mentors.
          </p>
          <Link
            href="/login?mode=register"
            className="inline-block mt-8 px-6 py-3 rounded-md bg-amber text-ink font-medium"
          >
            Build my roadmap
          </Link>
        </div>
        <div className="border border-line rounded-lg bg-white p-6">
          <p className="text-xs uppercase text-ink/40 mb-3">Resume Knowledge Map — preview</p>
          <div className="space-y-3 text-sm">
            <div className="border border-line rounded-md p-3">
              <p className="font-medium text-ink">Network Packet Analyzer (your project)</p>
              <p className="text-ink/50 mt-1">Must know: PCAP, TCP/IP, TLS handshake, SNI, Wireshark internals, socket programming</p>
            </div>
            <div className="border border-line rounded-md p-3">
              <p className="font-medium text-ink">Missing for: Software Engineer @ TCS</p>
              <p className="text-ink/50 mt-1">SQL joins & normalization, OOP design principles, OS scheduling</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 md:px-12 py-16 bg-ink text-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8">
          {STEPS.map((s) => (
            <div key={s.n}>
              <p className="text-amber font-display text-2xl mb-2">{s.n}</p>
              <p className="font-medium mb-1">{s.t}</p>
              <p className="text-sm text-white/60">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="px-6 md:px-12 py-8 text-xs text-ink/40">
        © {new Date().getFullYear()} Pathfinder. Built for students and professionals getting interview-ready.
      </footer>
    </main>
  );
}
