import { clampPercent } from "../utils/format";

interface ProgressBarProps {
  value: number;
  heightClassName?: string;
  className?: string;
  showLabel?: boolean;
}

function colorClass(value: number): string {
  if (value < 60) return "bg-emerald-500";
  if (value <= 85) return "bg-amber-500";
  return "bg-red-500";
}

export default function ProgressBar({
  value,
  heightClassName = "h-2.5",
  className = "",
  showLabel = false,
}: ProgressBarProps) {
  const safe = clampPercent(value);
  return (
    <div className={className}>
      <div className={`w-full bg-gray-800/80 rounded-full overflow-hidden ${heightClassName}`}>
        <div
          className={`${heightClassName} ${colorClass(safe)} rounded-full transition-all duration-500`}
          style={{ width: `${safe}%` }}
          aria-valuenow={safe}
          aria-valuemin={0}
          aria-valuemax={100}
          role="progressbar"
        />
      </div>
      {showLabel && <div className="mt-1 text-xs text-gray-400">{safe.toFixed(1)}%</div>}
    </div>
  );
}
