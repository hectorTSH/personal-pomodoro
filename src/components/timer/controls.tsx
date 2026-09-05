import { Pause, Play, RotateCcw, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { usePomodoro } from "@/lib/pomodoro/store";

export function Controls() {
  const isRunning = usePomodoro((s) => s.isRunning);
  const toggle = usePomodoro((s) => s.toggle);
  const reset = usePomodoro((s) => s.reset);
  const skip = usePomodoro((s) => s.skip);

  return (
    <div className="flex items-center justify-center gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={reset}
            aria-label="Reset interval"
          >
            <RotateCcw />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Reset · R</TooltipContent>
      </Tooltip>

      <Button
        type="button"
        size="pill"
        onClick={toggle}
        aria-label={isRunning ? "Pause" : "Start"}
        className="min-w-36"
      >
        <span className="relative inline-flex size-4 items-center justify-center">
          <Play
            className={
              isRunning
                ? "absolute scale-[0.25] opacity-0 blur-sm transition-[opacity,transform,filter] duration-[length:var(--motion-fast)] ease-[var(--ease-in-out)]"
                : "absolute ml-0.5 scale-100 opacity-100 blur-none transition-[opacity,transform,filter] duration-[length:var(--motion-fast)] ease-[var(--ease-in-out)]"
            }
          />
          <Pause
            className={
              isRunning
                ? "absolute scale-100 opacity-100 blur-none transition-[opacity,transform,filter] duration-[length:var(--motion-fast)] ease-[var(--ease-in-out)]"
                : "absolute scale-[0.25] opacity-0 blur-sm transition-[opacity,transform,filter] duration-[length:var(--motion-fast)] ease-[var(--ease-in-out)]"
            }
          />
        </span>
        {isRunning ? "Pause" : "Start"}
      </Button>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button type="button" variant="ghost" size="icon" onClick={skip} aria-label="Skip to next interval">
            <SkipForward />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Skip · N</TooltipContent>
      </Tooltip>
    </div>
  );
}
