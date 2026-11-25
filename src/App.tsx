import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { SystemInfo } from "./types/system";

export default function App() {
  const [data, setData] = useState<SystemInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    invoke<SystemInfo>("get_system_info")
      .then(setData)
      .catch((err) => setError(String(err)));
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0f14] text-gray-100 p-6">
      <h1 className="text-2xl font-semibold mb-4">PCMind - Stage 2: get_system_info</h1>
      {error && <pre className="text-red-400 whitespace-pre-wrap">{error}</pre>}
      <pre className="bg-[#111827] border border-[#1f2937] rounded-lg p-4 overflow-auto text-sm">
        {data ? JSON.stringify(data, null, 2) : "Loading..."}
      </pre>
    </div>
  );
}
