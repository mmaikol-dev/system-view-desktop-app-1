import type { CpuUsage } from "../types/system";
import { clampPercent } from "../utils/format";
import ProgressBar from "./ProgressBar";
import StatCard from "./StatCard";
import Sparkline from "./Sparkline";

interface Props {
  cpu: CpuUsage | null;
  loading: boolean;
  history: number[];
}

export default function CpuCard({ cpu, loading, history }: Props) {
  const overall = clampPercent(cpu?.overall ?? 0);
  const color = overall > 85 ? "#f87171" : overall >= 60 ? "#fbbf24" : "#34d399";

  return (
    <StatCard
      title="CPU"
      subtitle="Overall load, trend, and per-core utilization"
      right={<span className="text-lg font-semibold text-gray-100 tabular-nums">{overall.toFixed(1)}%</span>}
    >
      {loading && !cpu ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-16 bg-gray-800/50 rounded-lg" />
          <div className="h-3 bg-gray-800/70 rounded-full" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-800/50 rounded-md" />
            ))}
          </div>
        </div>
      ) : cpu ? (
        <div className="space-y-4">
          <div className="rounded-lg border border-[#1f2937] bg-[#0b1220] p-3">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
              <span>Live trend (last {history.length} samples)</span>
              <span className="tabular-nums" style={{ color }}>{overall.toFixed(1)}%</span>
            </div>
            <Sparkline data={history.length ? history : [overall]} height={64} color={color} />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
              <span>Overall Usage</span>
              <span className="tabular-nums">{overall.toFixed(1)}%</span>
            </div>
            <ProgressBar value={overall} heightClassName="h-3" />
          </div>

          <div>
            <div className="text-xs text-gray-500 mb-2">Per-core ({cpu.perCore.length})</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-auto pr-1">
              {cpu.perCore.map((value, idx) => {
                const v = clampPercent(value);
                return (
                  <div key={idx} className="bg-[#0b1220] border border-[#1f2937] rounded-md px-2.5 py-2">
                    <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1.5">
                      <span>Core {idx}</span>
                      <span className="tabular-nums">{v.toFixed(0)}%</span>
                    </div>
                    <ProgressBar value={v} heightClassName="h-1.5" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-sm text-gray-500">No CPU data available.</div>
      )}
    </StatCard>
  );
}
