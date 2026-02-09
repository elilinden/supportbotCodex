import type { PropsWithChildren } from "react";

type CardProps = PropsWithChildren<{
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}>;

function cx(...parts: Array<string | undefined | false | null>) {
  return parts.filter(Boolean).join(" ");
}

/**
 * GlassCard = standard surface card
 * - Light dashboard style by default
 * - Still looks OK if you later support dark mode (dark: variants included)
 */
export function GlassCard({ children, className = "", as: Tag = "div" }: CardProps) {
  return (
    <Tag
      data-ui="card"
      className={cx(
        // Layout
        "rounded-2xl p-6",
        // Surface (light dashboard)
        "bg-white/90 border border-slate-200/70 shadow-[0_8px_24px_rgba(15,23,42,0.06)]",
        // Typography defaults
        "text-slate-900",
        // Optional dark-mode friendliness (won’t hurt if you stay light)
        "dark:bg-white/5 dark:border-white/10 dark:text-white dark:shadow-[0_18px_50px_rgba(0,0,0,0.35)]",
        // Subtle “frost” if you keep gradients behind it
        "backdrop-blur-xl",
        className
      )}
    >
      {children}
    </Tag>
  );
}

/**
 * GlassCardStrong = emphasized/hero card
 * - Slightly stronger border + shadow + surface tint
 * - Use for headers / key panels
 */
export function GlassCardStrong({ children, className = "", as: Tag = "div" }: CardProps) {
  return (
    <Tag
      data-ui="card-strong"
      className={cx(
        "rounded-2xl p-6",
        "bg-white border border-slate-200 shadow-[0_12px_30px_rgba(15,23,42,0.08)]",
        "text-slate-900",
        "dark:bg-white/10 dark:border-white/15 dark:text-white dark:shadow-[0_22px_60px_rgba(0,0,0,0.45)]",
        "backdrop-blur-xl",
        className
      )}
    >
      {children}
    </Tag>
  );
}