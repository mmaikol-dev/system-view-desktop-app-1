use std::sync::Mutex;

use sysinfo::{Disks, System};
use tauri::State;

use crate::models::{CpuUsage, DiskUsage, MemoryUsage, SystemInfo};

pub struct AppState {
    pub system: Mutex<System>,
}

fn to_string_or_unknown(value: Option<String>) -> String {
    let trimmed = value.unwrap_or_default().trim().to_string();
    if trimmed.is_empty() {
        "Unknown".to_string()
    } else {
        trimmed
    }
}

fn percent(used: u64, total: u64) -> f32 {
    if total == 0 {
        0.0
    } else {
        ((used as f64 / total as f64) * 100.0) as f32
    }
}

fn is_pseudo_fs(file_system: &str) -> bool {
    matches!(
        file_system.to_ascii_lowercase().as_str(),
        "tmpfs"
            | "devtmpfs"
            | "squashfs"
            | "overlay"
            | "proc"
            | "sysfs"
            | "cgroup"
            | "cgroup2"
            | "pstore"
            | "autofs"
            | "mqueue"
            | "hugetlbfs"
            | "debugfs"
            | "tracefs"
            | "ramfs"
            | "nsfs"
            | "fusectl"
            | "configfs"
            | "securityfs"
            | "efivarfs"
            | "binfmt_misc"
    )
}

#[tauri::command]
pub fn get_system_info(state: State<'_, AppState>) -> Result<SystemInfo, String> {
    let mut system = state
        .system
        .lock()
        .map_err(|e| format!("Failed to lock system state: {e}"))?;

    system.refresh_memory();
    system.refresh_cpu_all();

    let cpu_brand = system
        .cpus()
        .first()
        .map(|cpu| cpu.brand().trim().to_string())
        .filter(|s| !s.is_empty())
        .unwrap_or_else(|| "Unknown CPU".to_string());

    let cpu_physical_cores = system.physical_core_count().unwrap_or(0);
    let cpu_logical_cores = system.cpus().len();
    let total_memory = system.total_memory();
    let uptime_seconds = System::uptime();

    Ok(SystemInfo {
        hostname: to_string_or_unknown(System::host_name()),
        os_name: to_string_or_unknown(System::name()),
        os_version: to_string_or_unknown(System::os_version()),
        kernel_version: to_string_or_unknown(System::kernel_version()),
        cpu_brand,
        cpu_physical_cores,
        cpu_logical_cores,
        total_memory,
        uptime_seconds,
    })
}

#[tauri::command]
pub fn get_cpu_usage(state: State<'_, AppState>) -> Result<CpuUsage, String> {
    let mut system = state
        .system
        .lock()
        .map_err(|e| format!("Failed to lock system state: {e}"))?;

    system.refresh_cpu_usage();

    let per_core: Vec<f32> = system.cpus().iter().map(|cpu| cpu.cpu_usage()).collect();
    let overall = if per_core.is_empty() {
        0.0
    } else {
        per_core.iter().sum::<f32>() / per_core.len() as f32
    };

    Ok(CpuUsage { overall, per_core })
}

#[tauri::command]
pub fn get_memory_usage(state: State<'_, AppState>) -> Result<MemoryUsage, String> {
    let mut system = state
        .system
        .lock()
        .map_err(|e| format!("Failed to lock system state: {e}"))?;

    system.refresh_memory();

    let total = system.total_memory();
    let available = system.available_memory();
    let used = total.saturating_sub(available);
    let usage_percent = percent(used, total);

    Ok(MemoryUsage {
        total,
        used,
        available,
        usage_percent,
    })
}

#[tauri::command]
pub fn get_disk_usage() -> Result<Vec<DiskUsage>, String> {
    let disks = Disks::new_with_refreshed_list();
    let mut result = Vec::new();

    for disk in disks.list() {
        let name = disk.name().to_string_lossy().trim().to_string();
        let mount_point = disk.mount_point().to_string_lossy().trim().to_string();
        let file_system = disk.file_system().to_string_lossy().trim().to_string();

        if name.is_empty() && mount_point.is_empty() {
            continue;
        }

        let lower_name = name.to_ascii_lowercase();
        if lower_name.starts_with("/dev/loop") || lower_name.contains("loop") {
            continue;
        }
        if is_pseudo_fs(&file_system) {
            continue;
        }

        let total = disk.total_space();
        let available = disk.available_space();
        let used = total.saturating_sub(available);
        let usage_percent = percent(used, total);

        result.push(DiskUsage {
            name: if name.is_empty() {
                "Unknown disk".to_string()
            } else {
                name
            },
            mount_point: if mount_point.is_empty() {
                "Unknown".to_string()
            } else {
                mount_point
            },
            file_system: if file_system.is_empty() {
                "Unknown".to_string()
            } else {
                file_system
            },
            total,
            used,
            available,
            usage_percent,
        });
    }

    Ok(result)
}
