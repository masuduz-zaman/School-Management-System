"use client";

import { Building2, GraduationCap, Inbox, Users } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import { Badge, EmptyState, Skeleton } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page-header";
import { Bar } from "@/components/ui/progress";
import { StatCard } from "@/components/ui/stat-card";
import { useFetch } from "@/hooks/use-fetch";
import { fmtDate } from "@/lib/format";
import type { AdminStudent, AdminTeacher, ClassSummary, RegistrationRequest } from "@/lib/types";

export default function AdminHome() {
  const { user } = useAuth();
  const students = useFetch<AdminStudent[]>("/admin/all-students");
  const teachers = useFetch<AdminTeacher[]>("/admin/all-teachers");
  const classes = useFetch<ClassSummary[]>("/admin/all-class");
  const requests = useFetch<RegistrationRequest[]>("/admin/all-requests");

  const loading = students.loading || teachers.loading || classes.loading || requests.loading;
  const pending = (requests.data ?? []).filter((r) => r.status === "PENDING");
  const classList = classes.data ?? [];
  const biggest = Math.max(1, ...classList.map((c) => c.totalStudents));
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <>
      <PageHeader title={`${greeting}, ${user?.name.split(" ")[0] ?? ""}`} description="Here is where the school stands today." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading ? (
          [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-[118px] !rounded-2xl" />)
        ) : (
          <>
            <StatCard label="Students" value={students.data?.length ?? 0} icon={<GraduationCap className="size-5" />} />
            <StatCard label="Teachers" value={teachers.data?.length ?? 0} icon={<Users className="size-5" />} />
            <StatCard label="Classes" value={classList.length} icon={<Building2 className="size-5" />} />
            <StatCard label="Requests waiting" value={pending.length} tone={pending.length ? "gold" : "success"} icon={<Inbox className="size-5" />} hint={pending.length ? "Needs your review" : "All caught up"} />
          </>
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="font-display text-xl font-semibold">Waiting for approval</h2>
            <Link href="/admin/requests" className="text-sm font-medium text-gold hover:underline">View all</Link>
          </div>
          {!requests.loading && pending.length === 0 ? (
            <EmptyState title="No requests waiting" description="New student and teacher requests will appear here." />
          ) : (
            <ul className="divide-y divide-border">
              {pending.slice(0, 5).map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{r.name}</p>
                    <p className="truncate text-sm text-muted">{r.email}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <Badge tone={r.requestType === "TEACHER" ? "gold" : "neutral"}>{r.requestType === "TEACHER" ? "Teacher" : "Student"}</Badge>
                    <span className="hidden text-xs text-muted sm:block">{fmtDate(r.createdAt)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="font-display text-xl font-semibold">Students per class</h2>
            <Link href="/admin/classes" className="text-sm font-medium text-gold hover:underline">Manage</Link>
          </div>
          {!classes.loading && classList.length === 0 ? (
            <EmptyState title="No classes yet" description="Create your first class to start enrolling students." />
          ) : (
            <ul className="space-y-4 p-5">
              {classList.map((c) => (
                <li key={c.id}>
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span className="font-medium">{c.name}</span>
                    <span className="tabular-nums text-muted">{c.totalStudents}</span>
                  </div>
                  <Bar value={(c.totalStudents / biggest) * 100} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
