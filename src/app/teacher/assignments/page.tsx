"use client";

import { CalendarClock, ClipboardList, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useTeacher } from "@/components/layout/teacher-provider";
import { Button } from "@/components/ui/button";
import { Badge, EmptyState, ErrorState, ListSkeleton } from "@/components/ui/feedback";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { ConfirmDialog, Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { Bar } from "@/components/ui/progress";
import { Segmented, Tabs } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { useFetch } from "@/hooks/use-fetch";
import { api, errorMessage } from "@/lib/api";
import { dueText, fmtDateTime, localInputToIso, toLocalInput } from "@/lib/format";
import type { SubjectRef, TeacherAssignment } from "@/lib/types";

type Filter = "ALL" | TeacherAssignment["state"];
const blank = { subjectId: "", title: "", description: "", totalMarks: "100", mode: "now" as "now" | "later", scheduledAt: "", deadline: "" };

function AssignmentForm({ open, onClose, onDone, subjects, editing }: { open: boolean; onClose: () => void; onDone: () => void; subjects: SubjectRef[]; editing: TeacherAssignment | null }) {
  const toast = useToast();
  const [f, setF] = useState(blank);
  const [busy, setBusy] = useState(false);
  const published = editing?.isPublished ?? false;

  useEffect(() => {
    if (!open) return;
    setF(
      editing
        ? { subjectId: editing.subjectId, title: editing.title, description: editing.description ?? "", totalMarks: String(editing.totalMarks), mode: "later", scheduledAt: toLocalInput(editing.scheduledAt), deadline: toLocalInput(editing.deadline) }
        : { ...blank, subjectId: subjects[0]?.id ?? "" },
    );
  }, [open, editing, subjects]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!f.deadline) return toast.error("Choose a deadline.");
    setBusy(true);
    try {
      if (editing) {
        await api.patch(`/teacher/assignments/${editing.id}`, {
          title: f.title.trim(),
          description: f.description.trim() || undefined,
          totalMarks: Number(f.totalMarks),
          deadline: localInputToIso(f.deadline),
          ...(!published && f.scheduledAt ? { scheduledAt: localInputToIso(f.scheduledAt) } : {}),
        });
        toast.success("Assignment updated.");
      } else {
        await api.post("/teacher/assignments", {
          subjectId: f.subjectId,
          title: f.title.trim(),
          description: f.description.trim() || undefined,
          totalMarks: Number(f.totalMarks),
          deadline: localInputToIso(f.deadline),
          ...(f.mode === "later" && f.scheduledAt ? { scheduledAt: localInputToIso(f.scheduledAt) } : {}),
        });
        toast.success(f.mode === "later" ? "Assignment scheduled." : "Assignment published. Students were notified.");
      }
      onDone();
      onClose();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} width="max-w-xl" title={editing ? "Edit assignment" : "New assignment"} footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" form="assignment-form" loading={busy}>{editing ? "Save changes" : f.mode === "later" ? "Schedule" : "Publish"}</Button></>}>
      <form id="assignment-form" onSubmit={submit} className="space-y-4">
        {!editing && (
          <Field label="Subject">
            <Select required value={f.subjectId} onChange={(e) => setF({ ...f, subjectId: e.target.value })}>
              {subjects.length === 0 && <option value="">No subjects assigned to you</option>}
              {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}{s.class ? `, ${s.class.name}` : ""}</option>)}
            </Select>
          </Field>
        )}
        <Field label="Title"><Input required value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></Field>
        <Field label="Instructions" hint="Optional"><Textarea rows={4} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Total marks"><Input type="number" min={1} max={1000} required value={f.totalMarks} onChange={(e) => setF({ ...f, totalMarks: e.target.value })} /></Field>
          <Field label="Deadline"><Input type="datetime-local" required value={f.deadline} onChange={(e) => setF({ ...f, deadline: e.target.value })} /></Field>
        </div>
        {!editing && (
          <div className="space-y-3">
            <span className="block text-sm font-medium">When should students see it?</span>
            <Segmented id="publish-mode" value={f.mode} onChange={(mode) => setF({ ...f, mode })} items={[{ value: "now", label: "Right away" }, { value: "later", label: "At a set time" }]} />
            {f.mode === "later" && <Field label="Visible from"><Input type="datetime-local" required value={f.scheduledAt} onChange={(e) => setF({ ...f, scheduledAt: e.target.value })} /></Field>}
          </div>
        )}
        {editing && !published && (
          <Field label="Visible from" hint="Students see it from this time."><Input type="datetime-local" value={f.scheduledAt} onChange={(e) => setF({ ...f, scheduledAt: e.target.value })} /></Field>
        )}
        {editing && published && <p className="rounded-lg bg-surface-2 px-3.5 py-2.5 text-sm text-muted">This assignment is already visible to students, so its start time is fixed. Changing the deadline notifies the class.</p>}
      </form>
    </Modal>
  );
}

