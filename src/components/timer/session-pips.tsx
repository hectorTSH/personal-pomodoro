import { cn } from "@/lib/utils";

interface SessionPipsProps {
  total: number;
  filled: number;
  today: number;
}

export function SessionPips({ total, filled, today }: SessionPipsProps) {
  const count = Math.max(2, Math.min(8, total));
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-2" role="img" aria-label={`${filled} of ${count} in this cycle`}>
        {Array.from({ length: count }, (_, i) => {
          const on = i < filled;
          return (
            <span
              key={i}
              className={cn(
                "block size-2.5 rounded-full transition-[background-color,box-shadow,transform] duration-[length:var(--motion-fast)] ease-[var(--ease-out)]",
                on
                  ? "bg-work scale-100"
                  : "bg-transparent shadow-[inset_0_0_0_1.5px_color-mix(in_oklab,var(--color-foreground)_28%,transparent)]",
              )}
            />
          );
        })}
      </div>
      <p className="text-sm text-muted-foreground tabular-nums">
        {today === 0 ? "No sessions yet today" : `${today} focused today`}
      </p>
    </div>
  );
}
