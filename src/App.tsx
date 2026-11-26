import { Activity, Cpu, HardDrive, MemoryStick } from "lucide-react";
import Sidebar from "./components/Sidebar";
import SystemOverview from "./components/SystemOverview";
import CpuCard from "./components/CpuCard";
import MemoryCard from "./components/MemoryCard";
import DiskCard from "./components/DiskCard";
import MetricCard from "./components/MetricCard";
import { useSystemStats } from "./hooks/useSystemStats";
import { formatBytes } from "./utils/format";

function formatAgo(ts: number | null): string {
  if (!ts) return "Never";
  const s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (s < 2) return "just now";
  if (s < 60) return `${s}s ago`;
  return `${Math.floor(s / 60)}m ago`;
}

export default function App() {
  const { stats, history, loading, error, refresh, lastUpdated } = useSystemStats(2000);
  const cpu = stats.cpu?.overall ?? 0;
  const mem = stats.memory?.usagePercent ?? 0;
  const diskAvg = stats.disks.length
    ? stats.disks.reduce((a, d) => a + d.usagePercent, 0) / stats.disks.length
    : 0;
  const cpuColor = cpu > 85 ? "#f87171" : cpu >= 60 ? "#fbbf24" : "#34d399";
  const memColor = mem > 85 ? "#f87171" : mem >= 60 ? "#fbbf24" : "#60a5fa";

  return (
    <div className="h-screen min-h-[600px] min-w-[900px] bg-[#090d13] text-gray-100 flex overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.08),_transparent_45%),radial-gradient(ellipse_at_bottom_right,_rgba(59,130,246,0.06),_transparent_40%)]" />
      <Sidebar active="Dashboard" />

      <div className="relative flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-[#1f2937]/80 bg-[#090d13]/80 backdrop-blur px-6 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">PCMind</h1>
            <p className="text-xs text-gray-500">Live system telemetry · updated {formatAgo(lastUpdated)}</p>
          </div>
          <div className="flex items-center gap-3">
            {error && (
              <button
                type="button"
                onClick={() => void refresh()}
                className="text-xs px-2.5 py-1.5 rounded-md border border-red-800/60 bg-red-950/30 text-red-300 hover:bg-red-950/50 transition-colors"
                title={error}
              >
                Retry
              </button>
            )}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111827]/90 border border-[#1f2937]">
              <span className={`w-2 h-2 rounded-full ${error ? "bg-red-500" : "bg-emerald-500 animate-pulse"}`} />
              <span className={`text-xs font-medium ${error ? "text-red-300" : "text-emerald-300"}`}>
                {error ? "Degraded" : "Live"}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          {error && (
            <div className="mb-4 rounded-lg border border-red-900/60 bg-red-950/20 px-4 py-3 text-sm text-red-300">
              <span className="font-medium">Failed to refresh stats: </span>
              <span className="break-words">{error}</span>
            </div>
          )}

          <div className="space-y-5 max-w-[1500px]">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <MetricCard
                label="CPU Load"
                value={`${cpu.toFixed(1)}%`}
                subvalue={`${stats.cpu?.perCore.length ?? 0} logical cores`}
                icon={<Cpu size={18} />}
                trend={history.cpu}
                trendColor={cpuColor}
                accent="from-emerald-500/10 to-transparent"
              />
              <MetricCard
                label="Memory"
                value={`${mem.toFixed(1)}%`}
                subvalue={stats.memory ? `${formatBytes(stats.memory.used)} / ${formatBytes(stats.memory.total)}` : "—"}
                icon={<MemoryStick size={18} />}
                trend={history.memory}
                trendColor={memColor}
                trendFormatter={(v) => `${v.toFixed(1)}%`}
                accent="from-blue-500/10 to-transparent"
              />
              <MetricCard
                label="Storage Avg"
                value={`${diskAvg.toFixed(1)}%`}
                subvalue={`${stats.disks.length} disk${stats.disks.length === 1 ? "" : "s"} monitored`}
                icon={<HardDrive size={18} />}
                accent="from-amber-500/10 to-transparent"
              />
              <MetricCard
                label="System"
                value={stats.systemInfo?.hostname || "—"}
                subvalue={stats.systemInfo ? `${stats.systemInfo.osName} ${stats.systemInfo.osVersion}` : "Loading..."}
                icon={<Activity size={18} />}
                accent="from-violet-500/10 to-transparent"
              />
            </div>

            <SystemOverview info={stats.systemInfo} loading={loading} />

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              <CpuCard cpu={stats.cpu} loading={loading} history={history.cpu} />
              <MemoryCard memory={stats.memory} loading={loading} history={history.memory} />
            </div>

            <DiskCard disks={stats.disks} loading={loading} />
          </div>
        </main>
      </div>
    </div>
  );
}
