import { cn } from "@/lib/utils";
import type { Phase } from "@/lib/pomodoro/types";

interface ProgressRingProps {
  progress: number;
  phase: Phase;
  running: boolean;
  className?: string;
}

const SIZE = 288;
const STROKE = 7;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ProgressRing({ progress, phase, running, className }: ProgressRingProps) {
  const clamped = Math.min(1, Math.max(0, progress));
  const offset = CIRCUMFERENCE * (1 - clamped);
  const isBreak = phase !== "work";

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className={cn(
        "size-full -rotate-90 transition-opacity duration-[length:var(--motion-fast)] ease-[var(--ease-out)]",
        running ? "opacity-100" : "opacity-70",
        className,
      )}
      aria-hidden="true"
    >
      <circle
        cx={SIZE / 2}
        cy={SIZE / 2}
        r={RADIUS}
        fill="none"
        className={isBreak ? "stroke-break/25" : "stroke-foreground/10"}
        strokeWidth={STROKE}
      />
      <circle
        cx={SIZE / 2}
        cy={SIZE / 2}
        r={RADIUS}
        fill="none"
        className={isBreak ? "stroke-break" : "stroke-work"}
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={offset}
        style={{
          transitionProperty: "stroke-dashoffset, stroke",
          transitionDuration: "var(--motion-fast)",
          transitionTimingFunction: "var(--ease-out)",
        }}
      />
    </svg>
  );
}
