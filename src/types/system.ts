export interface SystemInfo {
  hostname: string;
  osName: string;
  osVersion: string;
  kernelVersion: string;
  cpuBrand: string;
  cpuPhysicalCores: number;
  cpuLogicalCores: number;
  totalMemory: number;
  uptimeSeconds: number;
}

export interface CpuUsage {
  overall: number;
  perCore: number[];
}

export interface MemoryUsage {
  total: number;
  used: number;
  available: number;
  usagePercent: number;
}

export interface DiskUsage {
  name: string;
  mountPoint: string;
  fileSystem: string;
  total: number;
  used: number;
  available: number;
  usagePercent: number;
}

export interface SystemStats {
  systemInfo: SystemInfo | null;
  cpu: CpuUsage | null;
  memory: MemoryUsage | null;
  disks: DiskUsage[];
}
