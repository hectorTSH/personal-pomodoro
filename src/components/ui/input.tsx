import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-lg bg-card px-3.5 text-sm text-foreground shadow-[var(--shadow-border)] outline-none transition-[box-shadow,background-color] duration-[length:var(--motion-quick)] ease-[var(--ease-out)] placeholder:text-muted-foreground/80 hover:shadow-[var(--shadow-border-hover)] focus-visible:ring-2 focus-visible:ring-ring/70 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
