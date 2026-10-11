'use client';

import { CalendarRange, RefreshCw, Stethoscope, TrendingUp, UserPlus, Users } from 'lucide-react';
import { ConditionMixChart, PatientsPerDoctorChart, SpecializationBars, TimelineChart } from '@/components/charts/dashboard-charts';
import { StatCard, StatCardSkeleton } from '@/components/data/stat-card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { Panel } from '@/components/ui/panel';
import { CardSkeleton, ErrorState } from '@/components/ui/states';
import { useDashboardStats } from '@/lib/hooks/use-dashboard';

export function DashboardView() {
  const { data, isPending, isError, error, refetch, isFetching } = useDashboardStats();

  return (
    <>
      <PageHeader
        title="Overview"
        subtitle="Clinic activity across the register, aggregated server-side in two passes."
        actions={
          <Button
            size="sm"
            icon={<RefreshCw size={14} />}
            onClick={() => void refetch()}
            pending={isFetching && !isPending}
          >
            Refresh
          </Button>
        }
      />

      {isError ? (
        <div className="card">
          <ErrorState error={error} onRetry={() => void refetch()} />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            {data ? (
              <>
                <StatCard
                  label="Doctors"
                  value={data.totals.doctors.toLocaleString()}
                  hint={`+${data.totals.doctorsThisMonth} this month`}
                  icon={<Stethoscope size={16} />}
                />
                <StatCard
                  label="Patients"
                  value={data.totals.patients.toLocaleString()}
                  hint={`${data.totals.avgPatientsPerDoctor} per doctor`}
                  icon={<Users size={16} />}
                  tone="info"
                />
                <StatCard
                  label="Visits this week"
                  value={data.totals.patientsThisWeek.toLocaleString()}
                  hint="Since Monday, UTC"
                  icon={<CalendarRange size={16} />}
                  tone="success"
                />
                <StatCard
                  label="Visits this month"
                  value={data.totals.patientsThisMonth.toLocaleString()}
                  hint="Calendar month to date"
                  icon={<UserPlus size={16} />}
                  tone="warning"
                />
              </>
            ) : (
              Array.from({ length: 4 }, (_, index) => <StatCardSkeleton key={index} />)
            )}
          </div>

          <Panel
            title="Patient activity"
            subtitle="Visits recorded per month over the last twelve"
            actions={
              data ? (
                <span className="flex items-center gap-1.5 text-[11px] text-ink-faint">
                  <TrendingUp size={13} />
                  {data.timeline[data.timeline.length - 1]?.patients.toLocaleString() ?? 0} this month
                </span>
              ) : null
            }
          >
            {data ? <TimelineChart data={data.timeline} /> : <CardSkeleton height="h-64" />}
          </Panel>

          <div className="grid gap-4 lg:grid-cols-3">
            <Panel
              title="Busiest doctors"
              subtitle="Top eight by patients tracked"
              className="lg:col-span-2"
            >
              {data ? (
                <PatientsPerDoctorChart data={data.patientsPerDoctor} />
              ) : (
                <CardSkeleton height="h-[336px]" />
              )}
            </Panel>

            <Panel title="Specializations" subtitle="Doctors per department">
              {data ? <SpecializationBars data={data.bySpecialization} /> : <CardSkeleton height="h-56" />}
            </Panel>
          </div>

          <Panel title="Case mix" subtitle="Most tracked conditions across all patients">
            {data ? <ConditionMixChart data={data.byCondition} /> : <CardSkeleton height="h-48" />}
          </Panel>
        </div>
      )}
    </>
  );
}
