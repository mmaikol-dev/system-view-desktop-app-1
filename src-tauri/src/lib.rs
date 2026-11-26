mod commands;
mod models;

use std::sync::Mutex;
use sysinfo::System;
use tauri::{image::Image, Manager};

use commands::AppState;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut system = System::new();
    system.refresh_memory();
    system.refresh_cpu_all();
    std::thread::sleep(std::time::Duration::from_millis(200));
    system.refresh_cpu_usage();

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(AppState {
            system: Mutex::new(system),
        })
        .setup(|app| {
            let icon = Image::new_owned(
                include_bytes!("../icons/icon.rgba").to_vec(),
                512,
                512,
            );
            if let Some(window) = app.get_webview_window("main") {
                window.set_icon(icon).ok();
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::get_system_info,
            commands::get_cpu_usage,
            commands::get_memory_usage,
            commands::get_disk_usage,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
