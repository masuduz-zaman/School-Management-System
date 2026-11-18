"use client";

import { CalendarCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/ui/feedback";
import { Select } from "@/components/ui/form";
import { PageHeader } from "@/components/ui/page-header";
import { Bar, CountUp, ProgressRing } from "@/components/ui/progress";
import { useFetch } from "@/hooks/use-fetch";
import { cx, fmtMonth, fmtYmd } from "@/lib/format";
import type { AttendanceStatus, StudentAttendance } from "@/lib/types";

const weekdays = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"];
const cell: Record<AttendanceStatus, { cls: string; letter: string; label: string }> = {
  PRESENT: { cls: "bg-success-soft text-success", letter: "P", label: "Present" },
  ABSENT: { cls: "bg-danger-soft text-danger", letter: "A", label: "Absent" },
  LATE: { cls: "bg-gold-soft text-gold", letter: "L", label: "Late" },
};

function Calendar({ month, records }: { month: string; records: StudentAttendance["records"] }) {
  const byDay = new Map(records.map((r) => [r.date, r]));
  const first = new Date(`${month}-01T00:00:00Z`);
  const offset = (first.getUTCDay() + 1) % 7;
  const days = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();

  return (
    <div>
      <div className="mb-2 grid grid-cols-7 gap-1.5 text-center text-xs font-medium text-muted">{weekdays.map((d) => <span key={d}>{d}</span>)}</div>
      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: offset }).map((_, i) => <span key={`b${i}`} />)}
        {Array.from({ length: days }).map((_, i) => {
          const ymd = `${month}-${String(i + 1).padStart(2, "0")}`;
          const rec = byDay.get(ymd);
          return (
            <div key={ymd} title={rec ? `${fmtYmd(ymd)}: ${cell[rec.status].label}${rec.note ? `. ${rec.note}` : ""}` : fmtYmd(ymd)} className={cx("flex aspect-square flex-col items-center justify-center rounded-lg border text-sm", rec ? `${cell[rec.status].cls} border-transparent font-semibold` : "border-border text-muted")}>
              <span className="tabular-nums">{i + 1}</span>
              {rec && <span className="text-[0.65rem] leading-none">{cell[rec.status].letter}</span>}
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-muted">P is present, A is absent, L is late.</p>
    </div>
  );
}

export default function StudentAttendancePage() {
  const { data, loading, error, reload } = useFetch<StudentAttendance>("/student/attendance");
  const [pick, setPick] = useState("");
  const months = data?.monthly ?? [];
  const month = pick || months[0]?.month || "";
  const monthRecords = useMemo(() => (data?.records ?? []).filter((r) => r.date.startsWith(month)), [data, month]);

  if (loading) return <ListSkeleton />;
  if (error || !data) return <ErrorState message={error ?? "Could not load attendance."} onRetry={reload} />;
  if (data.overall.totalDays === 0) return <div className="card"><EmptyState icon={<CalendarCheck className="size-5" />} title="No attendance yet" description="Your class head teacher marks attendance each day. It will appear here." /></div>;

  const { overall } = data;
  const selected = months.find((m) => m.month === month);

  return (
    <>
      <PageHeader title="Attendance" description="Late counts as attended." />
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <section className="card card-pad flex flex-col items-center text-center">
          <ProgressRing value={overall.percentage} size={170} stroke={9} tone={overall.percentage >= 75 ? "success" : "danger"}>
            <span className="font-display text-5xl font-semibold tabular-nums"><CountUp value={overall.percentage} suffix="%" decimals={0} /></span>
          </ProgressRing>
          <p className="mt-4 text-sm text-muted">Across {overall.totalDays} school days</p>
          <dl className="mt-5 grid w-full grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-success-soft py-3"><dd className="font-display text-2xl font-semibold text-success">{overall.present}</dd><dt className="text-xs text-muted">Present</dt></div>
            <div className="rounded-xl bg-gold-soft py-3"><dd className="font-display text-2xl font-semibold text-gold">{overall.late}</dd><dt className="text-xs text-muted">Late</dt></div>
            <div className="rounded-xl bg-danger-soft py-3"><dd className="font-display text-2xl font-semibold text-danger">{overall.absent}</dd><dt className="text-xs text-muted">Absent</dt></div>
          </dl>
        </section>

        <section className="card card-pad">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-xl font-semibold">{month ? fmtMonth(month) : "Calendar"}</h2>
            <Select aria-label="Month" value={month} onChange={(e) => setPick(e.target.value)} className="!w-48">
              {months.map((m) => <option key={m.month} value={m.month}>{fmtMonth(m.month)}</option>)}
            </Select>
          </div>
          {selected && <p className="mb-4 text-sm text-muted">{selected.percentage}% attended. {selected.present} present, {selected.late} late, {selected.absent} absent.</p>}
          {month && <Calendar month={month} records={monthRecords} />}
        </section>
      </div>

      <section className="card card-pad mt-6">
        <h2 className="mb-4 font-display text-xl font-semibold">Month by month</h2>
        <ul className="space-y-3.5">
          {months.map((m) => (
            <li key={m.month} className="grid grid-cols-[110px_1fr_48px] items-center gap-3 text-sm">
              <span className="text-muted">{fmtMonth(m.month)}</span>
              <Bar value={m.percentage} tone={m.percentage >= 75 ? "success" : "danger"} />
              <span className="text-right tabular-nums">{m.percentage}%</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
