export default function ScoreStat({
  label,
  value,
  accent = "amber",
}: {
  label: string;
  value: string | number;
  accent?: "amber" | "teal" | "rose";
}) {
  const accentClass =
    accent === "teal" ? "text-teal" : accent === "rose" ? "text-rose" : "text-amber";
  return (
    <div className="border border-line rounded-md px-5 py-4 bg-white">
      <p className="text-xs uppercase tracking-wide text-ink/40">{label}</p>
      <p className={`font-display text-2xl mt-1 ${accentClass}`}>{value}</p>
    </div>
  );
}
