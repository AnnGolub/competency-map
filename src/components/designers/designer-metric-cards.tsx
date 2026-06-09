import Image from "next/image";
import { formatScore, ROLE_LABELS } from "@/lib/competency-utils";
import type { DesignerRole } from "@/types/database";

const METRIC_ICONS = {
  average: "/icons/Avatar.png",
  dynamics: "/icons/Avatar-1.png",
  feedback: "/icons/Avatar-2.png",
} as const;

function CircularProgress({
  value,
  label,
  maxScore = 4,
}: {
  value: number | null;
  label?: string;
  maxScore?: number;
}) {
  const size = 44;
  const cx = 22;
  const cy = 22;
  const r = 19;
  const circumference = 2 * Math.PI * r;
  const displayText = label ?? (value == null ? "—" : String(value));

  if (value == null) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 44 44"
        className="shrink-0"
        aria-hidden
      >
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#fff" strokeWidth={3} />
        <text
          x="22"
          y="27"
          textAnchor="middle"
          fontSize={12}
          fontWeight={700}
          fill="rgba(3,3,6,0.88)"
          className="font-sf"
        >
          —
        </text>
      </svg>
    );
  }

  const progress = (value / maxScore) * circumference;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 44 44"
      className="shrink-0"
      aria-hidden
    >
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#fff" strokeWidth={3} />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="#212124"
        strokeWidth={3}
        strokeLinecap="round"
        strokeDasharray={`${progress} ${circumference}`}
        transform="rotate(-90 22 22)"
      />
      <text
        x="22"
        y="27"
        textAnchor="middle"
        fontSize={12}
        fontWeight={700}
        fill="rgba(3,3,6,0.88)"
        letterSpacing={1.25}
        className="font-sf"
      >
        {displayText}
      </text>
    </svg>
  );
}

function MetricIcon({ src, alt }: { src: string; alt: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={44}
      height={44}
      className="h-11 w-11 shrink-0 rounded-xl object-cover"
    />
  );
}

function MetricRow({
  title,
  subtitle,
  ringValue,
  label,
  maxScore,
  iconSrc,
  iconAlt,
}: {
  title: string;
  subtitle: string;
  ringValue: number | null;
  label: string;
  maxScore?: number;
  iconSrc: string;
  iconAlt: string;
}) {
  return (
    <article className="flex items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-4">
        <MetricIcon src={iconSrc} alt={iconAlt} />
        <div className="min-w-0">
          <p className="font-sf text-sm font-bold leading-5 tracking-[0.47px] text-[rgba(3,3,6,0.88)]">
            {title}
          </p>
          <p className="font-sf mt-1 text-sm font-normal leading-5 tracking-[-0.08px] text-[rgba(4,4,19,0.55)]">
            {subtitle}
          </p>
        </div>
      </div>
      <CircularProgress value={ringValue} label={label} maxScore={maxScore} />
    </article>
  );
}

export function DesignerMetricCards({
  average,
  expectedAverage,
  role,
  growth,
  feedbackResponseCount,
  feedbackAverage,
  variant = "grid",
  className = "",
}: {
  average: number | null;
  expectedAverage: number | null;
  role: DesignerRole;
  growth: number | null;
  feedbackResponseCount: number;
  feedbackAverage: number | null;
  variant?: "grid" | "sidebar";
  className?: string;
}) {
  const avgLabel = formatScore(average);
  const expectedSubtitle = `Ожидается ${formatScore(expectedAverage)} для ${ROLE_LABELS[role]}`;
  const dynamicsSubtitle =
    growth === null ? "Нет данных" : "С прошлого ревью";
  const growthLabel =
    growth === null ? "—" : `${growth > 0 ? "+" : ""}${growth.toFixed(1)}`;
  const growthRingValue =
    growth === null ? null : Math.min(4, Math.max(0, ((growth + 1) / 2) * 4));
  const feedbackLabel =
    feedbackAverage === null ? "—" : feedbackAverage.toFixed(1);
  const feedbackSubtitle = `На основе ${feedbackResponseCount} ответов`;

  const metrics = (
    <>
      <MetricRow
        title="Оценка компетенций"
        subtitle={expectedSubtitle}
        ringValue={average}
        label={avgLabel}
        iconSrc={METRIC_ICONS.average}
        iconAlt=""
      />
      <MetricRow
        title="Динамика"
        subtitle={dynamicsSubtitle}
        ringValue={growthRingValue}
        label={growthLabel}
        iconSrc={METRIC_ICONS.dynamics}
        iconAlt=""
      />
      <MetricRow
        title="Обратная связь"
        subtitle={feedbackSubtitle}
        ringValue={feedbackAverage}
        label={feedbackLabel}
        maxScore={10}
        iconSrc={METRIC_ICONS.feedback}
        iconAlt=""
      />
    </>
  );

  if (variant === "sidebar") {
    return (
      <section
        className={`flex w-[368px] shrink-0 flex-col gap-6 self-stretch rounded-[24px] bg-[#F2F3F5] p-6 ${className}`}
      >
        {metrics}
      </section>
    );
  }

  return (
    <section className={className}>
      <h2 className="font-sf text-base font-semibold leading-6 text-[rgba(3,3,6,0.88)]">
        Оценка дизайнера
      </h2>
      <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-3">{metrics}</div>
    </section>
  );
}
