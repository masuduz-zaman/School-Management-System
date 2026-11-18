"use client";

import { Award, CalendarCheck, ClipboardList } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import { useTeacher } from "@/components/layout/teacher-provider";
import { Badge, EmptyState, ErrorState, Skeleton } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page-header";
import { Bar } from "@/components/ui/progress";
import { StatCard } from "@/components/ui/stat-card";
import { useFetch } from "@/hooks/use-fetch";
import { dueText } from "@/lib/format";
import type { TeacherAssignment } from "@/lib/types";

export default function TeacherHome() {
  const { user } = useAuth();
  const { overview, loading, error, reload } = useTeacher();
  const assignments = useFetch<TeacherAssignment[]>("/teacher/assignments");
  const list = assignments.data ?? [];
  const count = (s: TeacherAssignment["state"]) => list.filter((a) => a.state === s).length;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <>
      <PageHeader
        title={`${greeting}, ${user?.name.split(" ")[0] ?? ""}`}
        description={overview?.isSubjectOnly ? "You manage assignments and marks for the subjects assigned to you." : overview?.isClassHead ? "You are a class head teacher. Attendance, exams and promotion are yours to run." : "Your classes and subjects are below."}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {loading || assignments.loading ? (
          [0, 1, 2].map((i) => <Skeleton key={i} className="h-[118px] !rounded-2xl" />)
        ) : (
          <>
            <StatCard label="Open assignments" value={count("ACTIVE")} tone="success" icon={<ClipboardList className="size-5" />} />
            <StatCard label="Scheduled" value={count("SCHEDULED")} tone="gold" icon={<CalendarCheck className="size-5" />} />
            <StatCard label="Closed" value={count("CLOSED")} icon={<Award className="size-5" />} />
          </>
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="card">
          <h2 className="border-b border-border px-5 py-4 font-display text-xl font-semibold">{overview?.isClassHead ? "Classes you head" : "Your subjects"}</h2>
          {loading ? (
            <div className="space-y-3 p-5"><Skeleton className="h-12" /><Skeleton className="h-12" /></div>
          ) : overview?.isClassHead ? (
            <ul className="divide-y divide-border">
              {overview.headOfClasses.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-3 px-5 py-4">
                  <div>
                    <p className="font-semibold">{c.name}</p>
                    <p className="text-sm text-muted">{c.totalStudents} students{c.nextClass ? `, promotes to ${c.nextClass.name}` : ""}</p>
                  </div>
                  {!c.nextClass && <Badge tone="gold">No next class set</Badge>}
                </li>
              ))}
            </ul>
          ) : null}
          {!loading && (overview?.subjects.length ?? 0) > 0 && (
            <ul className={overview?.isClassHead ? "divide-y divide-border border-t border-border" : "divide-y divide-border"}>
              {overview?.isClassHead && <li className="bg-surface-2 px-5 py-2 text-xs font-semibold text-muted">Subjects you teach</li>}
              {overview?.subjects.map((s) => (
                <li key={s.id} className="flex items-center justify-between px-5 py-3.5">
                  <span className="font-medium">{s.name}</span>
                  <span className="text-sm text-muted">{s.class?.name ?? "No class"}</span>
                </li>
              ))}
            </ul>
          )}
          {!loading && !overview?.isClassHead && (overview?.subjects.length ?? 0) === 0 && <EmptyState title="Nothing assigned yet" description="An administrator needs to assign you a class or subject." />}
        </section>

        <section className="card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="font-display text-xl font-semibold">Recent assignments</h2>
            <Link href="/teacher/assignments" className="text-sm font-medium text-gold hover:underline">View all</Link>
          </div>
          {!assignments.loading && list.length === 0 ? (
            <EmptyState title="No assignments yet" description="Create one and your students are notified straight away." />
          ) : (
            <ul className="divide-y divide-border">
              {list.slice(0, 5).map((a) => (
                <li key={a.id}>
                  <Link href={`/teacher/assignments/${a.id}`} className="block px-5 py-3.5 transition-colors hover:bg-surface-2">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate font-medium">{a.title}</p>
                      <span className="shrink-0 text-xs text-muted">{a.state === "SCHEDULED" ? "Scheduled" : dueText(a.deadline)}</span>
                    </div>
                    <p className="mt-0.5 text-sm text-muted">{a.subject.name}, {a.class.name}</p>
                    <div className="mt-2.5 flex items-center gap-3">
                      <Bar value={a.totalStudents ? (a._count.submissions / a.totalStudents) * 100 : 0} tone="success" />
                      <span className="shrink-0 text-xs tabular-nums text-muted">{a._count.submissions}/{a.totalStudents}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
