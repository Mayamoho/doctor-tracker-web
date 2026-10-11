'use client';

import { Activity, LayoutDashboard, LogOut, Menu, Stethoscope, Users, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/states';
import { initials } from '@/lib/format';
import { useActivePath } from '@/lib/hooks/use-active-path';
import { useSession } from '@/lib/hooks/use-session';

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/doctors', label: 'Doctors', icon: Stethoscope },
  { href: '/patients', label: 'Patients', icon: Users },
] as const;

function isActive(active: string | null, href: string): boolean {
  return active === href || (active !== null && active.startsWith(`${href}/`));
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const active = useActivePath();

  return (
    <nav aria-label="Primary" className="flex flex-col gap-0.5">
      {NAV.map(({ href, label, icon: Icon }) => {
        const current = isActive(active, href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={current ? 'page' : undefined}
            className={[
              'flex items-center gap-2.5 rounded-[9px] px-2.5 py-2 text-[13px] font-medium transition-colors',
              current
                ? 'bg-brand-soft text-brand'
                : 'text-ink-muted hover:bg-surface-muted hover:text-ink',
            ].join(' ')}
          >
            <Icon size={15} strokeWidth={current ? 2.2 : 1.8} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function Brand() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2.5 px-1 py-1">
      <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-brand text-on-accent">
        <Activity size={16} strokeWidth={2.4} />
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-[13px] font-semibold text-ink">Doctor Tracker</span>
        <span className="text-[11px] text-ink-faint">Admin portal</span>
      </span>
    </Link>
  );
}

function UserPanel({ name, email, onLogout, pending }: { name: string; email: string; onLogout: () => void; pending: boolean }) {
  return (
    <div className="flex items-center gap-2.5 rounded-[10px] border border-line bg-surface p-2.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-muted text-[11px] font-semibold text-ink-muted">
        {initials(name)}
      </span>
      <span className="min-w-0 flex-1 leading-tight">
        <span className="block truncate text-[13px] font-medium text-ink">{name}</span>
        <span className="block truncate text-[11px] text-ink-faint">{email}</span>
      </span>
      <Button
        size="sm"
        variant="ghost"
        onClick={onLogout}
        pending={pending}
        aria-label="Sign out"
        className="px-1.5"
      >
        {!pending ? <LogOut size={15} /> : null}
      </Button>
    </div>
  );
}

function BootUser() {
  return (
    <div className="flex items-center gap-2.5 rounded-[10px] border border-line bg-surface p-2.5">
      <Skeleton className="h-8 w-8 rounded-full" />
      <Skeleton className="h-3 flex-1" />
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, status, logout, loggingOut } = useSession();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login');
  }, [status, router]);

  const sidebar = (
    <div className="flex h-full flex-col gap-5 p-4">
      <Brand />
      <NavList onNavigate={() => setDrawerOpen(false)} />
      <div className="mt-auto flex flex-col gap-3">
        {user ? (
          <UserPanel name={user.name} email={user.email} onLogout={logout} pending={loggingOut} />
        ) : (
          <BootUser />
        )}
        <p className="text-[10px] leading-relaxed text-ink-faint">
          <span className="font-medium text-ink-muted">Demonstration data.</span> Doctor rows are real,
          publicly listed BMDC registrants with their contacts withheld. Patient rows are synthetic and
          describe no one’s medical history.
        </p>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r border-line bg-surface lg:block">
        {sidebar}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-surface/90 px-4 py-3 backdrop-blur lg:hidden">
          <Button
            size="sm"
            variant="ghost"
            aria-label="Open navigation"
            onClick={() => setDrawerOpen(true)}
            className="px-1.5"
          >
            <Menu size={18} />
          </Button>
          <Brand />
        </header>

        <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-5 sm:px-6 lg:py-7">
          {children}
        </main>
      </div>

      {drawerOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-[rgb(8_12_24/0.55)]"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 left-0 w-64 border-r border-line bg-surface shadow-xl">
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close navigation"
              className="absolute right-3 top-4 rounded p-1 text-ink-faint hover:text-ink"
            >
              <X size={16} />
            </button>
            {sidebar}
          </div>
        </div>
      ) : null}
    </div>
  );
}
