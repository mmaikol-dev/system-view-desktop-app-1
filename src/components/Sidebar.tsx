interface SidebarProps {
  active?: string;
}

const ITEMS = [
  { name: "Dashboard", disabled: false },
  { name: "Processes", disabled: true },
  { name: "Hardware", disabled: true },
  { name: "Storage", disabled: true },
  { name: "Network", disabled: true },
  { name: "Settings", disabled: true },
];

export default function Sidebar({ active = "Dashboard" }: SidebarProps) {
  return (
    <aside className="w-60 shrink-0 bg-[#0f172a] border-r border-[#1f2937] flex flex-col">
      <div className="px-5 py-5 border-b border-[#1f2937]">
        <div className="flex items-center gap-2">
          <img src="/favicon.svg" alt="PCMind logo" className="w-8 h-8 rounded-lg" />
          <div>
            <div className="text-base font-semibold text-gray-100 leading-tight">PCMind</div>
            <div className="text-[11px] text-gray-500">System Monitor</div>
          </div>
        </div>
      </div>

      <nav className="p-3 flex-1">
        <ul className="space-y-1">
          {ITEMS.map((item) => {
            const isActive = item.name === active;
            return (
              <li key={item.name}>
                <button
                  type="button"
                  disabled={item.disabled}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm flex items-center justify-between transition-colors ${
                    isActive
                      ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                      : item.disabled
                        ? "text-gray-500 cursor-not-allowed"
                        : "text-gray-300 hover:bg-gray-800/60"
                  }`}
                >
                  <span>{item.name}</span>
                  {item.disabled && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-500 border border-gray-700">
                      Soon
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-[#1f2937] text-[11px] text-gray-600">
        PCMind v1
      </div>
    </aside>
  );
}
