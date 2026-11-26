import type { DiskUsage } from "../types/system";
import { clampPercent, formatBytes } from "../utils/format";
import ProgressBar from "./ProgressBar";
import StatCard from "./StatCard";

interface Props {
  disks: DiskUsage[];
  loading: boolean;
}

export default function DiskCard({ disks, loading }: Props) {
  return (
    <StatCard title="Disks" subtitle="Mounted storage devices">
      {loading && disks.length === 0 ? (
        <div className="space-y-3 animate-pulse">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-20 bg-gray-800/50 rounded-lg" />
          ))}
        </div>
      ) : disks.length === 0 ? (
        <div className="text-sm text-gray-500">No disks found.</div>
      ) : (
        <div className="space-y-4">
          {disks.map((disk, idx) => {
            const pct = clampPercent(disk.usagePercent);
            return (
              <div
                key={`${disk.name}-${disk.mountPoint}-${idx}`}
                className="bg-[#0b1220] border border-[#1f2937] rounded-lg p-3"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="min-w-0">
                    <div className="text-sm text-gray-200 font-medium truncate" title={disk.name}>
                      {disk.name || "Unknown disk"}
                    </div>
                    <div className="text-xs text-gray-500 truncate" title={`${disk.mountPoint} · ${disk.fileSystem}`}>
                      {disk.mountPoint} · {disk.fileSystem}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 whitespace-nowrap tabular-nums">{pct.toFixed(1)}%</div>
                </div>
                <ProgressBar value={pct} heightClassName="h-2.5" />
                <div className="mt-2 text-xs text-gray-500 flex justify-between gap-3">
                  <span>
                    {formatBytes(disk.used)} / {formatBytes(disk.total)}
                  </span>
                  <span>Free: {formatBytes(disk.available)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </StatCard>
  );
}
