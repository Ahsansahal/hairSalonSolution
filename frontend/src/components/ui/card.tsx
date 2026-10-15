import React, { type HTMLAttributes, type ReactNode } from "react";

export function Card({
  className = "",
  children,
  interactive = false,
  ...props
}: HTMLAttributes<HTMLDivElement> & { interactive?: boolean }) {
  return (
    <div
      className={`rounded-2xl border border-[#e7dfd8] bg-white shadow-[0_1px_3px_rgba(27,21,32,0.03),0_8px_16px_-8px_rgba(27,21,32,0.04)] ${
        interactive ? "card-hover cursor-pointer" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  description,
  action,
  eyebrow,
  className = "",
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  eyebrow?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-start justify-between gap-3 px-6 pt-6 pb-2.5 ${className}`}>
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#a3214f]">{eyebrow}</p>
        )}
        <h2 className="text-[15px] font-bold tracking-tight text-[#1b1520]">{title}</h2>
        {description && <p className="mt-0.5 text-xs text-[#7a7180] leading-relaxed">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function CardBody({ className = "", children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
  eyebrow,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  eyebrow?: ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-col gap-3.5 sm:flex-row sm:items-end sm:justify-between pb-3 border-b border-[#e7dfd8]/80">
      <div className="min-w-0 space-y-1">
        {eyebrow && (
          <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#a3214f]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#a3214f]"></span>
            <span>{eyebrow}</span>
          </div>
        )}
        <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-[#1b1520]">
          {title}
        </h1>
        {description && (
          <div className="text-xs text-[#7a7180] flex items-center gap-2 pt-0.5">
            {description}
          </div>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2.5 sm:shrink-0">{actions}</div>
      )}
    </div>
  );
}

export function Stat({
  label,
  value,
  hint,
  icon,
  trend,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  trend?: string | { value: string; positive?: boolean };
  tone?: "default" | "brand" | "success" | "warning" | "danger" | "info" | "gold";
}) {
  const toneMap: Record<string, { card: string; iconBg: string; glow: string; labelColor: string; valueColor: string }> = {
    default: {
      card: "bg-gradient-to-br from-[#faf7f4] via-white to-[#f5efe9] border-[#e7dfd8] hover:border-[#d6ccc3]",
      iconBg: "bg-gradient-to-br from-[#6b5f73] to-[#3f3547] text-white shadow-sm shadow-stone-500/20",
      glow: "from-stone-400/10",
      labelColor: "text-[#7a7180]",
      valueColor: "text-[#1b1520]",
    },
    brand: {
      card: "bg-gradient-to-br from-[#fff1f5] via-white to-[#fdf2f8] border-[#fbcfe8] hover:border-[#f472b6] shadow-xs hover:shadow-glow-brand/20",
      iconBg: "bg-gradient-to-br from-[#e11d48] to-[#9f1239] text-white shadow-md shadow-rose-500/30",
      glow: "from-rose-500/15",
      labelColor: "text-[#9f1239]",
      valueColor: "text-[#881337]",
    },
    success: {
      card: "bg-gradient-to-br from-[#f0fdf4] via-white to-[#ecfdf5] border-[#bbf7d0] hover:border-[#4ade80] shadow-xs hover:shadow-glow-emerald/20",
      iconBg: "bg-gradient-to-br from-[#10b981] to-[#047857] text-white shadow-md shadow-emerald-500/30",
      glow: "from-emerald-500/15",
      labelColor: "text-[#065f46]",
      valueColor: "text-[#064e3b]",
    },
    warning: {
      card: "bg-gradient-to-br from-[#fffbeb] via-white to-[#fef3c7] border-[#fde68a] hover:border-[#fbbf24] shadow-xs hover:shadow-glow-amber/20",
      iconBg: "bg-gradient-to-br from-[#f59e0b] to-[#b45309] text-white shadow-md shadow-amber-500/30",
      glow: "from-amber-500/15",
      labelColor: "text-[#92400e]",
      valueColor: "text-[#78350f]",
    },
    danger: {
      card: "bg-gradient-to-br from-[#fef2f2] via-white to-[#fee2e2] border-[#fecaca] hover:border-[#f87171] shadow-xs",
      iconBg: "bg-gradient-to-br from-[#ef4444] to-[#b91c1c] text-white shadow-md shadow-red-500/30",
      glow: "from-red-500/15",
      labelColor: "text-[#991b1b]",
      valueColor: "text-[#7f1d1d]",
    },
    info: {
      card: "bg-gradient-to-br from-[#eff6ff] via-white to-[#f0f9ff] border-[#bfdbfe] hover:border-[#60a5fa] shadow-xs hover:shadow-glow-sapphire/20",
      iconBg: "bg-gradient-to-br from-[#3b82f6] to-[#1d4ed8] text-white shadow-md shadow-blue-500/30",
      glow: "from-blue-500/15",
      labelColor: "text-[#1e40af]",
      valueColor: "text-[#1e3a8a]",
    },
    gold: {
      card: "bg-gradient-to-br from-[#fdfbf7] via-white to-[#fef9ee] border-[#f3e3c6] hover:border-[#d4a853] shadow-xs hover:shadow-glow-amber/20",
      iconBg: "bg-gradient-to-br from-[#c99738] to-[#8c5e12] text-white shadow-md shadow-amber-600/30",
      glow: "from-amber-400/15",
      labelColor: "text-[#854d0e]",
      valueColor: "text-[#713f12]",
    },
  };

  const style = toneMap[tone] || toneMap.default;

  return (
    <div
      className={`rounded-2xl border p-4 sm:p-5 card-hover relative overflow-hidden group transition-all duration-300 ${style.card}`}
    >
      {/* Dynamic ambient radial glow */}
      <div
        className={`absolute top-0 right-0 w-28 h-28 bg-gradient-to-br ${style.glow} to-transparent -mr-6 -mt-6 rounded-full pointer-events-none group-hover:scale-150 transition-transform duration-500 blur-xl`}
      />

      <div className="flex items-center justify-between gap-2 relative z-10">
        <p className={`text-xs font-bold tracking-wide uppercase text-[11px] ${style.labelColor}`}>
          {label}
        </p>
        {icon && (
          <span className={`grid h-9 w-9 place-items-center rounded-xl ${style.iconBg} transition-transform duration-300 group-hover:scale-110`}>
            {icon}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2 relative z-10">
        <p className={`text-2xl sm:text-3xl font-bold tracking-tight tabular-nums font-serif ${style.valueColor}`}>
          {value}
        </p>
        {trend && (
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              typeof trend === "string" || trend.positive !== false
                ? "bg-emerald-100 text-emerald-800 border border-emerald-300/80"
                : "bg-rose-100 text-rose-800 border border-rose-300/80"
            }`}
          >
            {typeof trend === "string" ? trend : trend.value}
          </span>
        )}
      </div>

      {hint && <p className="mt-1 text-[11px] text-[#7a7180] truncate relative z-10">{hint}</p>}
    </div>
  );
}
