import { useCallback, useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { CpuUsage, DiskUsage, MemoryUsage, SystemInfo, SystemStats } from "../types/system";

interface UseSystemStatsResult {
  stats: SystemStats;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const INITIAL_STATS: SystemStats = {
  systemInfo: null,
  cpu: null,
  memory: null,
  disks: [],
};

function toErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  try {
    return JSON.stringify(err);
  } catch {
    return "Unknown error";
  }
}

export function useSystemStats(pollMs = 2000): UseSystemStatsResult {
  const [stats, setStats] = useState<SystemStats>(INITIAL_STATS);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
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
      setStats({ systemInfo, cpu, memory, disks });
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

  return { stats, loading, error, refresh };
}
