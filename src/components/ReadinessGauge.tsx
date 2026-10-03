export default function ReadinessGauge({
  score,
  label,
}: {
  score: number;
  label: string;
}) {
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="#E4E3EE"
          strokeWidth="10"
        />
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="#F2A93B"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 70 70)"
        />
        <text
          x="70"
          y="66"
          textAnchor="middle"
          className="font-display"
          fontSize="28"
          fill="#12132B"
        >
          {score}
        </text>
        <text x="70" y="86" textAnchor="middle" fontSize="11" fill="#12132B99">
          / 100
        </text>
      </svg>
      <p className="text-sm text-ink/60 mt-1">{label}</p>
    </div>
  );
}
