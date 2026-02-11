import type { PropsWithChildren } from "react";

type CardProps = PropsWithChildren<{
  className?: string;
  id?: string;
  as?: keyof JSX.IntrinsicElements;
}>;

function cx(...parts: Array<string | undefined | false | null>) {
  return parts.filter(Boolean).join(" ");
}

/**
 * GlassCard = standard surface card (light dashboard style)
 */
export function GlassCard({ children, className = "", id, as: Tag = "div" }: CardProps) {
  return (
    <Tag
      id={id}
      data-ui="card"
      className={cx(
        "rounded-2xl p-6",
        "bg-ui-surface border border-ui-border shadow-card",
        "text-ui-text",
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
export function GlassCardStrong({ children, className = "", id, as: Tag = "div" }: CardProps) {
  return (
    <Tag
      id={id}
      data-ui="card-strong"
      className={cx(
        "rounded-2xl p-6",
        "bg-ui-surface border border-ui-border shadow-[0_12px_30px_rgba(15,23,42,0.08)]",
        "text-ui-text",
        className
      )}
    >
      {children}
    </Tag>
  );
}
