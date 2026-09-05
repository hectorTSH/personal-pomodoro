import { useState, type FormEvent, type KeyboardEvent } from "react";
import { Check, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { usePomodoro } from "@/lib/pomodoro/store";

export function TaskList() {
  const tasks = usePomodoro((s) => s.tasks);
  const activeTaskId = usePomodoro((s) => s.activeTaskId);
  const addTask = usePomodoro((s) => s.addTask);
  const toggleTask = usePomodoro((s) => s.toggleTask);
  const removeTask = usePomodoro((s) => s.removeTask);
  const setActiveTask = usePomodoro((s) => s.setActiveTask);
  const clearCompleted = usePomodoro((s) => s.clearCompleted);
  const [draft, setDraft] = useState("");

  const completed = tasks.filter((t) => t.done).length;

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    addTask(draft);
    setDraft("");
  }

  function onDraftKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") setDraft("");
  }

  return (
    <section className="flex h-full min-h-0 flex-col">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-medium tracking-tight text-foreground">This session</h2>
          <p className="mt-1 text-sm text-muted-foreground">What you want to finish in these intervals.</p>
        </div>
        {completed > 0 ? (
          <button
            type="button"
            onClick={clearCompleted}
            className="text-xs font-medium text-muted-foreground transition-colors duration-[length:var(--motion-quick)] hover:text-foreground"
          >
            Clear done
          </button>
        ) : null}
      </div>

      <form onSubmit={onSubmit} className="mb-4 flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onDraftKey}
          placeholder="Add a task"
          aria-label="New task"
          maxLength={120}
        />
        <Button type="submit" variant="secondary" size="icon" aria-label="Add task" disabled={!draft.trim()}>
          <Plus />
        </Button>
      </form>

      <ul className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto pr-0.5">
        {tasks.length === 0 ? (
          <li className="rounded-xl bg-card px-4 py-8 text-center shadow-[var(--shadow-border)]">
            <p className="text-sm text-muted-foreground text-pretty">
              Add the one thing this block is for. It will sit under the timer while you work.
            </p>
          </li>
        ) : (
          tasks.map((task) => {
            const active = task.id === activeTaskId && !task.done;
            return (
              <li key={task.id}>
                <div
                  className={cn(
                    "group flex items-center gap-1 rounded-xl py-1 pl-1 pr-1.5 shadow-[var(--shadow-border)] transition-[background-color,box-shadow] duration-[length:var(--motion-quick)] ease-[var(--ease-out)]",
                    active ? "bg-card-hover shadow-[var(--shadow-border-hover)]" : "bg-card",
                    task.done && "opacity-60",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => toggleTask(task.id)}
                    aria-label={task.done ? "Mark not done" : "Mark done"}
                    className={cn(
                      "relative flex size-11 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors duration-[length:var(--motion-quick)] hover:text-foreground",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-5 items-center justify-center rounded-full shadow-[inset_0_0_0_1.5px_color-mix(in_oklab,var(--color-foreground)_32%,transparent)] transition-[background-color,box-shadow] duration-[length:var(--motion-fast)]",
                        task.done && "bg-primary text-primary-foreground shadow-none",
                      )}
                    >
                      {task.done ? <Check className="size-3" strokeWidth={2.5} /> : null}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTask(task.done ? null : task.id)}
                    className={cn(
                      "min-w-0 flex-1 py-2.5 text-left text-sm transition-colors duration-[length:var(--motion-quick)]",
                      task.done ? "text-muted-foreground line-through" : "text-foreground",
                      active && "font-medium",
                    )}
                  >
                    <span className="block truncate">{task.text}</span>
                    {active ? (
                      <span className="mt-0.5 block text-xs font-normal tracking-wide text-accent">Active</span>
                    ) : null}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeTask(task.id)}
                    aria-label={`Remove ${task.text}`}
                    className="flex size-11 shrink-0 items-center justify-center rounded-lg text-muted-foreground opacity-70 transition-opacity duration-[length:var(--motion-quick)] hover:text-foreground hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </li>
            );
          })
        )}
      </ul>
    </section>
  );
}

export function ActiveTaskCaption() {
  const tasks = usePomodoro((s) => s.tasks);
  const activeTaskId = usePomodoro((s) => s.activeTaskId);
  const setActiveTask = usePomodoro((s) => s.setActiveTask);
  const active = tasks.find((t) => t.id === activeTaskId && !t.done);

  if (!active) return null;

  return (
    <div className="flex max-w-xs items-center gap-2 text-center">
      <p className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
        <span className="text-foreground/90">{active.text}</span>
      </p>
      <button
        type="button"
        onClick={() => setActiveTask(null)}
        aria-label="Clear active task"
        className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}
