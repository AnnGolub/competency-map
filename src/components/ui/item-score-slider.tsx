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

    const handlePointerMove = (clientX: number, rect: DOMRect) => {
      const x = clientX - rect.left;
      const ratio = Math.min(1, Math.max(0, x / rect.width));
      const raw = 1 + ratio * 3;
      const snapped = Math.round(raw / 0.5) * 0.5;
      onChange(Math.min(4, Math.max(1, snapped)));
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      const rect = e.currentTarget.getBoundingClientRect();
      handlePointerMove(e.clientX, rect);

      const onMove = (me: MouseEvent) => handlePointerMove(me.clientX, rect);
      const onUp = () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    };

    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const onMove = (te: TouchEvent) => {
        handlePointerMove(te.touches[0].clientX, rect);
      };
      const onEnd = () => {
        window.removeEventListener("touchmove", onMove);
        window.removeEventListener("touchend", onEnd);
      };
      window.addEventListener("touchmove", onMove);
      window.addEventListener("touchend", onEnd);
    };

    return (
      <div style={{ display: "flex", flexDirection: "column" }}>
        <p style={{ paddingBottom: "6px", fontSize: "14px", lineHeight: "18px", color: "#8F90A6" }}>
          {label}
        </p>
        {helperContent}
        <div
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          style={{
            position: "relative",
            height: "48px",
            background: "#3E4153",
            borderRadius: "12px",
            cursor: "pointer",
          }}
        >
          {/* Трек внизу */}
          <div style={{
            position: "absolute",
            bottom: "0",
            left: "12px",
            right: "12px",
            height: "2px",
            background: "#8F90A6",
            borderRadius: "8px",
            pointerEvents: "none",
          }}>
            {/* Красная заливка до thumb */}
            <div style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: `${thumbPercent}%`,
              height: "2px",
              background: "#E53535",
              borderRadius: "8px",
              pointerEvents: "none",
            }} />
            {/* Thumb */}
            <div style={{
              position: "absolute",
              top: "50%",
              left: `${thumbPercent}%`,
              transform: "translate(-50%, -50%)",
              width: "16px",
              height: "16px",
              borderRadius: "50%",
              background: "#E53535",
              pointerEvents: "none",
            }} />
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", paddingLeft: "12px", paddingRight: "12px", paddingTop: "6px" }}>
          {SCORE_OPTIONS.map((v) => (
            <span key={v} style={{ color: "#8F90A6", fontSize: "14px", lineHeight: "18px", fontWeight: 400, fontVariantNumeric: "tabular-nums" }}>
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
