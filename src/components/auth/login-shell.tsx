import { Activity, BarChart3, Search, ShieldCheck } from 'lucide-react';
import type { ReactNode } from 'react';

const POINTS = [
  { icon: Search, text: 'Instant search across the register and every patient record' },
  { icon: BarChart3, text: 'Case mix, workload and 12-month trends at a glance' },
  { icon: ShieldCheck, text: 'Session-scoped access with server-side revocation' },
];

export function LoginShell({ children }: { children?: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-panel px-10 py-12 text-panel-ink lg:flex">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-25 [background:radial-gradient(60%_60%_at_20%_10%,#ffffff55,transparent),radial-gradient(50%_50%_at_90%_90%,#00000044,transparent)]"
        />
        <div className="relative flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-brand text-on-accent">
            <Activity size={17} strokeWidth={2.4} />
          </span>
          <span className="text-sm font-semibold">Doctor Tracker</span>
        </div>

        <div className="relative max-w-md">
          <h1 className="text-[28px] font-semibold leading-tight tracking-tight">
            The clinic register, without the spreadsheet.
          </h1>
          <ul className="mt-7 flex flex-col gap-4">
            {POINTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-[13px] text-panel-ink/85">
                <Icon size={16} className="mt-0.5 shrink-0" />
                {text}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-panel-ink/60">
          Express 5 · MongoDB Atlas · Next.js
        </p>
      </div>

      <div className="flex items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
