'use client';

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { DashboardStats } from '@/lib/api/types';
import { AXIS, ChartTooltip, GRID, SERIES } from './chart-theme';

type Timeline = DashboardStats['timeline'];
type Bars = DashboardStats['patientsPerDoctor'];
type Slices = DashboardStats['byCondition'];

const truncate = (value: string, max = 18) => (value.length > max ? `${value.slice(0, max - 1)}…` : value);

export function TimelineChart({ data }: { data: Timeline }) {
  return (
    <div className="h-64 w-full text-ink-faint">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
          <defs>
            <linearGradient id="timelineFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={SERIES[0]} stopOpacity={0.32} />
              <stop offset="100%" stopColor={SERIES[0]} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid {...GRID} />
          <XAxis dataKey="label" {...AXIS} interval="preserveStartEnd" minTickGap={12} />
          <YAxis {...AXIS} allowDecimals={false} width={44} />
          <Tooltip content={<ChartTooltip unit=" patients" />} />
          <Area
            type="monotone"
            dataKey="patients"
            name="Patients"
            stroke={SERIES[0]}
            strokeWidth={2}
            fill="url(#timelineFill)"
            activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PatientsPerDoctorChart({ data }: { data: Bars }) {
  return (
    <div className="h-[336px] w-full text-ink-faint">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 28, bottom: 0, left: 4 }}
        >
          <CartesianGrid {...GRID} horizontal={false} />
          <XAxis type="number" {...AXIS} allowDecimals={false} />
          <YAxis
            type="category"
            dataKey="name"
            {...AXIS}
            width={150}
            tickFormatter={(value: string) => truncate(value, 22)}
          />
          <Tooltip
            content={<ChartTooltip unit=" patients" />}
            cursor={{ fill: 'currentColor', fillOpacity: 0.06 }}
          />
          <Bar dataKey="patients" name="Patients" fill={SERIES[1]} radius={[0, 4, 4, 0]} barSize={16} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ConditionMixChart({ data }: { data: Slices }) {
  const total = data.reduce((sum, row) => sum + row.count, 0);

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row">
      <div className="relative h-48 w-48 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<ChartTooltip />} />
            <Pie
              data={data}
              dataKey="count"
              nameKey="condition"
              innerRadius="66%"
              outerRadius="100%"
              paddingAngle={2}
              stroke="none"
            >
              {data.map((row, index) => (
                <Cell key={row.condition} fill={SERIES[index % SERIES.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-semibold text-ink">{total.toLocaleString()}</span>
          <span className="text-[11px] text-ink-faint">tracked</span>
        </div>
      </div>

      <ul className="flex min-w-0 flex-1 flex-col gap-1.5">
        {data.map((row, index) => (
          <li key={row.condition} className="flex items-center gap-2 text-[13px]">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-sm"
              style={{ background: SERIES[index % SERIES.length] }}
              aria-hidden="true"
            />
            <span className="min-w-0 flex-1 truncate text-ink-muted">{row.condition}</span>
            <span className="font-medium text-ink">{row.count}</span>
            <span className="w-10 text-right text-ink-faint">
              {total ? Math.round((row.count / total) * 100) : 0}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * A plain bar list instead of a second chart library widget: the values are
 * ranked counts, so a proportional row communicates them without an axis.
 */
export function SpecializationBars({ data }: { data: DashboardStats['bySpecialization'] }) {
  const max = Math.max(1, ...data.map((row) => row.count));

  return (
    <ul className="flex flex-col gap-3">
      {data.map((row, index) => (
        <li key={row.specialization}>
          <div className="flex items-baseline justify-between gap-3 text-[13px]">
            <span className="min-w-0 truncate text-ink-muted">{row.specialization}</span>
            <span className="font-medium text-ink">{row.count}</span>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
            <div
              className="h-full rounded-full"
              style={{
                width: `${(row.count / max) * 100}%`,
                background: SERIES[index % SERIES.length],
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
