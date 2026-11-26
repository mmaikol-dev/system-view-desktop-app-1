import type { ReactNode } from "react";

interface StatCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  right?: ReactNode;
}

export default function StatCard({ title, subtitle, children, className = "", right }: StatCardProps) {
  return (
    <section
      className={`bg-[#111827] border border-[#1f2937] rounded-xl p-5 shadow-sm shadow-black/20 ${className}`}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-100 tracking-wide uppercase">{title}</h2>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}
