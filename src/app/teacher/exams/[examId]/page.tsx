"use client";

import { ArrowLeft, ArrowUpFromLine, Save, Send } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useTeacher } from "@/components/layout/teacher-provider";
import { Button } from "@/components/ui/button";
import { Badge, ErrorState, ListSkeleton } from "@/components/ui/feedback";
import { ConfirmDialog } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Tabs } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { useFetch } from "@/hooks/use-fetch";
import { api, errorMessage } from "@/lib/api";
import type { MarksSheet, PromotionPreview } from "@/lib/types";

type Tab = "marks" | "promotion";
const key = (studentId: string, subjectId: string) => `${studentId}:${subjectId}`;

function Promotion({ examId, onDone }: { examId: string; onDone: () => void }) {
  const toast = useToast();
  const { data, loading, error, reload } = useFetch<PromotionPreview>(`/teacher/exams/${examId}/promotion-preview`);
  const [skip, setSkip] = useState<string[]>([]);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);

  if (loading) return <ListSkeleton />;
  if (error || !data) return <ErrorState message={error ?? "Could not load the preview."} onRetry={reload} />;

  const passed = data.students.filter((s) => s.status === "PASSED");
  const moving = passed.filter((s) => !skip.includes(s.studentId)).length;

  async function promote() {
    setBusy(true);
    try {
      const res = await api.post<{ promoted: number; toClass: string }>(`/teacher/exams/${examId}/promote`, { excludeStudentIds: skip });
      toast.success(`${res.promoted} students moved to ${res.toClass}. Students and parents were notified.`);
      setConfirm(false);
      reload();
      onDone();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  const tone = { PASSED: "success", FAILED: "danger", INCOMPLETE: "gold" } as const;
  const label = { PASSED: "Passed", FAILED: "Failed", INCOMPLETE: "Marks missing" };

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Passed" value={data.counts.passed} tone="success" />
        <StatCard label="Failed" value={data.counts.failed} tone="danger" />
        <StatCard label="Marks missing" value={data.counts.incomplete} tone="gold" />
      </div>

      {!data.exam.isFinal && <p className="rounded-xl bg-gold-soft px-4 py-3 text-sm text-gold">Only a final exam can promote students. This exam is not marked as final.</p>}
      {data.exam.isFinal && !data.nextClass && <p className="rounded-xl bg-gold-soft px-4 py-3 text-sm text-gold">No next class is set for {data.fromClass}. Ask an administrator to set the promotion path first.</p>}

      <div className="card overflow-x-auto">
        <table className="tbl">
          <thead><tr><th className="w-10" /><th>Roll</th><th>Student</th><th>Total</th><th>Percentage</th><th>Result</th></tr></thead>
          <tbody>
            {data.students.map((s) => (
              <tr key={s.studentId}>
                <td>{s.status === "PASSED" && data.canPromote && <input type="checkbox" aria-label={`Promote ${s.name}`} className="size-4 accent-[var(--primary)]" checked={!skip.includes(s.studentId)} onChange={() => setSkip((l) => (l.includes(s.studentId) ? l.filter((x) => x !== s.studentId) : [...l, s.studentId]))} />}</td>
                <td className="tabular-nums">{s.classRoll ?? <span className="text-muted">None</span>}</td>
                <td className="font-medium">{s.name}</td>
                <td className="tabular-nums">{s.total}</td>
                <td className="tabular-nums">{s.percentage}%</td>
                <td>
                  <Badge tone={tone[s.status]}>{label[s.status]}</Badge>
                  {s.failedSubjects.length > 0 && <p className="mt-1 text-xs text-muted">Below pass: {s.failedSubjects.join(", ")}</p>}
                  {s.missingSubjects.length > 0 && <p className="mt-1 text-xs text-muted">Missing: {s.missingSubjects.join(", ")}</p>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">{data.canPromote && data.nextClass ? `${moving} of ${passed.length} passed students will move to ${data.nextClass.name}. Roll numbers are cleared.` : "Promotion is not available yet."}</p>
        <Button icon={<ArrowUpFromLine className="size-4" />} disabled={!data.canPromote || moving === 0} onClick={() => setConfirm(true)}>Promote {moving} students</Button>
      </div>

      <ConfirmDialog open={confirm} onClose={() => setConfirm(false)} onConfirm={promote} loading={busy} tone="primary" title={`Promote ${moving} students?`} message={`They move from ${data.fromClass} to ${data.nextClass?.name ?? "the next class"} and their marks for this exam become locked. Students and parents are notified.`} confirmLabel="Promote students" />
    </div>
  );
}

export default function ExamSheetPage() {
  const { examId } = useParams<{ examId: string }>();
  const toast = useToast();
  const { overview } = useTeacher();
  const { data, loading, error, reload } = useFetch<MarksSheet>(`/teacher/exams/${examId}/sheet`);
  const [values, setValues] = useState<Record<string, string>>({});
  const [tab, setTab] = useState<Tab>("marks");
  const [saving, setSaving] = useState<string | null>(null);
  const [publish, setPublish] = useState(false);
  const [busy, setBusy] = useState(false);

  const original = useMemo(() => {
    const map: Record<string, string> = {};
    data?.students.forEach((s) => s.subjects.forEach((x) => (map[key(s.studentId, x.subjectId)] = x.marks === null ? "" : String(x.marks))));
    return map;
  }, [data]);

  useEffect(() => setValues(original), [original]);

  if (loading) return <ListSkeleton />;
  if (error || !data) return <ErrorState message={error ?? "Exam not found."} onRetry={reload} />;

  const isHead = !!overview?.headOfClasses.some((c) => c.name === data.exam.class);
  const dirty = (subjectId: string) => data.students.some((s) => (values[key(s.studentId, subjectId)] ?? "") !== original[key(s.studentId, subjectId)]);

  async function saveSubject(subjectId: string, name: string) {
    if (!data) return;
    const results: { studentId: string; marks: number }[] = [];
    for (const s of data.students) {
      const raw = (values[key(s.studentId, subjectId)] ?? "").trim();
      if (raw === "") continue;
      const n = Number(raw);
      if (Number.isNaN(n) || n < 0 || n > data.exam.totalMarks) return toast.error(`${s.name}: marks must be between 0 and ${data.exam.totalMarks}.`);
      results.push({ studentId: s.studentId, marks: n });
    }
    if (results.length === 0) return toast.error("Enter at least one mark.");
    setSaving(subjectId);
    try {
      await api.put(`/teacher/exams/${examId}/results`, { subjectId, results });
      toast.success(`${name} marks saved for ${results.length} students.`);
      reload();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(null);
    }
  }

  async function publishResults() {
    setBusy(true);
    try {
      await api.patch(`/teacher/exams/${examId}/publish`);
      toast.success("Results published. Students and parents were notified.");
      setPublish(false);
      reload();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Link href="/teacher/exams" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg"><ArrowLeft className="size-4" />All exams</Link>
      <PageHeader
        title={data.exam.name}
        description={`${data.exam.class}. Out of ${data.exam.totalMarks} per subject, pass at ${data.exam.passMarks}.`}
        actions={
          <>
            {data.exam.isFinal && <Badge tone="gold">Final exam</Badge>}
            <Badge tone={data.exam.isPublished ? "success" : "neutral"}>{data.exam.isPublished ? "Published" : "Not published"}</Badge>
            {isHead && !data.exam.isPublished && <Button icon={<Send className="size-4" />} onClick={() => setPublish(true)}>Publish results</Button>}
          </>
        }
      />

      {isHead && <Tabs id="exam-tabs" className="mb-5" value={tab} onChange={setTab} items={[{ value: "marks", label: "Marks" }, { value: "promotion", label: "Promotion" }]} />}

      {tab === "promotion" && isHead ? (
        <Promotion examId={examId} onDone={reload} />
      ) : (
        <>
          <div className="card overflow-x-auto">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Roll</th>
                  <th>Student</th>
                  {data.subjects.map((s) => <th key={s.id}>{s.name}</th>)}
                  {isHead && <th>Total</th>}
                </tr>
              </thead>
              <tbody>
                {data.students.map((s) => (
                  <tr key={s.studentId}>
                    <td className="tabular-nums">{s.classRoll ?? <span className="text-muted">None</span>}</td>
                    <td className="whitespace-nowrap font-medium">{s.name}</td>
                    {data.subjects.map((sub) => (
                      <td key={sub.id}>
                        <input
                          type="number"
                          min={0}
                          max={data.exam.totalMarks}
                          step="any"
                          inputMode="decimal"
                          aria-label={`${sub.name} marks for ${s.name}`}
                          value={values[key(s.studentId, sub.id)] ?? ""}
                          onChange={(e) => setValues((v) => ({ ...v, [key(s.studentId, sub.id)]: e.target.value }))}
                          className="field-input !h-9 !w-20 text-center tabular-nums"
                        />
                      </td>
                    ))}
                    {isHead && <td className="tabular-nums">{s.total ?? 0} {s.complete === false && <span className="text-xs text-gold">Incomplete</span>}</td>}
                  </tr>
                ))}
                <tr className="bg-surface-2">
                  <td colSpan={2} className="text-sm text-muted">Save each subject on its own</td>
                  {data.subjects.map((sub) => (
                    <td key={sub.id}>
                      <Button size="sm" variant={dirty(sub.id) ? "primary" : "secondary"} icon={<Save className="size-4" />} loading={saving === sub.id} disabled={!dirty(sub.id)} onClick={() => saveSubject(sub.id, sub.name)}>Save</Button>
                    </td>
                  ))}
                  {isHead && <td />}
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-muted">Marks of a student cannot be removed once saved, only changed. Marks are locked after students are promoted.</p>
        </>
      )}

      <ConfirmDialog open={publish} onClose={() => setPublish(false)} onConfirm={publishResults} loading={busy} tone="primary" title="Publish these results?" message="Students and their parents can see the marks straight away and are notified. Check that every subject has marks entered." confirmLabel="Publish results" />
    </>
  );
}
