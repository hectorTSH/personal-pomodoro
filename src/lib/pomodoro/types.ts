export type Phase = "work" | "shortBreak" | "longBreak";

export type PresetId = "classic" | "deep" | "sprint";

export interface Task {
  id: string;
  text: string;
  done: boolean;
}

export interface Settings {
  workMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  sessionsUntilLongBreak: number;
  soundEnabled: boolean;
  autoStart: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  workMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  sessionsUntilLongBreak: 4,
  soundEnabled: true,
  autoStart: false,
};

export const PRESETS: Record<
  PresetId,
  Pick<
    Settings,
    | "workMinutes"
    | "shortBreakMinutes"
    | "longBreakMinutes"
    | "sessionsUntilLongBreak"
  > & { label: string; hint: string }
> = {
  classic: {
    label: "Classic",
    hint: "25 · 5 · 15",
    workMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    sessionsUntilLongBreak: 4,
  },
  deep: {
    label: "Deep",
    hint: "50 · 10 · 20",
    workMinutes: 50,
    shortBreakMinutes: 10,
    longBreakMinutes: 20,
    sessionsUntilLongBreak: 3,
  },
  sprint: {
    label: "Sprint",
    hint: "15 · 3 · 10",
    workMinutes: 15,
    shortBreakMinutes: 3,
    longBreakMinutes: 10,
    sessionsUntilLongBreak: 4,
  },
};

export function todayKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function durationMs(phase: Phase, settings: Settings): number {
  const minutes =
    phase === "work"
      ? settings.workMinutes
      : phase === "shortBreak"
        ? settings.shortBreakMinutes
        : settings.longBreakMinutes;
  return minutes * 60_000;
}

export function phaseLabel(phase: Phase): string {
  if (phase === "work") return "Focus";
  if (phase === "shortBreak") return "Short break";
  return "Long break";
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}
