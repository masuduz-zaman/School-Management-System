"use client";

import { Award, Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTeacher } from "@/components/layout/teacher-provider";
import { Button } from "@/components/ui/button";
import { Badge, CardGridSkeleton, EmptyState, ErrorState } from "@/components/ui/feedback";
import { Field, Input, Select, Switch } from "@/components/ui/form";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { useToast } from "@/components/ui/toast";
import { useFetch } from "@/hooks/use-fetch";
import { api, errorMessage } from "@/lib/api";
import { fmtDate } from "@/lib/format";
import type { Exam } from "@/lib/types";

const blank = { classId: "", name: "", examDate: "", totalMarks: "100", passMarks: "33", isFinal: false };

export default function ExamsPage() {
  const toast = useToast();
  const { overview } = useTeacher();
  const { data, loading, error, reload } = useFetch<Exam[]>("/teacher/exams");
  const [open, setOpen] = useState(false);
  const [f, setF] = useState(blank);
  const [busy, setBusy] = useState(false);
  const heads = overview?.headOfClasses ?? [];

  useEffect(() => {
    if (open) setF({ ...blank, classId: heads[0]?.id ?? "" });
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post("/teacher/exams", {
        classId: f.classId,
        name: f.name.trim(),
        examDate: f.examDate ? new Date(f.examDate).toISOString() : undefined,
        totalMarks: Number(f.totalMarks),
        passMarks: Number(f.passMarks),
        isFinal: f.isFinal,
      });
      toast.success(`${f.name.trim()} was created.`);
      setOpen(false);
      reload();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  const exams = data ?? [];

  return (
    <>
      <PageHeader
        title="Exams and results"
        description={overview?.isClassHead ? "Create exams, enter marks, publish results and promote students." : "Enter marks for the subjects you teach."}
        actions={overview?.isClassHead && <Button icon={<Plus className="size-4" />} onClick={() => setOpen(true)}>New exam</Button>}
      />

      {loading ? (
        <CardGridSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : exams.length === 0 ? (
        <div className="card"><EmptyState icon={<Award className="size-5" />} title="No exams yet" description={overview?.isClassHead ? "Create an exam, then you and the subject teachers can enter marks." : "Your class head teacher creates exams. They will show up here."} /></div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {exams.map((x) => (
            <Link key={x.id} href={`/teacher/exams/${x.id}`} className="card card-pad block transition-colors hover:border-primary/40">
              <div className="flex flex-wrap gap-1.5">
                {x.isFinal && <Badge tone="gold">Final exam</Badge>}
                <Badge tone={x.isPublished ? "success" : "neutral"}>{x.isPublished ? "Published" : "Not published"}</Badge>
              </div>
              <h2 className="mt-3 font-display text-2xl font-semibold leading-tight">{x.name}</h2>
              <p className="mt-1 text-sm text-muted">{x.class.name}{x.examDate ? `, ${fmtDate(x.examDate)}` : ""}</p>
              <p className="divider mt-4 pt-3 text-sm text-muted">Out of {x.totalMarks}, pass at {x.passMarks}. {x._count.results} marks entered.</p>
            </Link>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="New exam" footer={<><Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit" form="exam-form" loading={busy}>Create exam</Button></>}>
        <form id="exam-form" onSubmit={submit} className="space-y-4">
          <Field label="Class">
            <Select required value={f.classId} onChange={(e) => setF({ ...f, classId: e.target.value })}>
              {heads.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </Field>
          <Field label="Exam name" hint="For example Mid-term or Final 2026."><Input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
          <Field label="Exam date" hint="Optional"><Input type="date" value={f.examDate} onChange={(e) => setF({ ...f, examDate: e.target.value })} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Total marks per subject"><Input type="number" min={1} required value={f.totalMarks} onChange={(e) => setF({ ...f, totalMarks: e.target.value })} /></Field>
            <Field label="Pass marks per subject"><Input type="number" min={0} required value={f.passMarks} onChange={(e) => setF({ ...f, passMarks: e.target.value })} /></Field>
          </div>
          <Switch checked={f.isFinal} onChange={(v) => setF({ ...f, isFinal: v })} label="This is the final exam" hint="Only a final exam can be used to promote students." />
        </form>
      </Modal>
    </>
  );
}
