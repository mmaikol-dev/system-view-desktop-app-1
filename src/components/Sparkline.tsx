import { useId, useMemo, useRef, useState, useEffect } from "react";

interface SparklineProps {
  data: number[];
  height?: number;
  color?: string;
  fill?: string;
  strokeWidth?: number;
  className?: string;
  valueFormatter?: (v: number) => string;
}

function buildPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const mx = (prev.x + curr.x) / 2;
    d += ` C ${mx} ${prev.y}, ${mx} ${curr.y}, ${curr.x} ${curr.y}`;
  }
  return d;
}

export default function Sparkline({
  data,
  height = 56,
  color = "#34d399",
  fill,
  strokeWidth = 2,
  className = "",
  valueFormatter = (v) => `${v.toFixed(1)}%`,
}: SparklineProps) {
  const id = useId().replace(/:/g, "");
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(300);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w && w > 10) setWidth(Math.floor(w));
    });
    ro.observe(el);
    setWidth(Math.floor(el.clientWidth || 300));
    return () => ro.disconnect();
  }, []);

  const { points, path, areaPath, min, max } = useMemo(() => {
    const safe = data.length > 0 ? data : [0, 0];
    const minV = Math.min(...safe);
    const maxV = Math.max(...safe);
    const pad = 4;
    const range = maxV - minV || 1;
    const pts = safe.map((v, i) => {
      const x = (i / Math.max(1, safe.length - 1)) * width;
      const y = height - pad - ((v - minV) / range) * (height - pad * 2);
      return { x, y, v };
    });
    const line = buildPath(pts);
    const area = `${line} L ${width} ${height} L 0 ${height} Z`;
    return { points: pts, path: line, areaPath: area, min: minV, max: maxV };
  }, [data, width, height]);

  const active = hover !== null ? points[hover] : null;

  return (
    <div ref={ref} className={`relative w-full ${className}`} style={{ height }}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible block"
        onMouseLeave={() => setHover(null)}
        onMouseMove={(e) => {
          const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
          const x = e.clientX - rect.left;
          const idx = Math.round((x / Math.max(1, rect.width)) * (points.length - 1));
          setHover(Math.max(0, Math.min(points.length - 1, idx)));
        }}
      >
        <defs>
          <linearGradient id={`spark-fill-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={fill ?? color} stopOpacity="0.28" />
            <stop offset="100%" stopColor={fill ?? color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#spark-fill-${id})`} />
        <path d={path} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
        {active && (
          <>
            <line x1={active.x} x2={active.x} y1={0} y2={height} stroke={color} strokeOpacity="0.25" strokeDasharray="3 3" />
            <circle cx={active.x} cy={active.y} r="3.5" fill={color} />
            <circle cx={active.x} cy={active.y} r="6" fill={color} fillOpacity="0.15" />
          </>
        )}
      </svg>
      {active && (
        <div
          className="pointer-events-none absolute -top-7 px-2 py-0.5 rounded-md text-[11px] bg-[#111827] border border-[#334155] text-gray-100 whitespace-nowrap"
          style={{ left: Math.max(0, Math.min(width - 52, active.x - 20)) }}
        >
          {valueFormatter(active.v)}
        </div>
      )}
      <div className="sr-only">Min {min.toFixed(1)}, Max {max.toFixed(1)}</div>
    </div>
  );
}
