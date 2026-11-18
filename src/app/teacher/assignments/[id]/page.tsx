"use client";

import { ArrowLeft, ExternalLink, FileText } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge, ErrorState, ListSkeleton } from "@/components/ui/feedback";
import { Field, Input, Textarea } from "@/components/ui/form";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { useToast } from "@/components/ui/toast";
import { useFetch } from "@/hooks/use-fetch";
import { api, errorMessage } from "@/lib/api";
import { fmtDateTime } from "@/lib/format";
import type { SubmissionSheet } from "@/lib/types";

type Row = SubmissionSheet["students"][number];

export default function SubmissionsPage() {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();
  const { data, loading, error, reload } = useFetch<SubmissionSheet>(`/teacher/assignments/${id}/submissions`);
  const [grading, setGrading] = useState<Row | null>(null);
  const [marks, setMarks] = useState("");
  const [feedback, setFeedback] = useState("");
  const [busy, setBusy] = useState(false);

  const open = (row: Row) => {
    setGrading(row);
    setMarks(row.submission?.marks?.toString() ?? "");
    setFeedback(row.submission?.feedback ?? "");
  };

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!grading?.submission || !data) return;
    const value = Number(marks);
    if (Number.isNaN(value) || value < 0 || value > data.assignment.totalMarks) return toast.error(`Marks must be between 0 and ${data.assignment.totalMarks}.`);
    setBusy(true);
    try {
      await api.patch(`/teacher/assignments/submissions/${grading.submission.id}/grade`, { marks: value, feedback: feedback.trim() || undefined });
      toast.success(`${grading.name} was graded. They have been notified.`);
      setGrading(null);
      reload();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Link href="/teacher/assignments" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg"><ArrowLeft className="size-4" />All assignments</Link>
      {loading ? (
        <ListSkeleton />
      ) : error || !data ? (
        <ErrorState message={error ?? "Assignment not found."} onRetry={reload} />
      ) : (
        <>
          <PageHeader title={data.assignment.title} description={`${data.assignment.subject}. Due ${fmtDateTime(data.assignment.deadline)}. Out of ${data.assignment.totalMarks} marks.`} />
          <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="In the class" value={data.summary.totalStudents} />
            <StatCard label="Submitted" value={data.summary.submitted} tone="success" />
            <StatCard label="Graded" value={data.summary.graded} tone="gold" />
            <StatCard label="Missing" value={data.summary.notSubmitted} tone={data.summary.notSubmitted ? "danger" : "success"} />
          </div>

          <div className="card overflow-x-auto">
            <table className="tbl">
              <thead><tr><th>Roll</th><th>Student</th><th>Status</th><th>Submitted</th><th>File</th><th>Marks</th><th className="text-right">Action</th></tr></thead>
              <tbody>
                {data.students.map((s) => {
                  const sub = s.submission;
                  return (
                    <tr key={s.studentId}>
                      <td className="tabular-nums">{s.classRoll ?? <span className="text-muted">None</span>}</td>
                      <td><p className="font-medium">{s.name}</p><p className="text-xs text-muted">{s.email}</p></td>
                      <td>{!sub ? <Badge tone="danger">Not submitted</Badge> : sub.status === "GRADED" ? <Badge tone="success">Graded</Badge> : <Badge tone="gold">Needs checking</Badge>}</td>
                      <td className="whitespace-nowrap text-muted">{sub ? fmtDateTime(sub.submittedAt) : "Not yet"}</td>
                      <td>{sub ? <a href={sub.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-gold hover:underline"><FileText className="size-4" />{sub.fileName ?? "Open PDF"}<ExternalLink className="size-3.5" /></a> : <span className="text-muted">None</span>}</td>
                      <td className="tabular-nums">{sub?.marks != null ? `${sub.marks} / ${data.assignment.totalMarks}` : <span className="text-muted">Not graded</span>}</td>
                      <td className="text-right">{sub && <Button size="sm" variant={sub.status === "GRADED" ? "ghost" : "primary"} onClick={() => open(s)}>{sub.status === "GRADED" ? "Edit grade" : "Grade"}</Button>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Modal open={!!grading} onClose={() => setGrading(null)} title={`Grade ${grading?.name ?? ""}`} description={grading?.submission?.fileName ?? undefined} footer={<><Button variant="secondary" onClick={() => setGrading(null)}>Cancel</Button><Button type="submit" form="grade-form" loading={busy}>Save grade</Button></>}>
            <form id="grade-form" onSubmit={save} className="space-y-4">
              {grading?.submission && <a href={grading.submission.fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm w-fit" ><FileText className="size-4" />Open the PDF</a>}
              <Field label={`Marks (out of ${data.assignment.totalMarks})`}><Input type="number" min={0} max={data.assignment.totalMarks} step="any" required value={marks} onChange={(e) => setMarks(e.target.value)} autoFocus /></Field>
              <Field label="Feedback" hint="Optional. The student sees this."><Textarea rows={4} value={feedback} onChange={(e) => setFeedback(e.target.value)} /></Field>
            </form>
          </Modal>
        </>
      )}
    </>
  );
}
