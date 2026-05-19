import type { ReactNode } from "react";
import { formatScore } from "@/lib/competency-utils";

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

function MetricIcon({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#3E7BFA] to-[#6600CC] text-white">
      {children}
    </div>
  );
}

function IconChart() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M3 14V10M7 14V6M11 14V8M15 14V4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconAlert() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M10 3L17 16H3L10 3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M10 9V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconTrend() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M3 14L8 9L11 12L17 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 6H17V11"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MetricCard({
  title,
  subtitle,
  value,
  progress,
  icon,
}: {
  title: string;
  subtitle: string;
  value: string;
  progress: number;
  icon: ReactNode;
}) {
  return (
    <article className="flex min-w-0 flex-1 items-center justify-between gap-4 rounded-3xl bg-app-sidebar p-6">
      <div className="flex min-w-0 items-center gap-4">
        <MetricIcon>{icon}</MetricIcon>
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
          icon={<IconChart />}
        />
        <MetricCard
          title="Ниже ожидаемого"
          subtitle="Компетенций"
          value={String(belowCount)}
          progress={belowProgress}
          icon={<IconAlert />}
        />
        <MetricCard
          title="Рост в навыках"
          subtitle="За полгода"
          value={growthValue}
          progress={growthProgress}
          icon={<IconTrend />}
        />
      </div>
    </section>
  );
}
