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
          <p className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-amber-600">{eyebrow}</p>
        )}
        <h2 className="text-[15px] font-bold tracking-tight text-[#0B1B3D]">{title}</h2>
        {description && <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">{description}</p>}
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
    <div className="mb-7 flex flex-col gap-3.5 sm:flex-row sm:items-end sm:justify-between pb-3 border-b border-slate-200/80">
      <div className="min-w-0 space-y-1">
        {eyebrow && (
          <div className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-amber-600">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            <span>{eyebrow}</span>
          </div>
        )}
        <h1 className="text-2xl sm:text-3xl font-serif font-extrabold tracking-tight text-[#0B1B3D]">
          {title}
        </h1>
        {description && (
          <div className="text-xs text-slate-500 flex items-center gap-2 pt-0.5">
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
      card: "bg-white border-slate-200 hover:border-slate-300 shadow-xs",
      iconBg: "bg-slate-100 text-slate-700 shadow-xs",
      glow: "from-slate-400/10",
      labelColor: "text-slate-500",
      valueColor: "text-[#0B1B3D]",
    },
    brand: {
      card: "bg-gradient-to-br from-blue-50/60 via-white to-slate-50 border-blue-200/80 hover:border-blue-300 shadow-xs hover:shadow-md",
      iconBg: "bg-gradient-to-br from-[#0A1931] to-[#12285A] text-amber-400 shadow-sm",
      glow: "from-blue-500/15",
      labelColor: "text-blue-900",
      valueColor: "text-[#0B1B3D]",
    },
    success: {
      card: "bg-gradient-to-br from-emerald-50/60 via-white to-emerald-50/20 border-emerald-200 hover:border-emerald-300 shadow-xs",
      iconBg: "bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-sm",
      glow: "from-emerald-500/15",
      labelColor: "text-emerald-800",
      valueColor: "text-[#0B1B3D]",
    },
    warning: {
      card: "bg-gradient-to-br from-amber-50/60 via-white to-amber-50/20 border-amber-200 hover:border-amber-300 shadow-xs",
      iconBg: "bg-gradient-to-br from-amber-500 to-amber-700 text-white shadow-sm",
      glow: "from-amber-500/15",
      labelColor: "text-amber-800",
      valueColor: "text-[#0B1B3D]",
    },
    danger: {
      card: "bg-gradient-to-br from-rose-50/60 via-white to-rose-50/20 border-rose-200 hover:border-rose-300 shadow-xs",
      iconBg: "bg-gradient-to-br from-rose-500 to-rose-700 text-white shadow-sm",
      glow: "from-rose-500/15",
      labelColor: "text-rose-800",
      valueColor: "text-[#0B1B3D]",
    },
    info: {
      card: "bg-gradient-to-br from-sky-50/60 via-white to-slate-50 border-sky-200 hover:border-sky-300 shadow-xs",
      iconBg: "bg-gradient-to-br from-sky-500 to-sky-700 text-white shadow-sm",
      glow: "from-sky-500/15",
      labelColor: "text-sky-900",
      valueColor: "text-[#0B1B3D]",
    },
    gold: {
      card: "bg-gradient-to-br from-amber-50/80 via-white to-amber-50/30 border-amber-200 hover:border-amber-300 shadow-xs",
      iconBg: "bg-gradient-to-br from-amber-400 to-amber-600 text-[#0A1931] shadow-sm font-bold",
      glow: "from-amber-400/15",
      labelColor: "text-amber-900",
      valueColor: "text-[#0B1B3D]",
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
