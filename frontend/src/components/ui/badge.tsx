import React, { type ReactNode } from "react";

export function Badge({
  children,
  tone = "default",
  dot = false,
  className = "",
}: {
  children: ReactNode;
  tone?: "default" | "brand" | "success" | "warning" | "danger" | "info" | "gold" | "purple" | "teal";
  dot?: boolean;
  className?: string;
}) {
  const toneMap: Record<string, { bg: string; dotColor: string }> = {
    default: {
      bg: "bg-[#f4efea] text-[#4a4250] border-[#e7dfd8]",
      dotColor: "bg-[#7a7180]",
    },
    brand: {
      bg: "bg-rose-50/90 text-rose-800 border-rose-200 shadow-xs",
      dotColor: "bg-rose-600",
    },
    success: {
      bg: "bg-emerald-50/90 text-emerald-800 border-emerald-200 shadow-xs",
      dotColor: "bg-emerald-600",
    },
    warning: {
      bg: "bg-amber-50/90 text-amber-800 border-amber-200 shadow-xs",
      dotColor: "bg-amber-600",
    },
    danger: {
      bg: "bg-red-50/90 text-red-800 border-red-200 shadow-xs",
      dotColor: "bg-red-600",
    },
    info: {
      bg: "bg-sky-50/90 text-sky-800 border-sky-200 shadow-xs",
      dotColor: "bg-sky-600",
    },
    gold: {
      bg: "bg-amber-50/80 text-amber-900 border-amber-300 shadow-xs",
      dotColor: "bg-amber-500",
    },
    purple: {
      bg: "bg-purple-50/90 text-purple-800 border-purple-200 shadow-xs",
      dotColor: "bg-purple-600",
    },
    teal: {
      bg: "bg-teal-50/90 text-teal-800 border-teal-200 shadow-xs",
      dotColor: "bg-teal-600",
    },
  };

  const current = toneMap[tone] || toneMap.default;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase shadow-2xs ${current.bg} ${className}`}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${current.dotColor} shrink-0 animate-pulse-subtle`} />
      )}
      <span>{children}</span>
    </span>
  );
}
