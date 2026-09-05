import { Minus, Plus, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PRESETS, type PresetId } from "@/lib/pomodoro/types";
import { usePomodoro } from "@/lib/pomodoro/store";
import { requestNotifyPermission } from "@/lib/pomodoro/sound";
import { cn } from "@/lib/utils";

function Stepper({
  label,
  value,
  unit = "min",
  onChange,
  min,
  max,
  step = 1,
}: {
  label: string;
  value: number;
  unit?: string;
  onChange: (n: number) => void;
  min: number;
  max: number;
  step?: number;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl bg-card px-3 py-3 shadow-[var(--shadow-border)]">
      <span className="text-xs font-medium tracking-wide text-muted-foreground">{label}</span>
      <div className="flex items-center justify-between gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Decrease ${label}`}
          disabled={value <= min}
          onClick={() => onChange(value - step)}
        >
          <Minus />
        </Button>
        <span className="min-w-12 text-center font-display text-xl font-medium tabular-nums text-foreground">
          {value}
          <span className="ml-0.5 text-xs font-sans font-medium text-muted-foreground">{unit}</span>
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Increase ${label}`}
          disabled={value >= max}
          onClick={() => onChange(value + step)}
        >
          <Plus />
        </Button>
      </div>
    </div>
  );
}

export function SettingsPanel() {
  const settings = usePomodoro((s) => s.settings);
  const setWorkMinutes = usePomodoro((s) => s.setWorkMinutes);
  const setShortBreakMinutes = usePomodoro((s) => s.setShortBreakMinutes);
  const setLongBreakMinutes = usePomodoro((s) => s.setLongBreakMinutes);
  const setSessionsUntilLongBreak = usePomodoro((s) => s.setSessionsUntilLongBreak);
  const setSoundEnabled = usePomodoro((s) => s.setSoundEnabled);
  const setAutoStart = usePomodoro((s) => s.setAutoStart);
  const applyPreset = usePomodoro((s) => s.applyPreset);

  const activePreset = (Object.keys(PRESETS) as PresetId[]).find((id) => {
    const p = PRESETS[id];
    return (
      p.workMinutes === settings.workMinutes &&
      p.shortBreakMinutes === settings.shortBreakMinutes &&
      p.longBreakMinutes === settings.longBreakMinutes &&
      p.sessionsUntilLongBreak === settings.sessionsUntilLongBreak
    );
  });

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {(Object.keys(PRESETS) as PresetId[]).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => applyPreset(id)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-[background-color,color,box-shadow] duration-[length:var(--motion-quick)] ease-[var(--ease-out)]",
              activePreset === id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground shadow-[var(--shadow-border)] hover:text-foreground hover:shadow-[var(--shadow-border-hover)]",
            )}
          >
            {PRESETS[id].label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Stepper label="Focus" value={settings.workMinutes} onChange={setWorkMinutes} min={1} max={90} />
        <Stepper label="Break" value={settings.shortBreakMinutes} onChange={setShortBreakMinutes} min={1} max={30} />
        <Stepper label="Long" value={settings.longBreakMinutes} onChange={setLongBreakMinutes} min={1} max={45} />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Stepper
          label="Until long break"
          value={settings.sessionsUntilLongBreak}
          unit="×"
          onChange={setSessionsUntilLongBreak}
          min={2}
          max={8}
        />
        <div className="flex flex-col justify-center gap-3 rounded-xl bg-card px-3 py-3 shadow-[var(--shadow-border)]">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="sound" className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              {settings.soundEnabled ? <Volume2 className="size-3.5" /> : <VolumeX className="size-3.5" />}
              Sound
            </Label>
            <Switch
              id="sound"
              checked={settings.soundEnabled}
              onCheckedChange={(on) => {
                setSoundEnabled(on);
                if (on) requestNotifyPermission();
              }}
            />
          </div>
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="auto-start" className="text-xs font-medium text-muted-foreground">
              Auto-start
            </Label>
            <Switch id="auto-start" checked={settings.autoStart} onCheckedChange={setAutoStart} />
          </div>
        </div>
      </div>
    </section>
  );
}
