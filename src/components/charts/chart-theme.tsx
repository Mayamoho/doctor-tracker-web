/**
 * Chart colours are fixed rather than theme tokens: Recharts writes `fill` and
 * `stroke` as SVG presentation attributes, and `var(…)` does not resolve there.
 * These are mid-lightness enough to read on both surfaces, and anything that can
 * take `currentColor` (axes, grid) inherits the theme instead.
 */
export const SERIES = ['#4f6ef7', '#2aa5a0', '#e0873c', '#c1557f', '#7a5bd6', '#3f9d5a', '#b8892b'];

export const AXIS = {
  tick: { fill: 'currentColor', fontSize: 11 },
  axisLine: { stroke: 'currentColor', opacity: 0.25 },
  tickLine: false,
} as const;

export const GRID = {
  stroke: 'currentColor',
  strokeOpacity: 0.12,
  strokeDasharray: '3 3',
} as const;

/**
 * Recharts 3 does not export a usable `TooltipProps` for custom content, so the
 * shape is declared from what the library actually passes in.
 */
interface TooltipEntry {
  name?: string;
  value?: number | string;
  dataKey?: string | number;
  color?: string;
  fill?: string;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string | number;
  unit?: string;
}

export function ChartTooltip({ active, payload, label, unit }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="card px-3 py-2 text-[13px] shadow-lg">
      {label !== undefined ? <p className="mb-1 font-medium text-ink">{label}</p> : null}
      {payload.map((entry) => (
        <p key={String(entry.dataKey ?? entry.name)} className="flex items-center gap-2 text-ink-muted">
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ background: entry.color ?? entry.fill ?? SERIES[0] }}
            aria-hidden="true"
          />
          <span>{entry.name}</span>
          <span className="ml-auto font-semibold text-ink">
            {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
            {unit}
          </span>
        </p>
      ))}
    </div>
  );
}
