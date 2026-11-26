import { useCallback, useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { CpuUsage, DiskUsage, MemoryUsage, SystemInfo, SystemStats } from "../types/system";

export interface StatsHistory {
  cpu: number[];
  memory: number[];
  timestamps: number[];
}

interface UseSystemStatsResult {
  stats: SystemStats;
  history: StatsHistory;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  lastUpdated: number | null;
}

const INITIAL_STATS: SystemStats = {
  systemInfo: null,
  cpu: null,
  memory: null,
  disks: [],
};

const MAX_POINTS = 40;

function toErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  try {
    return JSON.stringify(err);
  } catch {
    return "Unknown error";
  }
}

function pushLimited(arr: number[], value: number, max: number): number[] {
  const next = arr.length >= max ? arr.slice(arr.length - max + 1) : arr.slice();
  next.push(value);
  return next;
}

export function useSystemStats(pollMs = 2000): UseSystemStatsResult {
  const [stats, setStats] = useState<SystemStats>(INITIAL_STATS);
  const [history, setHistory] = useState<StatsHistory>({ cpu: [], memory: [], timestamps: [] });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const mountedRef = useRef(true);
  const inFlightRef = useRef(false);

  const refresh = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    try {
      const [systemInfo, cpu, memory, disks] = await Promise.all([
        invoke<SystemInfo>("get_system_info"),
        invoke<CpuUsage>("get_cpu_usage"),
        invoke<MemoryUsage>("get_memory_usage"),
        invoke<DiskUsage[]>("get_disk_usage"),
      ]);

      if (!mountedRef.current) return;
      const now = Date.now();
      setStats({ systemInfo, cpu, memory, disks });
      setHistory((prev) => ({
        cpu: pushLimited(prev.cpu, cpu.overall, MAX_POINTS),
        memory: pushLimited(prev.memory, memory.usagePercent, MAX_POINTS),
        timestamps: pushLimited(prev.timestamps, now, MAX_POINTS),
      }));
      setLastUpdated(now);
      setError(null);
    } catch (err) {
      if (!mountedRef.current) return;
      setError(toErrorMessage(err));
    } finally {
      inFlightRef.current = false;
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    void refresh();
    const id = window.setInterval(() => {
      void refresh();
    }, pollMs);

    return () => {
      mountedRef.current = false;
      window.clearInterval(id);
    };
  }, [pollMs, refresh]);

  return { stats, history, loading, error, refresh, lastUpdated };
}
