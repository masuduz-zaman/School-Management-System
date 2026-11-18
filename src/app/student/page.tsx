"use client";

import { Award, CalendarCheck, ClipboardList } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import { Badge, EmptyState, Skeleton } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page-header";
import { CountUp, ProgressRing } from "@/components/ui/progress";
import { useFetch } from "@/hooks/use-fetch";
import { dueText, fmtDateTime } from "@/lib/format";
import type { MyTeachers, NotificationList, StudentAssignment, StudentAttendance, StudentResults } from "@/lib/types";

export default function StudentHome() {
  const { user } = useAuth();
  const teachers = useFetch<MyTeachers>("/student/teachers");
  const attendance = useFetch<StudentAttendance>("/student/attendance");
  const assignments = useFetch<StudentAssignment[]>("/student/assignments");
  const results = useFetch<StudentResults>("/student/results");
  const notes = useFetch<NotificationList>("/student/notifications", { audience: "STUDENT" });

  const pending = (assignments.data ?? []).filter((a) => a.state === "PENDING");
  const latest = results.data?.exams[0];
  const overall = attendance.data?.overall;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const cls = teachers.data?.class?.name;

  return (
    <>
      <PageHeader title={`${greeting}, ${user?.name.split(" ")[0] ?? ""}`} description={cls ? `${cls}${user?.student?.classRoll ? `, roll ${user.student.classRoll}` : ""}` : "Your classes will show here once you are placed in one."} />

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="card card-pad flex items-center gap-5">
          {attendance.loading ? <Skeleton className="size-[120px] !rounded-full" /> : (
            <ProgressRing value={overall?.percentage ?? 0} tone={(overall?.percentage ?? 0) >= 75 ? "success" : "danger"}>
              <span className="font-display text-3xl font-semibold tabular-nums"><CountUp value={overall?.percentage ?? 0} suffix="%" decimals={0} /></span>
            </ProgressRing>
          )}
          <div>
            <h2 className="flex items-center gap-2 font-semibold"><CalendarCheck className="size-4 text-muted" />Attendance</h2>
            <p className="mt-1 text-sm text-muted">{overall?.totalDays ? `${overall.present} present, ${overall.late} late, ${overall.absent} absent` : "No attendance taken yet"}</p>
            <Link href="/student/attendance" className="mt-2 inline-block text-sm font-medium text-gold hover:underline">See calendar</Link>
          </div>
        </section>

        <section className="card card-pad">
          <h2 className="flex items-center gap-2 font-semibold"><ClipboardList className="size-4 text-muted" />To hand in</h2>
          {assignments.loading ? <Skeleton className="mt-4 h-12" /> : (
            <>
              <p className="mt-3 font-display text-5xl font-semibold tabular-nums"><CountUp value={pending.length} /></p>
              <p className="mt-1 text-sm text-muted">{pending.length === 0 ? "Nothing due. Well done." : pending.length === 1 ? "assignment waiting" : "assignments waiting"}</p>
            </>
          )}
          <Link href="/student/assignments" className="mt-3 inline-block text-sm font-medium text-gold hover:underline">Open assignments</Link>
        </section>

        <section className="card card-pad">
          <h2 className="flex items-center gap-2 font-semibold"><Award className="size-4 text-muted" />Latest result</h2>
          {results.loading ? <Skeleton className="mt-4 h-12" /> : latest ? (
            <>
              <div className="mt-3 flex items-baseline gap-3">
                <span className="font-display text-5xl font-semibold text-gold">{latest.grade}</span>
                <span className="tabular-nums text-muted">{latest.percentage}%</span>
              </div>
              <p className="mt-1 text-sm text-muted">{latest.exam.name}</p>
            </>
          ) : <p className="mt-3 text-sm text-muted">No results have been published yet.</p>}
          <Link href="/student/results" className="mt-3 inline-block text-sm font-medium text-gold hover:underline">See all results</Link>
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="card">
          <h2 className="border-b border-border px-5 py-4 font-display text-xl font-semibold">Due soon</h2>
          {!assignments.loading && pending.length === 0 ? <EmptyState title="Nothing due" description="New assignments appear here as soon as your teachers publish them." /> : (
            <ul className="divide-y divide-border">
              {pending.slice(0, 5).map((a) => (
                <li key={a.id}>
                  <Link href={`/student/assignments/${a.id}`} className="flex items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-surface-2">
                    <div className="min-w-0"><p className="truncate font-medium">{a.title}</p><p className="text-sm text-muted">{a.subject.name}</p></div>
                    <Badge tone="gold">{dueText(a.deadline)}</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="font-display text-xl font-semibold">Latest updates</h2>
            <Link href="/student/notifications" className="text-sm font-medium text-gold hover:underline">View all</Link>
          </div>
          {!notes.loading && (notes.data?.items.length ?? 0) === 0 ? <EmptyState title="No updates yet" description="Attendance, assignments and results show up here." /> : (
            <ul className="divide-y divide-border">
              {(notes.data?.items ?? []).slice(0, 5).map((n) => (
                <li key={n.id} className="px-5 py-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <p className={n.isRead ? "font-medium" : "font-semibold"}>{n.title}</p>
                    {!n.isRead && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-gold" aria-label="Unread" />}
                  </div>
                  <p className="clamp-3 mt-0.5 text-sm text-muted">{n.message}</p>
                  <p className="mt-1 text-xs text-muted">{fmtDateTime(n.createdAt)}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
