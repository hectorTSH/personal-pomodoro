import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as Trash2, c as Plus, d as Minus, f as Check, l as Play, n as VolumeX, o as SkipForward, r as Volume2, s as RotateCcw, t as X, u as Pause } from "../_libs/lucide-react.mjs";
import { i as Slot } from "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import { n as SwitchThumb, t as Switch$1 } from "../_libs/@radix-ui/react-switch+[...].mjs";
import { a as Trigger, i as Root3, n as Portal, r as Provider, t as Content2 } from "../_libs/@radix-ui/react-tooltip+[...].mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
import { t as Root } from "../_libs/radix-ui__react-label.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-4jcms7Av.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var TooltipProvider = Provider;
var Tooltip = Root3;
var TooltipTrigger = Trigger;
var TooltipContent = import_react.forwardRef(({ className, sideOffset = 8, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
	ref,
	sideOffset,
	className: cn("z-50 origin-[--radix-tooltip-content-transform-origin] overflow-hidden rounded-md bg-foreground px-2.5 py-1.5 text-xs text-background shadow-sm animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95", className),
	...props
}) }));
TooltipContent.displayName = Content2.displayName;
var DEFAULT_SETTINGS = {
	workMinutes: 25,
	shortBreakMinutes: 5,
	longBreakMinutes: 15,
	sessionsUntilLongBreak: 4,
	soundEnabled: true,
	autoStart: false
};
var PRESETS = {
	classic: {
		label: "Classic",
		hint: "25 · 5 · 15",
		workMinutes: 25,
		shortBreakMinutes: 5,
		longBreakMinutes: 15,
		sessionsUntilLongBreak: 4
	},
	deep: {
		label: "Deep",
		hint: "50 · 10 · 20",
		workMinutes: 50,
		shortBreakMinutes: 10,
		longBreakMinutes: 20,
		sessionsUntilLongBreak: 3
	},
	sprint: {
		label: "Sprint",
		hint: "15 · 3 · 10",
		workMinutes: 15,
		shortBreakMinutes: 3,
		longBreakMinutes: 10,
		sessionsUntilLongBreak: 4
	}
};
function todayKey(date = /* @__PURE__ */ new Date()) {
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function durationMs(phase, settings) {
	return (phase === "work" ? settings.workMinutes : phase === "shortBreak" ? settings.shortBreakMinutes : settings.longBreakMinutes) * 6e4;
}
function phaseLabel(phase) {
	if (phase === "work") return "Focus";
	if (phase === "shortBreak") return "Short break";
	return "Long break";
}
function clamp(n, min, max) {
	return Math.min(max, Math.max(min, n));
}
function formatMs(ms) {
	const total = Math.max(0, Math.floor(ms / 1e3));
	const m = Math.floor(total / 60);
	const s = total % 60;
	return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
var ctx = null;
function getCtx() {
	if (typeof window === "undefined") return null;
	if (!ctx) {
		const Ctor = window.AudioContext || window.webkitAudioContext;
		if (!Ctor) return null;
		ctx = new Ctor();
	}
	return ctx;
}
function unlockAudio() {
	const audio = getCtx();
	if (!audio) return;
	if (audio.state === "suspended") audio.resume();
}
function tone(audio, freq, time, duration, gain) {
	const osc = audio.createOscillator();
	const amp = audio.createGain();
	osc.type = "sine";
	osc.frequency.value = freq;
	amp.gain.setValueAtTime(0, time);
	amp.gain.linearRampToValueAtTime(gain, time + .018);
	amp.gain.exponentialRampToValueAtTime(1e-4, time + duration);
	osc.connect(amp);
	amp.connect(audio.destination);
	osc.start(time);
	osc.stop(time + duration + .04);
}
/** Soft C-major arpeggio — calm, not an alarm. */
function playChime() {
	try {
		unlockAudio();
		const audio = getCtx();
		if (!audio) return;
		const t0 = audio.currentTime + .02;
		tone(audio, 523.25, t0, .55, .07);
		tone(audio, 659.25, t0 + .2, .7, .06);
		tone(audio, 783.99, t0 + .44, .9, .05);
	} catch {}
}
function notifyPhaseComplete(title, body) {
	try {
		if (typeof Notification === "undefined") return;
		if (Notification.permission !== "granted") return;
		if (typeof document !== "undefined" && !document.hidden) return;
		new Notification(title, {
			body,
			silent: true
		});
	} catch {}
}
function requestNotifyPermission() {
	try {
		if (typeof Notification === "undefined") return;
		if (Notification.permission === "default") Notification.requestPermission();
	} catch {}
}
function nextPhase(phase, cycleIndex, untilLong, countWork) {
	if (phase !== "work") return {
		phase: "work",
		cycleIndex
	};
	if (!countWork) return {
		phase: "shortBreak",
		cycleIndex
	};
	const nextIndex = cycleIndex + 1;
	if (nextIndex >= untilLong) return {
		phase: "longBreak",
		cycleIndex: 0
	};
	return {
		phase: "shortBreak",
		cycleIndex: nextIndex
	};
}
function isFreshInterval(state) {
	return state.remainingMs === durationMs(state.phase, state.settings);
}
function applyDurationIfFresh(state, nextSettings) {
	if (!state.isRunning && isFreshInterval(state)) {
		const key = {
			work: "workMinutes",
			shortBreak: "shortBreakMinutes",
			longBreak: "longBreakMinutes"
		}[state.phase];
		if (state.settings[key] !== nextSettings[key]) return {
			settings: nextSettings,
			remainingMs: durationMs(state.phase, nextSettings)
		};
	}
	return {
		settings: nextSettings,
		remainingMs: state.remainingMs
	};
}
function finishPhase(state, opts) {
	let completedToday = state.completedToday;
	let cycleIndex = state.cycleIndex;
	if (state.phase === "work" && !opts.skipped) completedToday += 1;
	const next = nextPhase(state.phase, cycleIndex, state.settings.sessionsUntilLongBreak, state.phase === "work" && !opts.skipped);
	cycleIndex = next.cycleIndex;
	const auto = state.settings.autoStart && !opts.forcePause;
	const remainingMs = durationMs(next.phase, state.settings);
	if (!opts.skipped && state.settings.soundEnabled) playChime();
	if (!opts.skipped) {
		const doneFocus = state.phase === "work";
		notifyPhaseComplete(doneFocus ? "Still — focus complete" : "Still — break over", doneFocus ? `${phaseLabel(next.phase)} · ${Math.round(remainingMs / 6e4)} min` : "Ready for the next focus block");
	}
	return {
		phase: next.phase,
		cycleIndex,
		completedToday,
		remainingMs,
		isRunning: auto,
		endAt: auto ? Date.now() + remainingMs : null,
		justCompleted: !opts.skipped
	};
}
var usePomodoro = create()(persist((set, get) => ({
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
			endAt: Date.now() + remaining
		});
	},
	pause: () => {
		const s = get();
		if (!s.isRunning) return;
		set({
			isRunning: false,
			remainingMs: s.endAt ? Math.max(0, s.endAt - Date.now()) : s.remainingMs,
			endAt: null
		});
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
			justCompleted: false
		});
	},
	skip: () => {
		set((s) => finishPhase(s, {
			forcePause: true,
			skipped: true
		}));
	},
	tick: () => {
		if (get().countDate !== todayKey()) set({
			completedToday: 0,
			countDate: todayKey()
		});
		const current = get();
		if (!current.isRunning || current.endAt == null) return;
		const remaining = current.endAt - Date.now();
		if (remaining <= 0) {
			set(finishPhase(current, {
				forcePause: false,
				skipped: false
			}));
			return;
		}
		set({ remainingMs: remaining });
	},
	setWorkMinutes: (n) => {
		set((s) => applyDurationIfFresh(s, {
			...s.settings,
			workMinutes: clamp(Math.round(n), 1, 90)
		}));
	},
	setShortBreakMinutes: (n) => {
		set((s) => applyDurationIfFresh(s, {
			...s.settings,
			shortBreakMinutes: clamp(Math.round(n), 1, 30)
		}));
	},
	setLongBreakMinutes: (n) => {
		set((s) => applyDurationIfFresh(s, {
			...s.settings,
			longBreakMinutes: clamp(Math.round(n), 1, 45)
		}));
	},
	setSessionsUntilLongBreak: (n) => {
		set((s) => ({ settings: {
			...s.settings,
			sessionsUntilLongBreak: clamp(Math.round(n), 2, 8)
		} }));
	},
	setSoundEnabled: (on) => {
		if (on) unlockAudio();
		set((s) => ({ settings: {
			...s.settings,
			soundEnabled: on
		} }));
	},
	setAutoStart: (on) => {
		set((s) => ({ settings: {
			...s.settings,
			autoStart: on
		} }));
	},
	applyPreset: (id) => {
		const preset = PRESETS[id];
		set((s) => {
			const nextSettings = {
				...s.settings,
				workMinutes: preset.workMinutes,
				shortBreakMinutes: preset.shortBreakMinutes,
				longBreakMinutes: preset.longBreakMinutes,
				sessionsUntilLongBreak: preset.sessionsUntilLongBreak
			};
			if (s.isRunning) return { settings: nextSettings };
			return {
				settings: nextSettings,
				remainingMs: durationMs(s.phase, nextSettings),
				endAt: null
			};
		});
	},
	addTask: (text) => {
		const trimmed = text.trim();
		if (!trimmed) return;
		const task = {
			id: crypto.randomUUID(),
			text: trimmed,
			done: false
		};
		set((s) => ({
			tasks: [...s.tasks, task],
			activeTaskId: s.activeTaskId ?? task.id
		}));
	},
	toggleTask: (id) => {
		set((s) => ({ tasks: s.tasks.map((t) => t.id === id ? {
			...t,
			done: !t.done
		} : t) }));
	},
	removeTask: (id) => {
		set((s) => ({
			tasks: s.tasks.filter((t) => t.id !== id),
			activeTaskId: s.activeTaskId === id ? null : s.activeTaskId
		}));
	},
	setActiveTask: (id) => set({ activeTaskId: id }),
	clearCompleted: () => {
		set((s) => ({
			tasks: s.tasks.filter((t) => !t.done),
			activeTaskId: s.activeTaskId && s.tasks.find((t) => t.id === s.activeTaskId && t.done) ? null : s.activeTaskId
		}));
	},
	rehydrateClock: () => {
		const s = get();
		const date = todayKey();
		const datePatch = s.countDate !== date ? {
			completedToday: 0,
			countDate: date
		} : {};
		if (s.isRunning && s.endAt != null) {
			const remaining = s.endAt - Date.now();
			if (remaining <= 0) {
				set({
					...datePatch,
					...finishPhase({
						...s,
						...datePatch
					}, {
						forcePause: true,
						skipped: false
					})
				});
				return;
			}
			set({
				...datePatch,
				remainingMs: remaining
			});
			return;
		}
		if (Object.keys(datePatch).length) set(datePatch);
	},
	consumeJustCompleted: () => set({ justCompleted: false })
}), {
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
		settings: s.settings
	}),
	onRehydrateStorage: () => (state) => {
		state?.rehydrateClock();
	}
}));
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium outline-none select-none transition-[color,background-color,box-shadow,transform,opacity] duration-[length:var(--motion-quick)] ease-[var(--ease-out)] focus-visible:ring-2 focus-visible:ring-ring/70 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:not-disabled:scale-[0.96]", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground hover:bg-primary/90",
			secondary: "bg-card text-foreground shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)] hover:bg-card-hover",
			ghost: "text-muted-foreground hover:bg-foreground/5 hover:text-foreground",
			outline: "bg-transparent text-foreground shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)] hover:bg-foreground/5"
		},
		size: {
			default: "h-11 rounded-lg px-4",
			sm: "h-9 rounded-md px-3 text-sm",
			lg: "h-12 rounded-xl px-6",
			pill: "h-12 rounded-full px-7 text-base",
			icon: "size-11 rounded-lg",
			"icon-sm": "size-9 rounded-md"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var Button = import_react.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		ref,
		...props
	});
});
Button.displayName = "Button";
function Controls() {
	const isRunning = usePomodoro((s) => s.isRunning);
	const toggle = usePomodoro((s) => s.toggle);
	const reset = usePomodoro((s) => s.reset);
	const skip = usePomodoro((s) => s.skip);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-center gap-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "ghost",
					size: "icon",
					onClick: reset,
					"aria-label": "Reset interval",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, {})
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, { children: "Reset · R" })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				type: "button",
				size: "pill",
				onClick: toggle,
				"aria-label": isRunning ? "Pause" : "Start",
				className: "min-w-36",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "relative inline-flex size-4 items-center justify-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: isRunning ? "absolute scale-[0.25] opacity-0 blur-sm transition-[opacity,transform,filter] duration-[length:var(--motion-fast)] ease-[var(--ease-in-out)]" : "absolute ml-0.5 scale-100 opacity-100 blur-none transition-[opacity,transform,filter] duration-[length:var(--motion-fast)] ease-[var(--ease-in-out)]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: isRunning ? "absolute scale-100 opacity-100 blur-none transition-[opacity,transform,filter] duration-[length:var(--motion-fast)] ease-[var(--ease-in-out)]" : "absolute scale-[0.25] opacity-0 blur-sm transition-[opacity,transform,filter] duration-[length:var(--motion-fast)] ease-[var(--ease-in-out)]" })]
				}), isRunning ? "Pause" : "Start"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "ghost",
					size: "icon",
					onClick: skip,
					"aria-label": "Skip to next interval",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkipForward, {})
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, { children: "Skip · N" })] })
		]
	});
}
var SIZE = 288;
var STROKE = 7;
var RADIUS = 281 / 2;
var CIRCUMFERENCE = 2 * Math.PI * RADIUS;
function ProgressRing({ progress, phase, running, className }) {
	const offset = CIRCUMFERENCE * (1 - Math.min(1, Math.max(0, progress)));
	const isBreak = phase !== "work";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: `0 0 ${SIZE} ${SIZE}`,
		className: cn("size-full -rotate-90 transition-opacity duration-[length:var(--motion-fast)] ease-[var(--ease-out)]", running ? "opacity-100" : "opacity-70", className),
		"aria-hidden": "true",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: SIZE / 2,
			cy: SIZE / 2,
			r: RADIUS,
			fill: "none",
			className: isBreak ? "stroke-break/25" : "stroke-foreground/10",
			strokeWidth: STROKE
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: SIZE / 2,
			cy: SIZE / 2,
			r: RADIUS,
			fill: "none",
			className: isBreak ? "stroke-break" : "stroke-work",
			strokeWidth: STROKE,
			strokeLinecap: "round",
			strokeDasharray: CIRCUMFERENCE,
			strokeDashoffset: offset,
			style: {
				transitionProperty: "stroke-dashoffset, stroke",
				transitionDuration: "var(--motion-fast)",
				transitionTimingFunction: "var(--ease-out)"
			}
		})]
	});
}
function SessionPips({ total, filled, today }) {
	const count = Math.max(2, Math.min(8, total));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col items-center gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex items-center gap-2",
			role: "img",
			"aria-label": `${filled} of ${count} in this cycle`,
			children: Array.from({ length: count }, (_, i) => {
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("block size-2.5 rounded-full transition-[background-color,box-shadow,transform] duration-[length:var(--motion-fast)] ease-[var(--ease-out)]", i < filled ? "bg-work scale-100" : "bg-transparent shadow-[inset_0_0_0_1.5px_color-mix(in_oklab,var(--color-foreground)_28%,transparent)]") }, i);
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground tabular-nums",
			children: today === 0 ? "No sessions yet today" : `${today} focused today`
		})]
	});
}
var Label = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root, {
	ref,
	className: cn("text-sm font-medium text-foreground", className),
	...props
}));
Label.displayName = Root.displayName;
var Switch = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch$1, {
	className: cn("peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full shadow-[var(--shadow-border)] transition-[background-color,box-shadow] duration-[length:var(--motion-fast)] ease-[var(--ease-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 disabled:cursor-not-allowed disabled:opacity-40 data-[state=checked]:bg-primary data-[state=unchecked]:bg-foreground/10", className),
	...props,
	ref,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SwitchThumb, { className: cn("pointer-events-none block size-5 rounded-full bg-primary-foreground shadow-sm transition-transform duration-[length:var(--motion-fast)] ease-[var(--ease-out)] data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0.5 data-[state=unchecked]:bg-foreground/80") })
}));
Switch.displayName = Switch$1.displayName;
function Stepper({ label, value, unit = "min", onChange, min, max, step = 1 }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-2 rounded-xl bg-card px-3 py-3 shadow-[var(--shadow-border)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-xs font-medium tracking-wide text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between gap-1",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "ghost",
					size: "icon-sm",
					"aria-label": `Decrease ${label}`,
					disabled: value <= min,
					onClick: () => onChange(value - step),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, {})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "min-w-12 text-center font-display text-xl font-medium tabular-nums text-foreground",
					children: [value, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "ml-0.5 text-xs font-sans font-medium text-muted-foreground",
						children: unit
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "ghost",
					size: "icon-sm",
					"aria-label": `Increase ${label}`,
					disabled: value >= max,
					onClick: () => onChange(value + step),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {})
				})
			]
		})]
	});
}
function SettingsPanel() {
	const settings = usePomodoro((s) => s.settings);
	const setWorkMinutes = usePomodoro((s) => s.setWorkMinutes);
	const setShortBreakMinutes = usePomodoro((s) => s.setShortBreakMinutes);
	const setLongBreakMinutes = usePomodoro((s) => s.setLongBreakMinutes);
	const setSessionsUntilLongBreak = usePomodoro((s) => s.setSessionsUntilLongBreak);
	const setSoundEnabled = usePomodoro((s) => s.setSoundEnabled);
	const setAutoStart = usePomodoro((s) => s.setAutoStart);
	const applyPreset = usePomodoro((s) => s.applyPreset);
	const activePreset = Object.keys(PRESETS).find((id) => {
		const p = PRESETS[id];
		return p.workMinutes === settings.workMinutes && p.shortBreakMinutes === settings.shortBreakMinutes && p.longBreakMinutes === settings.longBreakMinutes && p.sessionsUntilLongBreak === settings.sessionsUntilLongBreak;
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "flex flex-col gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-2",
				children: Object.keys(PRESETS).map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => applyPreset(id),
					className: cn("rounded-full px-3 py-1.5 text-xs font-medium transition-[background-color,color,box-shadow] duration-[length:var(--motion-quick)] ease-[var(--ease-out)]", activePreset === id ? "bg-primary text-primary-foreground" : "text-muted-foreground shadow-[var(--shadow-border)] hover:text-foreground hover:shadow-[var(--shadow-border-hover)]"),
					children: PRESETS[id].label
				}, id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-3 gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stepper, {
						label: "Focus",
						value: settings.workMinutes,
						onChange: setWorkMinutes,
						min: 1,
						max: 90
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stepper, {
						label: "Break",
						value: settings.shortBreakMinutes,
						onChange: setShortBreakMinutes,
						min: 1,
						max: 30
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stepper, {
						label: "Long",
						value: settings.longBreakMinutes,
						onChange: setLongBreakMinutes,
						min: 1,
						max: 45
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stepper, {
					label: "Until long break",
					value: settings.sessionsUntilLongBreak,
					unit: "×",
					onChange: setSessionsUntilLongBreak,
					min: 2,
					max: 8
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col justify-center gap-3 rounded-xl bg-card px-3 py-3 shadow-[var(--shadow-border)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
							htmlFor: "sound",
							className: "flex items-center gap-2 text-xs font-medium text-muted-foreground",
							children: [settings.soundEnabled ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { className: "size-3.5" }), "Sound"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
							id: "sound",
							checked: settings.soundEnabled,
							onCheckedChange: (on) => {
								setSoundEnabled(on);
								if (on) requestNotifyPermission();
							}
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "auto-start",
							className: "text-xs font-medium text-muted-foreground",
							children: "Auto-start"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
							id: "auto-start",
							checked: settings.autoStart,
							onCheckedChange: setAutoStart
						})]
					})]
				})]
			})
		]
	});
}
var Input = import_react.forwardRef(({ className, type, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		type,
		className: cn("flex h-11 w-full rounded-lg bg-card px-3.5 text-sm text-foreground shadow-[var(--shadow-border)] outline-none transition-[box-shadow,background-color] duration-[length:var(--motion-quick)] ease-[var(--ease-out)] placeholder:text-muted-foreground/80 hover:shadow-[var(--shadow-border-hover)] focus-visible:ring-2 focus-visible:ring-ring/70 disabled:cursor-not-allowed disabled:opacity-50", className),
		ref,
		...props
	});
});
Input.displayName = "Input";
function TaskList() {
	const tasks = usePomodoro((s) => s.tasks);
	const activeTaskId = usePomodoro((s) => s.activeTaskId);
	const addTask = usePomodoro((s) => s.addTask);
	const toggleTask = usePomodoro((s) => s.toggleTask);
	const removeTask = usePomodoro((s) => s.removeTask);
	const setActiveTask = usePomodoro((s) => s.setActiveTask);
	const clearCompleted = usePomodoro((s) => s.clearCompleted);
	const [draft, setDraft] = (0, import_react.useState)("");
	const completed = tasks.filter((t) => t.done).length;
	function onSubmit(e) {
		e.preventDefault();
		addTask(draft);
		setDraft("");
	}
	function onDraftKey(e) {
		if (e.key === "Escape") setDraft("");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "flex h-full min-h-0 flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 flex items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-xl font-medium tracking-tight text-foreground",
					children: "This session"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: "What you want to finish in these intervals."
				})] }), completed > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: clearCompleted,
					className: "text-xs font-medium text-muted-foreground transition-colors duration-[length:var(--motion-quick)] hover:text-foreground",
					children: "Clear done"
				}) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit,
				className: "mb-4 flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: draft,
					onChange: (e) => setDraft(e.target.value),
					onKeyDown: onDraftKey,
					placeholder: "Add a task",
					"aria-label": "New task",
					maxLength: 120
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					variant: "secondary",
					size: "icon",
					"aria-label": "Add task",
					disabled: !draft.trim(),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto pr-0.5",
				children: tasks.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "rounded-xl bg-card px-4 py-8 text-center shadow-[var(--shadow-border)]",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground text-pretty",
						children: "Add the one thing this block is for. It will sit under the timer while you work."
					})
				}) : tasks.map((task) => {
					const active = task.id === activeTaskId && !task.done;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: cn("group flex items-center gap-1 rounded-xl py-1 pl-1 pr-1.5 shadow-[var(--shadow-border)] transition-[background-color,box-shadow] duration-[length:var(--motion-quick)] ease-[var(--ease-out)]", active ? "bg-card-hover shadow-[var(--shadow-border-hover)]" : "bg-card", task.done && "opacity-60"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => toggleTask(task.id),
								"aria-label": task.done ? "Mark not done" : "Mark done",
								className: cn("relative flex size-11 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors duration-[length:var(--motion-quick)] hover:text-foreground"),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: cn("flex size-5 items-center justify-center rounded-full shadow-[inset_0_0_0_1.5px_color-mix(in_oklab,var(--color-foreground)_32%,transparent)] transition-[background-color,box-shadow] duration-[length:var(--motion-fast)]", task.done && "bg-primary text-primary-foreground shadow-none"),
									children: task.done ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
										className: "size-3",
										strokeWidth: 2.5
									}) : null
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setActiveTask(task.done ? null : task.id),
								className: cn("min-w-0 flex-1 py-2.5 text-left text-sm transition-colors duration-[length:var(--motion-quick)]", task.done ? "text-muted-foreground line-through" : "text-foreground", active && "font-medium"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block truncate",
									children: task.text
								}), active ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mt-0.5 block text-xs font-normal tracking-wide text-accent",
									children: "Active"
								}) : null]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => removeTask(task.id),
								"aria-label": `Remove ${task.text}`,
								className: "flex size-11 shrink-0 items-center justify-center rounded-lg text-muted-foreground opacity-70 transition-opacity duration-[length:var(--motion-quick)] hover:text-foreground hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
							})
						]
					}) }, task.id);
				})
			})
		]
	});
}
function ActiveTaskCaption() {
	const tasks = usePomodoro((s) => s.tasks);
	const activeTaskId = usePomodoro((s) => s.activeTaskId);
	const setActiveTask = usePomodoro((s) => s.setActiveTask);
	const active = tasks.find((t) => t.id === activeTaskId && !t.done);
	if (!active) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex max-w-xs items-center gap-2 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "min-w-0 flex-1 truncate text-sm text-muted-foreground",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-foreground/90",
				children: active.text
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: () => setActiveTask(null),
			"aria-label": "Clear active task",
			className: "flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:text-foreground",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3.5" })
		})]
	});
}
function TimerTicker() {
	const isRunning = usePomodoro((s) => s.isRunning);
	const tick = usePomodoro((s) => s.tick);
	(0, import_react.useEffect)(() => {
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
	(0, import_react.useEffect)(() => {
		const time = formatMs(remainingMs);
		const label = phaseLabel(phase);
		document.title = isRunning ? `${time} · ${label} · Still` : "Still";
		return () => {
			document.title = "Still";
		};
	}, [
		remainingMs,
		isRunning,
		phase
	]);
	return null;
}
function KeyboardShortcuts() {
	const toggle = usePomodoro((s) => s.toggle);
	const reset = usePomodoro((s) => s.reset);
	const skip = usePomodoro((s) => s.skip);
	(0, import_react.useEffect)(() => {
		function onKey(e) {
			const target = e.target;
			if (target) {
				const tag = target.tagName;
				if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable) return;
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
	}, [
		toggle,
		reset,
		skip
	]);
	return null;
}
function CompletionPulse() {
	const justCompleted = usePomodoro((s) => s.justCompleted);
	const consume = usePomodoro((s) => s.consumeJustCompleted);
	(0, import_react.useEffect)(() => {
		if (!justCompleted) return;
		const id = window.setTimeout(consume, 700);
		return () => window.clearTimeout(id);
	}, [justCompleted, consume]);
	return null;
}
function useHydrated() {
	const [hydrated, setHydrated] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const unsub = usePomodoro.persist.onFinishHydration(() => setHydrated(true));
		if (usePomodoro.persist.hasHydrated()) setHydrated(true);
		return unsub;
	}, []);
	return hydrated;
}
function StillApp() {
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
	const status = isRunning ? isBreak ? "On a break" : "Focusing" : remainingMs === total ? phase === "shortBreak" ? "Short break" : phase === "longBreak" ? "Long break" : "Ready" : "Paused";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TooltipProvider, {
		delayDuration: 400,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TimerTicker, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleSync, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyboardShortcuts, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CompletionPulse, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative mx-auto flex min-h-dvh w-full max-w-5xl flex-col px-4 py-6 sm:px-6 sm:py-8 lg:px-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "mb-8 flex items-baseline justify-between gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.22em] text-muted-foreground uppercase",
						children: "Interval timer"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-3xl font-medium tracking-tight text-foreground",
						children: "Still"
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-right text-xs text-muted-foreground",
						children: [
							"Space start",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mx-1.5 text-foreground/20",
								children: "·"
							}),
							"R reset",
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "hidden sm:inline",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mx-1.5 text-foreground/20",
									children: "·"
								}), "N skip"]
							})
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid flex-1 grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col items-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: cn("relative size-64 sm:size-72", justCompleted && "animate-[still-pulse_0.6s_var(--ease-out)]"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProgressRing, {
									progress: hydrated ? progress : 0,
									phase,
									running: isRunning
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "absolute inset-0 flex flex-col items-center justify-center px-8 text-center",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: cn("font-display text-5xl font-medium tracking-tight text-foreground tabular-nums sm:text-6xl", "transition-opacity duration-[length:var(--motion-quick)]", isRunning ? "opacity-100" : "opacity-80"),
										"aria-hidden": "true",
										children: formatMs(hydrated ? remainingMs : total)
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: cn("mt-2 text-xs font-medium tracking-[0.2em] uppercase transition-colors duration-[length:var(--motion-fast)]", isBreak ? "text-break" : "text-muted-foreground", isRunning && !isBreak && "text-foreground"),
										children: status
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "sr-only",
								"aria-live": "polite",
								children: [
									status,
									". ",
									phaseLabel(phase),
									". ",
									formatMs(remainingMs),
									" remaining."
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-5",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActiveTaskCaption, {})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-6",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Controls, {})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-8",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SessionPips, {
									total: settings.sessionsUntilLongBreak,
									filled: cycleIndex,
									today: completedToday
								})
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex w-full flex-col gap-8 lg:sticky lg:top-8",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsPanel, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskList, {})]
					})]
				})]
			})
		]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StillApp, {});
}
//#endregion
export { Home as component };
