import type { PropsWithChildren } from "react";

type CardProps = PropsWithChildren<{
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}>;

function cx(...parts: Array<string | undefined | false | null>) {
  return parts.filter(Boolean).join(" ");
}

/**
 * GlassCard = standard surface card (light dashboard style)
 */
export function GlassCard({ children, className = "", as: Tag = "div" }: CardProps) {
  return (
    <Tag
      data-ui="card"
      className={cx(
        "rounded-2xl p-6",
        "bg-ui-surface/90 border border-ui-border shadow-card",
        "text-ui-text",
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
 */
export function GlassCardStrong({ children, className = "", as: Tag = "div" }: CardProps) {
  return (
    <Tag
      data-ui="card-strong"
      className={cx(
        "rounded-2xl p-6",
        "bg-ui-surface border border-ui-border shadow-[0_12px_30px_rgba(15,23,42,0.08)]",
        "text-ui-text",
        "backdrop-blur-xl",
        className
      )}
    >
      {children}
    </Tag>
  );
}
