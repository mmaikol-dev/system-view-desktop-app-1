# PCMind

PCMind v1 is a lightweight cross-platform desktop system monitor built with **Tauri 2**, **React + TypeScript + Vite**, **Tailwind CSS**, and the Rust **sysinfo** crate.

## v1 Scope

Included:
- CPU usage (overall + per-core)
- RAM usage
- Disk usage
- OS/system information

Not included in v1 (sidebar placeholders only):
- Processes
- Hardware details
- Network
- Settings

## Tech Stack

- **Desktop shell:** Tauri 2 (Rust backend)
- **Frontend:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS
- **System data:** `sysinfo` crate
- **No server, no database, no Laravel**

## Project Structure

```text
pcmind/
  README.md
  src/
    components/
      Sidebar.tsx
      StatCard.tsx
      ProgressBar.tsx
      SystemOverview.tsx
      CpuCard.tsx
      MemoryCard.tsx
      DiskCard.tsx
    hooks/
      useSystemStats.ts
    types/
      system.ts
    utils/
      format.ts
    App.tsx
    main.tsx
    index.css
  src-tauri/
    src/
      lib.rs        # Tauri builder + managed state
      commands.rs   # Tauri commands
      models.rs     # Serializable structs
      main.rs
    Cargo.toml
    tauri.conf.json
```

## Prerequisites

### Linux (Ubuntu/Debian)

Install Rust, Node.js/npm, and Tauri system dependencies:

```bash
# Rust (if not installed)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"

# Node.js/npm (if not installed) - use your preferred method
# Example: NodeSource or distro packages

# Tauri / WebKitGTK prerequisites
sudo apt update
sudo apt install -y \
  build-essential \
  curl \
  wget \
  file \
  libssl-dev \
  pkg-config \
  libglib2.0-dev \
  libgtk-3-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev \
  libwebkit2gtk-4.1-dev \
  libjavascriptcoregtk-4.1-dev \
  libsoup-3.0-dev
```

Notes:
- On some distros, `libayatana-appindicator3-dev` may be named differently or optional depending on tray usage.
- Tauri 2 on Linux typically requires WebKitGTK 4.1 and libsoup3.

### Windows

1. **Node.js LTS** (includes npm): https://nodejs.org/
2. **Rust (MSVC toolchain)** via rustup: https://rustup.rs/
3. **Microsoft Visual Studio C++ Build Tools** (MSVC):
   - Install “Desktop development with C++” workload
   - https://visualstudio.microsoft.com/visual-cpp-build-tools/
4. **WebView2 Runtime** (usually already installed on Windows 10/11):
   - https://developer.microsoft.com/en-us/microsoft-edge/webview2/

## Setup

```bash
cd ~/Projects/pcmind   # or /home/atlas/projects/pcmind on this machine
npm install
```

## Run (Development)

```bash
npm run tauri dev
```

This starts the Vite dev server and launches the Tauri desktop window.

## Build (Production)

```bash
npm run tauri build
```

Build artifacts are generated under `src-tauri/target/`.

## Tauri Commands (v1)

All commands return `Result<T, String>` and never panic.

- `get_system_info()` -> hostname, OS name/version, kernel, CPU brand, physical/logical cores, total memory (bytes), uptime (seconds)
- `get_cpu_usage()` -> overall CPU % + per-core %
- `get_memory_usage()` -> total/used/available bytes + usage %
- `get_disk_usage()` -> disks (name, mount point, fs, total/used/available bytes, usage %)

Implementation notes:
- A single shared `sysinfo::System` is kept in Tauri managed state (`Mutex<System>`) for correct CPU delta calculations between refreshes.
- Pseudo filesystems are filtered out from disk output (`tmpfs`, `squashfs`, loop devices, etc.).

## Frontend Behavior

- Polls system stats every 2 seconds via `@tauri-apps/api/core` `invoke()`
- Custom hook: `src/hooks/useSystemStats.ts`
- Interval is cleared on unmount
- Loading and error states shown in UI
- Progress bar colors: green < 60%, amber 60-85%, red > 85%
- Bytes formatted as GB/MB/KB with one decimal place

## Troubleshooting

### Linux: `glib-2.0.pc` / `webkit2gtk-4.1` not found

Install the missing system packages listed in the Linux prerequisites, then rerun:

```bash
npm run tauri dev
```

### Windows: build/link errors

Make sure MSVC Build Tools + Rust MSVC target are installed, and WebView2 is present.
