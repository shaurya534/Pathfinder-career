export default function TopBar({
  title,
  subtitle,
  userName,
}: {
  title: string;
  subtitle?: string;
  userName?: string;
}) {
  return (
    <header className="flex items-center justify-between px-6 md:px-10 py-6 border-b border-line">
      <div>
        <h1 className="font-display text-2xl text-ink">{title}</h1>
        {subtitle && <p className="text-sm text-ink/50 mt-1">{subtitle}</p>}
      </div>
      {userName && (
        <div className="flex items-center gap-2 text-sm text-ink/70">
          <span className="w-8 h-8 rounded-full bg-teal-dim text-teal flex items-center justify-center font-medium">
            {userName.charAt(0).toUpperCase()}
          </span>
          {userName}
        </div>
      )}
    </header>
  );
}
