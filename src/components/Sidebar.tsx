import Link from "next/link";

const NAV = [
  { href: "/dashboard", label: "Dashboard", glyph: "◆" },
  { href: "/resume", label: "Resume", glyph: "▤" },
  { href: "/roadmap", label: "Roadmap", glyph: "→" },
  { href: "/tutor", label: "AI Tutor", glyph: "◐" },
  { href: "/learn", label: "Learn", glyph: "▥" },
  { href: "/interview", label: "Mock Interview", glyph: "◎" },
  { href: "/teachers", label: "Human Teachers", glyph: "◈" },
];

export default function Sidebar({ active }: { active: string }) {
  return (
    <aside className="hidden md:flex md:w-60 md:flex-col bg-ink text-white/90 shrink-0 min-h-screen">
      <div className="px-6 py-7">
        <Link href="/dashboard" className="font-display text-xl tracking-tight text-white">
          Pathfinder
        </Link>
        <p className="text-xs text-white/50 mt-1">Career readiness, personalized.</p>
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {NAV.map((item) => {
          const isActive = active === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                isActive
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <span className="w-4 text-center text-amber">{item.glyph}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <form action="/api/auth/logout" method="post" className="px-6 py-6">
        <button className="text-xs text-white/40 hover:text-white/70">Sign out</button>
      </form>
    </aside>
  );
}
