"use client";

import { ClipboardList } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Badge, EmptyState, ErrorState, ListSkeleton } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs } from "@/components/ui/tabs";
import { useFetch } from "@/hooks/use-fetch";
import { stateMeta } from "@/lib/assignment";
import { dueText, fmtDateTime } from "@/lib/format";
import type { AssignmentState, StudentAssignment } from "@/lib/types";

type Filter = "ALL" | AssignmentState;

export default function StudentAssignmentsPage() {
  const { data, loading, error, reload } = useFetch<StudentAssignment[]>("/student/assignments");
  const [filter, setFilter] = useState<Filter>("PENDING");
  const all = data ?? [];
  const count = (s: Filter) => (s === "ALL" ? all.length : all.filter((a) => a.state === s).length);
  const rows = filter === "ALL" ? all : all.filter((a) => a.state === filter);

  return (
    <>
      <PageHeader title="Assignments" description="Upload your work as a PDF before the deadline." />
      <Tabs id="s-assign" className="mb-5" value={filter} onChange={setFilter} items={[{ value: "PENDING", label: "To hand in", count: count("PENDING") }, { value: "SUBMITTED", label: "Handed in", count: count("SUBMITTED") }, { value: "GRADED", label: "Graded", count: count("GRADED") }, { value: "OVERDUE", label: "Missed", count: count("OVERDUE") }, { value: "ALL", label: "All", count: count("ALL") }]} />
      {loading ? <ListSkeleton /> : error ? <ErrorState message={error} onRetry={reload} /> : rows.length === 0 ? (
        <div className="card"><EmptyState icon={<ClipboardList className="size-5" />} title="Nothing here" description={filter === "PENDING" ? "You have nothing to hand in right now." : "No assignments match this tab."} /></div>
      ) : (
        <ul className="space-y-3">
          {rows.map((a) => (
            <li key={a.id}>
              <Link href={`/student/assignments/${a.id}`} className="card card-pad flex flex-wrap items-center justify-between gap-4 transition-colors hover:border-primary/40">
                <div className="min-w-0">
                  <p className="text-sm text-muted">{a.subject.name}</p>
                  <h2 className="font-display text-xl font-semibold leading-snug">{a.title}</h2>
                  <p className="mt-1 text-sm text-muted">Deadline {fmtDateTime(a.deadline)}{a.state === "PENDING" ? ` (${dueText(a.deadline).toLowerCase()})` : ""}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <Badge tone={stateMeta[a.state].tone}>{stateMeta[a.state].label}</Badge>
                  {a.mySubmission?.marks != null && <span className="text-sm font-semibold tabular-nums">{a.mySubmission.marks} / {a.totalMarks}</span>}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
