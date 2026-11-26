import type { SystemInfo } from "../types/system";
import { formatBytes, formatUptime } from "../utils/format";
import StatCard from "./StatCard";

interface Props {
  info: SystemInfo | null;
  loading: boolean;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-[#1f2937]/70 last:border-b-0">
      <span className="text-sm text-gray-500 shrink-0">{label}</span>
      <span className="text-sm text-gray-200 text-right break-all">{value}</span>
    </div>
  );
}

function SkeletonRows({ count }: { count: number }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-4 bg-gray-800/70 rounded" />
      ))}
    </div>
  );
}

export default function SystemOverview({ info, loading }: Props) {
  return (
    <StatCard title="System Overview" subtitle="Host and operating system details">
      {loading && !info ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
          <SkeletonRows count={3} />
          <SkeletonRows count={4} />
        </div>
      ) : info ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
          <div>
            <Row label="OS" value={`${info.osName} ${info.osVersion}`.trim() || "Unknown"} />
            <Row label="Hostname" value={info.hostname || "Unknown"} />
            <Row label="Kernel" value={info.kernelVersion || "Unknown"} />
          </div>
          <div>
            <Row label="CPU Model" value={info.cpuBrand || "Unknown"} />
            <Row
              label="Cores"
              value={`${info.cpuPhysicalCores} physical / ${info.cpuLogicalCores} logical`}
            />
            <Row label="Total RAM" value={formatBytes(info.totalMemory)} />
            <Row label="Uptime" value={formatUptime(info.uptimeSeconds)} />
          </div>
        </div>
      ) : (
        <div className="text-sm text-gray-500">No system information available.</div>
      )}
    </StatCard>
  );
}