export default function TeacherAssignmentsPage() {
  const toast = useToast();
  const { subjects } = useTeacher();
  const { data, loading, error, reload } = useFetch<TeacherAssignment[]>("/teacher/assignments");
  const [filter, setFilter] = useState<Filter>("ALL");
  const [subjectId, setSubjectId] = useState("");
  const [form, setForm] = useState<{ open: boolean; editing: TeacherAssignment | null }>({ open: false, editing: null });
  const [removing, setRemoving] = useState<TeacherAssignment | null>(null);
  const [busy, setBusy] = useState(false);

  const all = data ?? [];
  const byState = (s: Filter) => (s === "ALL" ? all : all.filter((a) => a.state === s));
  const rows = useMemo(() => byState(filter).filter((a) => !subjectId || a.subjectId === subjectId), [all, filter, subjectId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function remove() {
    if (!removing) return;
    setBusy(true);
    try {
      await api.del(`/teacher/assignments/${removing.id}`);
      toast.success("Assignment deleted.");
      setRemoving(null);
      reload();
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader title="Assignments" description="Set work, follow submissions and give marks." actions={<Button icon={<Plus className="size-4" />} onClick={() => setForm({ open: true, editing: null })}>New assignment</Button>} />

      <Tabs id="assign-filter" className="mb-4" value={filter} onChange={setFilter} items={[{ value: "ALL", label: "All", count: all.length }, { value: "ACTIVE", label: "Open", count: byState("ACTIVE").length }, { value: "SCHEDULED", label: "Scheduled", count: byState("SCHEDULED").length }, { value: "CLOSED", label: "Closed", count: byState("CLOSED").length }]} />
      {subjects.length > 1 && (
        <div className="mb-5 max-w-xs">
          <Select aria-label="Filter by subject" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
            <option value="">All subjects</option>
            {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}{s.class ? `, ${s.class.name}` : ""}</option>)}
          </Select>
        </div>
      )}

      {loading ? (
        <ListSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : rows.length === 0 ? (
        <div className="card"><EmptyState icon={<ClipboardList className="size-5" />} title="No assignments here" description={all.length ? "Try another filter." : "Create your first assignment. Students are notified the moment it goes live."} action={!all.length && <Button onClick={() => setForm({ open: true, editing: null })}>New assignment</Button>} /></div>
      ) : (
        <ul className="space-y-3">
          {rows.map((a) => (
            <li key={a.id} className="card card-pad">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={a.state === "ACTIVE" ? "success" : a.state === "SCHEDULED" ? "gold" : "neutral"}>{a.state === "ACTIVE" ? "Open" : a.state === "SCHEDULED" ? "Scheduled" : "Closed"}</Badge>
                    <span className="text-sm text-muted">{a.subject.name}, {a.class.name}</span>
                  </div>
                  <Link href={`/teacher/assignments/${a.id}`} className="mt-2 block font-display text-xl font-semibold leading-snug hover:text-gold">{a.title}</Link>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
                    <CalendarClock className="size-4" />
                    {a.state === "SCHEDULED" ? `Goes live ${fmtDateTime(a.scheduledAt)}. ` : ""}
                    {fmtDateTime(a.deadline)} ({dueText(a.deadline).toLowerCase()})
                  </p>
                </div>
                <div className="w-full sm:w-56">
                  <div className="mb-1.5 flex justify-between text-sm"><span className="text-muted">Submitted</span><span className="tabular-nums">{a._count.submissions} of {a.totalStudents}</span></div>
                  <Bar value={a.totalStudents ? (a._count.submissions / a.totalStudents) * 100 : 0} tone="success" />
                </div>
              </div>
              <div className="divider mt-4 flex flex-wrap items-center gap-2 pt-3">
                <Link href={`/teacher/assignments/${a.id}`} className="btn btn-secondary btn-sm">Review submissions</Link>
                <Button size="sm" variant="ghost" icon={<Pencil className="size-4" />} onClick={() => setForm({ open: true, editing: a })}>Edit</Button>
                <Button size="sm" variant="ghost" className="!text-danger" icon={<Trash2 className="size-4" />} onClick={() => setRemoving(a)}>Delete</Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <AssignmentForm open={form.open} editing={form.editing} onClose={() => setForm((s) => ({ ...s, open: false }))} onDone={reload} subjects={subjects} />
      <ConfirmDialog open={!!removing} onClose={() => setRemoving(null)} onConfirm={remove} loading={busy} title="Delete this assignment?" message={`"${removing?.title ?? ""}" and every PDF students submitted for it will be permanently deleted.`} confirmLabel="Delete assignment" />
    </>
  );
}
