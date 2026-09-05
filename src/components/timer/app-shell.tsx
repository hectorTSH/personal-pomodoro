import { useEffect, useState } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { durationMs, phaseLabel } from "@/lib/pomodoro/types";
import { formatMs } from "@/lib/pomodoro/format";
import { usePomodoro } from "@/lib/pomodoro/store";
import { cn } from "@/lib/utils";
import { Controls } from "./controls";
import { ProgressRing } from "./progress-ring";
import { SessionPips } from "./session-pips";
import { SettingsPanel } from "./settings-panel";
import { ActiveTaskCaption, TaskList } from "./task-list";

function TimerTicker() {
  const isRunning = usePomodoro((s) => s.isRunning);
  const tick = usePomodoro((s) => s.tick);

  useEffect(() => {
    if (!isRunning) return;
    tick();
    const id = window.setInterval(tick, 200);
    const onVis = () => tick();
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("focus", onVis);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("focus", onVis);
    };
  }, [isRunning, tick]);

  return null;
}

function TitleSync() {
  const remainingMs = usePomodoro((s) => s.remainingMs);
  const isRunning = usePomodoro((s) => s.isRunning);
  const phase = usePomodoro((s) => s.phase);

  useEffect(() => {
    const time = formatMs(remainingMs);
    const label = phaseLabel(phase);
    document.title = isRunning ? `${time} · ${label} · Still` : "Still";
    return () => {
      document.title = "Still";
    };
  }, [remainingMs, isRunning, phase]);

  return null;
}

function KeyboardShortcuts() {
  const toggle = usePomodoro((s) => s.toggle);
  const reset = usePomodoro((s) => s.reset);
  const skip = usePomodoro((s) => s.skip);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (target) {
        const tag = target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable) {
          return;
        }
      }
      if (e.code === "Space" || e.key === " ") {
        e.preventDefault();
        toggle();
        return;
      }
      if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        reset();
        return;
      }
      if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        skip();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle, reset, skip]);

  return null;
}

function CompletionPulse() {
  const justCompleted = usePomodoro((s) => s.justCompleted);
  const consume = usePomodoro((s) => s.consumeJustCompleted);

  useEffect(() => {
    if (!justCompleted) return;
    const id = window.setTimeout(consume, 700);
    return () => window.clearTimeout(id);
  }, [justCompleted, consume]);

  return null;
}

function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const unsub = usePomodoro.persist.onFinishHydration(() => setHydrated(true));
    if (usePomodoro.persist.hasHydrated()) setHydrated(true);
    return unsub;
  }, []);
  return hydrated;
}

export function StillApp() {
  const phase = usePomodoro((s) => s.phase);
  const remainingMs = usePomodoro((s) => s.remainingMs);
  const isRunning = usePomodoro((s) => s.isRunning);
  const settings = usePomodoro((s) => s.settings);
  const cycleIndex = usePomodoro((s) => s.cycleIndex);
  const completedToday = usePomodoro((s) => s.completedToday);
  const justCompleted = usePomodoro((s) => s.justCompleted);
  const hydrated = useHydrated();

  const total = durationMs(phase, settings);
  const progress = total > 0 ? 1 - remainingMs / total : 0;
  const isBreak = phase !== "work";
  const isFresh = remainingMs === total;
  const status = isRunning
    ? isBreak
      ? "On a break"
      : "Focusing"
    : isFresh
      ? phase === "shortBreak"
        ? "Short break"
        : phase === "longBreak"
          ? "Long break"
          : "Ready"
      : "Paused";

  return (
    <TooltipProvider delayDuration={400}>
      <TimerTicker />
      <TitleSync />
      <KeyboardShortcuts />
      <CompletionPulse />

      <div className="relative mx-auto flex min-h-dvh w-full max-w-5xl flex-col px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <header className="mb-8 flex items-baseline justify-between gap-4">
          <div>
            <p className="text-xs font-medium tracking-[0.22em] text-muted-foreground uppercase">Interval timer</p>
            <h1 className="font-display text-3xl font-medium tracking-tight text-foreground">Still</h1>
          </div>
          <p className="text-right text-xs text-muted-foreground">
            Space start
            <span className="mx-1.5 text-foreground/20">·</span>
            R reset
            <span className="hidden sm:inline">
              <span className="mx-1.5 text-foreground/20">·</span>
              N skip
            </span>
          </p>
        </header>

        <div className="grid flex-1 grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "relative size-64 sm:size-72",
                justCompleted && "animate-[still-pulse_0.6s_var(--ease-out)]",
              )}
            >
              <ProgressRing progress={hydrated ? progress : 0} phase={phase} running={isRunning} />
              <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
                <span
                  className={cn(
                    "font-display text-5xl font-medium tracking-tight text-foreground tabular-nums sm:text-6xl",
                    "transition-opacity duration-[length:var(--motion-quick)]",
                    isRunning ? "opacity-100" : "opacity-80",
                  )}
                  aria-hidden="true"
                >
                  {formatMs(hydrated ? remainingMs : total)}
                </span>
                <span
                  className={cn(
                    "mt-2 text-xs font-medium tracking-[0.2em] uppercase transition-colors duration-[length:var(--motion-fast)]",
                    isBreak ? "text-break" : "text-muted-foreground",
                    isRunning && !isBreak && "text-foreground",
                  )}
                >
                  {status}
                </span>
              </div>
            </div>

            <div className="sr-only" aria-live="polite">
              {status}. {phaseLabel(phase)}. {formatMs(remainingMs)} remaining.
            </div>

            <div className="mt-5">
              <ActiveTaskCaption />
            </div>

            <div className="mt-6">
              <Controls />
            </div>

            <div className="mt-8">
              <SessionPips
                total={settings.sessionsUntilLongBreak}
                filled={cycleIndex}
                today={completedToday}
              />
            </div>
          </div>

          <div className="flex w-full flex-col gap-8 lg:sticky lg:top-8">
            <SettingsPanel />
            <TaskList />
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
