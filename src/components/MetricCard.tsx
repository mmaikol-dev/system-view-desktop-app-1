import type { ReactNode } from "react";
import Sparkline from "./Sparkline";

interface MetricCardProps {
  label: string;
  value: string;
  subvalue?: string;
  icon?: ReactNode;
  trend?: number[];
  trendColor?: string;
  trendFormatter?: (v: number) => string;
  accent?: string;
}

export default function MetricCard({
  label,
  value,
  subvalue,
  icon,
  trend,
  trendColor = "#34d399",
  trendFormatter,
  accent = "from-emerald-500/10 to-transparent",
}: MetricCardProps) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-[#1f2937] bg-[#111827]/80 p-4">
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${accent}`} />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-wider text-gray-500">{label}</div>
          <div className="mt-1 text-2xl font-semibold text-gray-100 tabular-nums">{value}</div>
          {subvalue && <div className="mt-1 text-xs text-gray-400 truncate">{subvalue}</div>}
        </div>
        {icon && (
          <div className="shrink-0 w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-300">
            {icon}
          </div>
        )}
      </div>
      {trend && trend.length > 1 && (
        <div className="relative mt-3">
          <Sparkline
            data={trend}
            height={48}
            color={trendColor}
            strokeWidth={1.8}
            valueFormatter={trendFormatter}
          />
        </div>
      )}
    </div>
  );
}
