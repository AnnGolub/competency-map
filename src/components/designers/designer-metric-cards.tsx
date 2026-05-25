import Image from "next/image";
import { formatScore } from "@/lib/competency-utils";

const METRIC_ICONS = {
  average: "/icons/Ranking.svg",
  below: "/icons/Emoji-sad.svg",
  growth: "/icons/Activity.svg",
} as const;

function ScoreRing({
  value,
  progress,
}: {
  value: string;
  progress: number;
}) {
  const size = 44;
  const stroke = 3;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(1, Math.max(0, progress));
  const offset = circumference * (1 - clamped);

  return (
    <div className="relative h-11 w-11 shrink-0">
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
          stroke="#2A2D3A"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#3E7BFA"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold tabular-nums text-white">
        {value}
      </span>
    </div>
  );
}

function MetricIcon({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#3E7BFA] to-[#6600CC]">
      <Image src={src} alt={alt} width={24} height={24} className="shrink-0" />
    </div>
  );
}

function MetricCard({
  title,
  subtitle,
  value,
  progress,
  iconSrc,
  iconAlt,
}: {
  title: string;
  subtitle: string;
  value: string;
  progress: number;
  iconSrc: string;
  iconAlt: string;
}) {
  return (
    <article className="flex min-w-0 flex-1 items-center justify-between gap-4 rounded-3xl bg-app-sidebar p-6">
      <div className="flex min-w-0 items-center gap-4">
        <MetricIcon src={iconSrc} alt={iconAlt} />
        <div className="min-w-0">
          <p className="text-sm font-semibold leading-5 text-white">{title}</p>
          <p className="text-sm leading-5 text-app-placeholder">{subtitle}</p>
        </div>
      </div>
      <ScoreRing value={value} progress={progress} />
    </article>
  );
}

export function DesignerMetricCards({
  average,
  belowCount,
  growth,
  maxBelow,
}: {
  average: number | null;
  belowCount: number;
  growth: number | null;
  maxBelow: number;
}) {
  const avgValue = formatScore(average);
  const avgProgress = average !== null ? average / 4 : 0;

  const belowProgress =
    maxBelow > 0 ? Math.min(1, belowCount / maxBelow) : belowCount > 0 ? 1 : 0;

  const growthValue =
    growth === null ? "—" : `${growth > 0 ? "+" : ""}${growth.toFixed(1)}`;
  const growthProgress =
    growth === null ? 0 : Math.min(1, Math.max(0, (growth + 1) / 2));

  return (
    <section className="mt-8 max-w-[1152px]">
      <h2 className="text-base font-semibold leading-6 text-white">
        Оценка дизайнера
      </h2>
      <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <MetricCard
          title="Средний балл"
          subtitle="По карте компетенций"
          value={avgValue}
          progress={avgProgress}
          iconSrc={METRIC_ICONS.average}
          iconAlt=""
        />
        <MetricCard
          title="Ниже ожидаемого"
          subtitle="Уровень по грейду"
          value={String(belowCount)}
          progress={belowProgress}
          iconSrc={METRIC_ICONS.below}
          iconAlt=""
        />
        <MetricCard
          title="Рост в навыках"
          subtitle="За полгода"
          value={growthValue}
          progress={growthProgress}
          iconSrc={METRIC_ICONS.growth}
          iconAlt=""
        />
      </div>
    </section>
  );
}
