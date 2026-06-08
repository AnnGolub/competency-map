"use client";

import type { ReactNode } from "react";
import { SCORE_OPTIONS } from "@/lib/competency-utils";

export function ItemScoreSlider({
  id, label, value, onChange, expected, helperContent,
  theme = "light", variant = "default",
}: {
  id: string; label: string; value: number;
  onChange: (value: number) => void;
  expected?: number | null;
  helperContent?: ReactNode;
  theme?: "light" | "dark";
  variant?: "default" | "review";
}) {
  if (variant === "review") {
    const thumbPercent = ((value - 1) / 3) * 100;

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      const el = e.currentTarget;

      const updateFromEvent = (clientX: number) => {
        const rect = el.getBoundingClientRect();
        const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
        const ratio = x / rect.width;
        const raw = 1 + ratio * 3;
        const snapped = Math.round(raw / 0.5) * 0.5;
        onChange(Math.min(4, Math.max(1, snapped)));
      };

      updateFromEvent(e.clientX);

      const onMove = (me: MouseEvent) => updateFromEvent(me.clientX);
      const onUp = () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    };

    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
      const el = e.currentTarget;

      const updateFromEvent = (clientX: number) => {
        const rect = el.getBoundingClientRect();
        const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
        const ratio = x / rect.width;
        const raw = 1 + ratio * 3;
        const snapped = Math.round(raw / 0.5) * 0.5;
        onChange(Math.min(4, Math.max(1, snapped)));
      };

      updateFromEvent(e.touches[0].clientX);

      const onMove = (te: TouchEvent) => updateFromEvent(te.touches[0].clientX);
      const onEnd = () => {
        window.removeEventListener("touchmove", onMove);
        window.removeEventListener("touchend", onEnd);
      };
      window.addEventListener("touchmove", onMove);
      window.addEventListener("touchend", onEnd);
    };

    return (
      <div className="flex flex-col">
        <p className="font-sf pb-1.5 text-sm leading-[18px] text-[rgba(4,4,19,0.55)]">
          {label}
        </p>
        {helperContent}
        <div
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          className="relative h-12 cursor-pointer rounded-xl bg-white"
        >
          <span className="pointer-events-none absolute left-3 top-2.5 text-base tabular-nums leading-6 text-[rgba(3,3,6,0.88)]">
            {value.toFixed(1)}
          </span>
          <div className="pointer-events-none absolute bottom-0 left-3 right-3 h-0.5 rounded-lg bg-[#E0E0E0]">
            <div
              className="absolute left-0 top-0 h-0.5 rounded-lg bg-[#212124]"
              style={{ width: `${thumbPercent}%` }}
            />
            <div
              className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#E53535] transition-[left] duration-75 ease-out"
              style={{ left: `${thumbPercent}%` }}
            />
          </div>
        </div>
        <div className="flex justify-between px-3 pt-1.5">
          {SCORE_OPTIONS.map((v) => (
            <span
              key={v}
              className="font-sf text-sm tabular-nums leading-[18px] text-[rgba(4,4,19,0.55)]"
            >
              {v % 1 === 0 ? v.toFixed(0) : v.toFixed(1)}
            </span>
          ))}
        </div>
      </div>
    );
  }

  const isDark = theme === "dark";
  const shell = isDark ? "mt-3 rounded-lg border border-app-border bg-app-canvas p-3" : "mt-3 rounded-lg border-[0.5px] border-neutral-100 bg-neutral-50/50 p-3";
  const labelCls = isDark ? "text-sm text-white/90" : "text-sm text-neutral-700";
  const expectedCls = isDark ? "text-xs text-app-muted" : "text-xs text-neutral-400";
  const valueCls = isDark ? "text-lg font-medium tabular-nums text-white" : "text-lg font-medium tabular-nums";
  const tickCls = isDark ? "text-xs text-app-muted" : "text-xs text-neutral-400";
  const accent = isDark ? "accent-app-accent" : "accent-neutral-900";

  return (
    <div className={shell}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className={labelCls}>{label}</p>
        {expected !== null && expected !== undefined ? (
          <span className={expectedCls}>ожидается {expected.toFixed(1)}</span>
        ) : null}
      </div>
      <div className="mt-3 flex items-center justify-end gap-4">
        <label htmlFor={id} className="sr-only">{label}</label>
        <span className={valueCls}>{value.toFixed(1)}</span>
      </div>
      <input id={id} type="range" min={1} max={4} step={0.5} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className={`mt-2 w-full ${accent}`} list={`ticks-${id}`} />
      <datalist id={`ticks-${id}`}>
        {SCORE_OPTIONS.map((v) => <option key={v} value={v} />)}
      </datalist>
      <div className={`mt-1 flex justify-between ${tickCls}`}>
        {SCORE_OPTIONS.map((v) => <span key={v}>{v.toFixed(1)}</span>)}
      </div>
    </div>
  );
}
