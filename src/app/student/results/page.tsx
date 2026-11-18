"use client";

import { Award } from "lucide-react";
import { useState } from "react";
import { Badge, EmptyState, ErrorState, ListSkeleton } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page-header";
import { Bar, CountUp, ProgressRing } from "@/components/ui/progress";
import { Tabs } from "@/components/ui/tabs";
import { useFetch } from "@/hooks/use-fetch";
import { fmtDate } from "@/lib/format";
import type { StudentResults } from "@/lib/types";

const statusMeta = { PASSED: { label: "Passed", tone: "success" }, FAILED: { label: "Not passed", tone: "danger" }, INCOMPLETE: { label: "Some marks pending", tone: "gold" } } as const;
const itemMeta = { GRADED: "Graded", SUBMITTED: "Handed in", PENDING: "To hand in", NOT_SUBMITTED: "Not handed in" } as const;

export default function ResultsPage() {
  const { data, loading, error, reload } = useFetch<StudentResults>("/student/results");
  const [pick, setPick] = useState("");

  if (loading) return <ListSkeleton />;
  if (error || !data) return <ErrorState message={error ?? "Could not load results."} onRetry={reload} />;

  const exam = data.exams.find((e) => e.exam.id === pick) ?? data.exams[0];

  return (
    <>
      <PageHeader title="Results" description="Exam results appear here after your class teacher publishes them." />

      {data.exams.length === 0 ? (
        <div className="card"><EmptyState icon={<Award className="size-5" />} title="No published results yet" description="You will get a notification when a result is published." /></div>
      ) : (
        <>
          {data.exams.length > 1 && <Tabs id="exam-pick" className="mb-5" value={exam.exam.id} onChange={setPick} items={data.exams.map((e) => ({ value: e.exam.id, label: e.exam.name }))} />}
          {exam && (
            <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
              <section className="card card-pad flex flex-col items-center text-center">
                <ProgressRing key={exam.exam.id} value={exam.percentage} size={160} stroke={9} tone={exam.status === "FAILED" ? "danger" : "gold"}>
                  <span className="block font-display text-5xl font-semibold text-gold">{exam.grade}</span>
                  <span className="text-sm tabular-nums text-muted"><CountUp value={exam.percentage} suffix="%" decimals={1} /></span>
                </ProgressRing>
                <h2 className="mt-5 font-display text-2xl font-semibold">{exam.exam.name}</h2>
                <p className="text-sm text-muted">{exam.exam.class}{exam.exam.examDate ? `, ${fmtDate(exam.exam.examDate)}` : ""}</p>
                <Badge className="mt-3" tone={statusMeta[exam.status].tone}>{statusMeta[exam.status].label}</Badge>
                <p className="mt-4 text-sm text-muted">{exam.totalObtained} of {exam.totalMarks} marks. Pass mark is {exam.exam.passMarks} in each subject.</p>
              </section>

              <section className="card overflow-x-auto">
                <table className="tbl">
                  <thead><tr><th>Subject</th><th>Marks</th><th className="min-w-36">Score</th><th>Grade</th><th>Remarks</th></tr></thead>
                  <tbody>
                    {exam.subjects.map((s) => (
                      <tr key={s.subjectId}>
                        <td className="font-medium">{s.subject}</td>
                        <td className="whitespace-nowrap tabular-nums">{s.marks} / {s.totalMarks}</td>
                        <td><Bar value={s.percentage} tone={s.passed ? "success" : "danger"} /></td>
                        <td><Badge tone={s.passed ? "gold" : "danger"}>{s.grade}</Badge></td>
                        <td className="text-sm text-muted">{s.remarks ?? ""}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            </div>
          )}
        </>
      )}

      {data.assignmentsBySubject.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 font-display text-2xl font-semibold">Assignment marks</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {data.assignmentsBySubject.map((g) => (
              <article key={g.subjectId} className="card card-pad">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-semibold">{g.subject}</h3>
                  <span className="text-sm tabular-nums text-muted">{g.outOf ? `${g.obtained} of ${g.outOf}` : "Nothing graded yet"}</span>
                </div>
                {g.outOf > 0 && <Bar className="mt-3" value={g.percentage} tone="gold" />}
                <ul className="divide-y divide-border pt-2 text-sm">
                  {g.items.map((i) => (
                    <li key={i.assignmentId} className="flex items-center justify-between gap-3 py-2">
                      <span className="min-w-0 truncate">{i.title}</span>
                      <span className="shrink-0 tabular-nums text-muted">{i.marks != null ? `${i.marks} / ${i.totalMarks}` : itemMeta[i.status]}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
