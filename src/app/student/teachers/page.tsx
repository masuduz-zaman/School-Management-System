"use client";

import { Mail, Phone, Users } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge, CardGridSkeleton, EmptyState, ErrorState } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page-header";
import { useFetch } from "@/hooks/use-fetch";
import type { MyTeachers, TeacherCard } from "@/lib/types";

function Card({ teacher, role, subject }: { teacher: TeacherCard | null; role?: string; subject?: string }) {
  return (
    <article className="card card-pad">
      {subject && <Badge tone="gold">{subject}</Badge>}
      {role && <Badge tone="primary">{role}</Badge>}
      {teacher ? (
        <>
          <div className="mt-4 flex items-center gap-3">
            <Avatar name={teacher.name} src={teacher.profilePhoto} size={48} />
            <h2 className="font-display text-xl font-semibold leading-tight">{teacher.name}</h2>
          </div>
          <div className="mt-4 space-y-2 text-sm">
            {teacher.phone && <a href={`tel:${teacher.phone}`} className="flex items-center gap-2.5 text-muted hover:text-fg"><Phone className="size-4" />{teacher.phone}</a>}
            <a href={`mailto:${teacher.email}`} className="flex items-center gap-2.5 break-all text-muted hover:text-fg"><Mail className="size-4 shrink-0" />{teacher.email}</a>
          </div>
        </>
      ) : <p className="mt-4 text-sm text-muted">No teacher assigned yet.</p>}
    </article>
  );
}

export default function MyTeachersPage() {
  const { data, loading, error, reload } = useFetch<MyTeachers>("/student/teachers");
  return (
    <>
      <PageHeader title="My teachers" description={data?.class ? `Who teaches ${data.class.name} and how to reach them.` : "Your class head teacher and subject teachers."} />
      {loading ? <CardGridSkeleton count={3} /> : error ? <ErrorState message={error} onRetry={reload} /> : !data?.class ? (
        <div className="card"><EmptyState icon={<Users className="size-5" />} title="You are not in a class yet" description="Once an administrator places you in a class, your teachers show up here." /></div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <Card teacher={data.classTeacher} role="Class head teacher" />
          {data.subjectTeachers.map((s) => <Card key={s.subjectId} teacher={s.teacher} subject={s.subject} />)}
        </div>
      )}
    </>
  );
}
