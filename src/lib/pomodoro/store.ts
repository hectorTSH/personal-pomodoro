import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  type Phase,
  type PresetId,
  type Settings,
  type Task,
  DEFAULT_SETTINGS,
  PRESETS,
  clamp,
  durationMs,
  phaseLabel,
  todayKey,
} from "./types";
import { notifyPhaseComplete, playChime, unlockAudio } from "./sound";

export interface PomodoroState {
  phase: Phase;
  remainingMs: number;
  isRunning: boolean;
  endAt: number | null;
  completedToday: number;
  countDate: string;
  cycleIndex: number;
  tasks: Task[];
  activeTaskId: string | null;
  settings: Settings;
  justCompleted: boolean;

  start: () => void;
  pause: () => void;
  toggle: () => void;
  reset: () => void;
  skip: () => void;
  tick: () => void;
  setWorkMinutes: (n: number) => void;
  setShortBreakMinutes: (n: number) => void;
  setLongBreakMinutes: (n: number) => void;
  setSessionsUntilLongBreak: (n: number) => void;
  setSoundEnabled: (on: boolean) => void;
  setAutoStart: (on: boolean) => void;
  applyPreset: (id: PresetId) => void;
  addTask: (text: string) => void;
  toggleTask: (id: string) => void;
  removeTask: (id: string) => void;
  setActiveTask: (id: string | null) => void;
  clearCompleted: () => void;
  rehydrateClock: () => void;
  consumeJustCompleted: () => void;
}

function nextPhase(
  phase: Phase,
  cycleIndex: number,
  untilLong: number,
  countWork: boolean,
): { phase: Phase; cycleIndex: number } {
  if (phase !== "work") {
    return { phase: "work", cycleIndex };
  }
  if (!countWork) {
    return { phase: "shortBreak", cycleIndex };
  }
  const nextIndex = cycleIndex + 1;
  if (nextIndex >= untilLong) {
    return { phase: "longBreak", cycleIndex: 0 };
  }
  return { phase: "shortBreak", cycleIndex: nextIndex };
}

function isFreshInterval(state: Pick<PomodoroState, "phase" | "remainingMs" | "settings">): boolean {
  return state.remainingMs === durationMs(state.phase, state.settings);
}

function applyDurationIfFresh(
  state: PomodoroState,
  nextSettings: Settings,
): Pick<PomodoroState, "settings" | "remainingMs"> {
  if (!state.isRunning && isFreshInterval(state)) {
    const phaseMinutesKey: Record<Phase, keyof Pick<Settings, "workMinutes" | "shortBreakMinutes" | "longBreakMinutes">> = {
      work: "workMinutes",
      shortBreak: "shortBreakMinutes",
      longBreak: "longBreakMinutes",
    };
    const key = phaseMinutesKey[state.phase];
    if (state.settings[key] !== nextSettings[key]) {
      return { settings: nextSettings, remainingMs: durationMs(state.phase, nextSettings) };
    }
  }
  return { settings: nextSettings, remainingMs: state.remainingMs };
}

function finishPhase(state: PomodoroState, opts: { forcePause: boolean; skipped: boolean }): Partial<PomodoroState> {
  let completedToday = state.completedToday;
  let cycleIndex = state.cycleIndex;
  if (state.phase === "work" && !opts.skipped) {
    completedToday += 1;
  }
  const next = nextPhase(
    state.phase,
    cycleIndex,
    state.settings.sessionsUntilLongBreak,
    state.phase === "work" && !opts.skipped,
  );
  cycleIndex = next.cycleIndex;

  const auto = state.settings.autoStart && !opts.forcePause;
  const remainingMs = durationMs(next.phase, state.settings);

  if (!opts.skipped && state.settings.soundEnabled) {
    playChime();
  }
  if (!opts.skipped) {
    const doneFocus = state.phase === "work";
    notifyPhaseComplete(
      doneFocus ? "Still — focus complete" : "Still — break over",
      doneFocus
        ? `${phaseLabel(next.phase)} · ${Math.round(remainingMs / 60_000)} min`
        : "Ready for the next focus block",
    );
  }

  return {
    phase: next.phase,
    cycleIndex,
    completedToday,
    remainingMs,
    isRunning: auto,
    endAt: auto ? Date.now() + remainingMs : null,
    justCompleted: !opts.skipped,
  };
}

