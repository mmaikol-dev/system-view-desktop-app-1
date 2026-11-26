import type { MemoryUsage } from "../types/system";
import { clampPercent, formatBytes } from "../utils/format";
import ProgressBar from "./ProgressBar";
import StatCard from "./StatCard";
import Sparkline from "./Sparkline";

interface Props {
  memory: MemoryUsage | null;
  loading: boolean;
  history: number[];
}

export default function MemoryCard({ memory, loading, history }: Props) {
  const pct = clampPercent(memory?.usagePercent ?? 0);
  const color = pct > 85 ? "#f87171" : pct >= 60 ? "#fbbf24" : "#60a5fa";

  return (
    <StatCard
      title="Memory"
      subtitle="RAM usage and trend"
      right={<span className="text-lg font-semibold text-gray-100 tabular-nums">{pct.toFixed(1)}%</span>}
    >
      {loading && !memory ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-16 bg-gray-800/50 rounded-lg" />
          <div className="h-4 bg-gray-800/70 rounded w-40" />
          <div className="h-3 bg-gray-800/70 rounded-full" />
        </div>
      ) : memory ? (
        <div className="space-y-4">
          <div className="rounded-lg border border-[#1f2937] bg-[#0b1220] p-3">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
              <span>Live trend (last {history.length} samples)</span>
              <span className="tabular-nums" style={{ color }}>{pct.toFixed(1)}%</span>
            </div>
            <Sparkline data={history.length ? history : [pct]} height={64} color={color} />
          </div>

          <div className="text-sm text-gray-300">
            <span className="font-medium text-gray-100">{formatBytes(memory.used)}</span>
            <span className="text-gray-500"> / </span>
            <span>{formatBytes(memory.total)}</span>
          </div>
          <ProgressBar value={pct} heightClassName="h-3" />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Available: {formatBytes(memory.available)}</span>
            <span className="tabular-nums">{pct.toFixed(1)}%</span>
          </div>
        </div>
      ) : (
        <div className="text-sm text-gray-500">No memory data available.</div>
      )}
    </StatCard>
  );
}
