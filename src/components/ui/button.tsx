import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger";
  size?: "md" | "sm";
};

export function Button({ className, variant = "primary", size = "md", ...props }: Props) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-sm font-medium tracking-wide transition-colors duration-150 disabled:opacity-40",
        size === "md" ? "min-h-11 px-4 text-sm" : "min-h-9 px-3 text-xs",
        variant === "primary" && "bg-accent text-accent-fg hover:bg-accent/90",
        variant === "ghost" && "border border-line bg-transparent text-fg hover:bg-elevated",
        variant === "danger" && "bg-danger text-bg hover:opacity-90",
        className,
      )}
      {...props}
    />
  );
}