export const usePomodoro = create<PomodoroState>()(
  persist(
    (set, get) => ({
      phase: "work",
      remainingMs: durationMs("work", DEFAULT_SETTINGS),
      isRunning: false,
      endAt: null,
      completedToday: 0,
      countDate: todayKey(),
      cycleIndex: 0,
      tasks: [],
      activeTaskId: null,
      settings: DEFAULT_SETTINGS,
      justCompleted: false,

      start: () => {
        const s = get();
        if (s.isRunning) return;
        unlockAudio();
        const remaining = s.remainingMs > 0 ? s.remainingMs : durationMs(s.phase, s.settings);
        set({
          isRunning: true,
          remainingMs: remaining,
          endAt: Date.now() + remaining,
        });
      },

      pause: () => {
        const s = get();
        if (!s.isRunning) return;
        const remaining = s.endAt ? Math.max(0, s.endAt - Date.now()) : s.remainingMs;
        set({ isRunning: false, remainingMs: remaining, endAt: null });
      },

      toggle: () => {
        const s = get();
        if (s.isRunning) s.pause();
        else s.start();
      },

      reset: () => {
        const s = get();
        set({
          isRunning: false,
          endAt: null,
          remainingMs: durationMs(s.phase, s.settings),
          justCompleted: false,
        });
      },

      skip: () => {
        set((s) => finishPhase(s, { forcePause: true, skipped: true }));
      },

      tick: () => {
        const s = get();
        if (s.countDate !== todayKey()) {
          set({ completedToday: 0, countDate: todayKey() });
        }
        const current = get();
        if (!current.isRunning || current.endAt == null) return;
        const remaining = current.endAt - Date.now();
        if (remaining <= 0) {
          set(finishPhase(current, { forcePause: false, skipped: false }));
          return;
        }
        set({ remainingMs: remaining });
      },

      setWorkMinutes: (n) => {
        set((s) => applyDurationIfFresh(s, { ...s.settings, workMinutes: clamp(Math.round(n), 1, 90) }));
      },
      setShortBreakMinutes: (n) => {
        set((s) => applyDurationIfFresh(s, { ...s.settings, shortBreakMinutes: clamp(Math.round(n), 1, 30) }));
      },
      setLongBreakMinutes: (n) => {
        set((s) => applyDurationIfFresh(s, { ...s.settings, longBreakMinutes: clamp(Math.round(n), 1, 45) }));
      },
      setSessionsUntilLongBreak: (n) => {
        set((s) => ({
          settings: { ...s.settings, sessionsUntilLongBreak: clamp(Math.round(n), 2, 8) },
        }));
      },
      setSoundEnabled: (on) => {
        if (on) unlockAudio();
        set((s) => ({ settings: { ...s.settings, soundEnabled: on } }));
      },
      setAutoStart: (on) => {
        set((s) => ({ settings: { ...s.settings, autoStart: on } }));
      },
      applyPreset: (id) => {
        const preset = PRESETS[id];
        set((s) => {
          const nextSettings: Settings = {
            ...s.settings,
            workMinutes: preset.workMinutes,
            shortBreakMinutes: preset.shortBreakMinutes,
            longBreakMinutes: preset.longBreakMinutes,
            sessionsUntilLongBreak: preset.sessionsUntilLongBreak,
          };
          if (s.isRunning) return { settings: nextSettings };
          return {
            settings: nextSettings,
            remainingMs: durationMs(s.phase, nextSettings),
            endAt: null,
          };
        });
      },

      addTask: (text) => {
        const trimmed = text.trim();
        if (!trimmed) return;
        const task: Task = {
          id: crypto.randomUUID(),
          text: trimmed,
          done: false,
        };
        set((s) => ({
          tasks: [...s.tasks, task],
          activeTaskId: s.activeTaskId ?? task.id,
        }));
      },
      toggleTask: (id) => {
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
        }));
      },
      removeTask: (id) => {
        set((s) => ({
          tasks: s.tasks.filter((t) => t.id !== id),
          activeTaskId: s.activeTaskId === id ? null : s.activeTaskId,
        }));
      },
      setActiveTask: (id) => set({ activeTaskId: id }),
      clearCompleted: () => {
        set((s) => ({
          tasks: s.tasks.filter((t) => !t.done),
          activeTaskId:
            s.activeTaskId && s.tasks.find((t) => t.id === s.activeTaskId && t.done)
              ? null
              : s.activeTaskId,
        }));
      },

      rehydrateClock: () => {
        const s = get();
        const date = todayKey();
        const datePatch = s.countDate !== date ? { completedToday: 0, countDate: date } : {};
        if (s.isRunning && s.endAt != null) {
          const remaining = s.endAt - Date.now();
          if (remaining <= 0) {
            set({
              ...datePatch,
              ...finishPhase({ ...s, ...datePatch }, { forcePause: true, skipped: false }),
            });
            return;
          }
          set({ ...datePatch, remainingMs: remaining });
          return;
        }
        if (Object.keys(datePatch).length) set(datePatch);
      },

      consumeJustCompleted: () => set({ justCompleted: false }),
    }),
    {
      name: "still-pomodoro",
      version: 1,
      partialize: (s) => ({
        phase: s.phase,
        remainingMs: s.remainingMs,
        isRunning: s.isRunning,
        endAt: s.endAt,
        completedToday: s.completedToday,
        countDate: s.countDate,
        cycleIndex: s.cycleIndex,
        tasks: s.tasks,
        activeTaskId: s.activeTaskId,
        settings: s.settings,
      }),
      onRehydrateStorage: () => (state) => {
        state?.rehydrateClock();
      },
    },
  ),
);
