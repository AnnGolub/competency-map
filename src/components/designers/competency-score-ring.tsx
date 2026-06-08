import { formatScore } from "@/lib/competency-utils";

export function CompetencyScoreRing({
  value,
  theme = "dark",
}: {
  value: number | null;
  theme?: "light" | "dark";
}) {
  const size = 64;
  const stroke = 4;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = value !== null ? Math.min(1, Math.max(0, value / 4)) : 0;
  const offset = circumference * (1 - progress);
  const isLight = theme === "light";

  return (
    <div className="relative h-16 w-16 shrink-0">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={isLight ? "#FFFFFF" : "#2A2D3A"}
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={isLight ? "#212124" : "#3E7BFA"}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span
        className={`absolute inset-0 flex items-center justify-center text-lg leading-6 tabular-nums ${
          isLight ? "text-[rgba(3,3,6,0.88)]" : "text-white"
        }`}
      >
        {formatScore(value)}
      </span>
    </div>
  );
}
