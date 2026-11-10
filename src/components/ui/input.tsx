import * as React from "react";

import { cn } from "@/lib/utils";

type InputProps = React.ComponentProps<"input">;

function Input({ className, type, ...props }: InputProps) {
  return (
    <input
      data-slot="input"
      type={type}
      className={cn(
        "h-11 w-full rounded-xl border border-border bg-white px-3.5 text-sm text-foreground shadow-sm outline-none transition-[color,background-color,border-color,box-shadow] duration-200 placeholder:text-muted-foreground/65 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Input, type InputProps };
