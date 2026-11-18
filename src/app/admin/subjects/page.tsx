"use client";

import { BookOpen, Plus, UserRoundPlus } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge, EmptyState, ErrorState, ListSkeleton } from "@/components/ui/feedback";
import { Field, Input, Select, Switch } from "@/components/ui/form";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { useToast } from "@/components/ui/toast";
import { useFetch } from "@/hooks/use-fetch";
import { api, errorMessage } from "@/lib/api";
import type { AdminTeacher, ClassSummary, Subject } from "@/lib/types";

function AddSubject({ open, onClose, onDone, classes, teachers, defaultClassId }: { open: boolean; onClose: () => void; onDone: () => void; classes: ClassSummary[]; teachers: AdminTeacher[]; defaultClassId: string }) {
  const toast = useToast();
  const [name, setName] = useState("");
  const [classId, setClassId] = useState(defaultClassId);
  const [teacherId, setTeacherId] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post("/admin/subjects", { name: name.trim(), classId: classId || defaultClassId, teacherId: teacherId || undefined });
      toast.success(`${name.trim()} was added.`);
      setName("");
      setTeacherId("");
      onDone();
      onClose();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add a subject" footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" form="add-subject" loading={busy}>Add subject</Button></>}>
      <form id="add-subject" onSubmit={submit} className="space-y-4">
        <Field label="Subject name"><Input required value={name} onChange={(e) => setName(e.target.value)} autoFocus /></Field>
        <Field label="Class">
          <Select required value={classId || defaultClassId} onChange={(e) => setClassId(e.target.value)}>
            <option value="">Choose a class</option>
            {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
        </Field>
        <Field label="Teacher" hint="Optional. You can assign one later.">
          <Select value={teacherId} onChange={(e) => setTeacherId(e.target.value)}>
            <option value="">No teacher yet</option>
            {teachers.map((t) => <option key={t.id} value={t.id}>{t.user.name}</option>)}
          </Select>
        </Field>
      </form>
    </Modal>
  );
}

function AddSubjectTeacher({ open, onClose, onDone, subjects, teachers }: { open: boolean; onClose: () => void; onDone: () => void; subjects: Subject[]; teachers: AdminTeacher[] }) {
  const toast = useToast();
  const [picked, setPicked] = useState<string[]>([]);
  const [createNew, setCreateNew] = useState(true);
  const [teacherId, setTeacherId] = useState("");
  const [fresh, setFresh] = useState({ name: "", email: "", password: "", phone: "" });
  const [busy, setBusy] = useState(false);

  const toggle = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const valid = picked.length > 0 && (createNew ? fresh.name && fresh.email && fresh.password.length >= 6 : teacherId);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post("/admin/subject-teacher", createNew ? { subjectIds: picked, newTeacher: { name: fresh.name.trim(), email: fresh.email.trim(), password: fresh.password, phone: fresh.phone.trim() || undefined } } : { subjectIds: picked, teacherId });
      toast.success("Subject teacher saved.");
      setPicked([]);
      setFresh({ name: "", email: "", password: "", phone: "" });
      onDone();
      onClose();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} width="max-w-xl" title="Add a subject teacher" description="A subject teacher manages assignments and marks for the subjects you pick, and nothing else." footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" form="add-subject-teacher" disabled={!valid} loading={busy}>Save teacher</Button></>}>
      <form id="add-subject-teacher" onSubmit={submit} className="space-y-5">
        <fieldset>
          <legend className="mb-1.5 text-sm font-medium">Subjects ({picked.length} chosen)</legend>
          <div className="scroll-thin max-h-48 divide-y divide-border overflow-y-auto rounded-xl border border-border">
            {subjects.length === 0 && <p className="p-4 text-sm text-muted">Add subjects first.</p>}
            {subjects.map((s) => (
              <label key={s.id} className="flex cursor-pointer items-center gap-3 px-3.5 py-2.5 text-sm hover:bg-surface-2">
                <input type="checkbox" className="size-4 accent-[var(--primary)]" checked={picked.includes(s.id)} onChange={() => toggle(s.id)} />
                <span className="flex-1">{s.name}</span>
                <span className="text-xs text-muted">{s.class?.name ?? "No class"}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <Switch checked={createNew} onChange={setCreateNew} label="Create a new teacher account" hint="Turn off to use someone who already has an account." />
        {createNew ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Name"><Input value={fresh.name} onChange={(e) => setFresh({ ...fresh, name: e.target.value })} /></Field>
            <Field label="Email"><Input type="email" value={fresh.email} onChange={(e) => setFresh({ ...fresh, email: e.target.value })} /></Field>
            <Field label="Temporary password" hint="At least 6 characters"><Input type="password" value={fresh.password} onChange={(e) => setFresh({ ...fresh, password: e.target.value })} /></Field>
            <Field label="Phone" hint="Optional"><Input type="tel" value={fresh.phone} onChange={(e) => setFresh({ ...fresh, phone: e.target.value })} /></Field>
          </div>
        ) : (
          <Field label="Teacher" hint="Class head teachers cannot become subject-only teachers.">
            <Select value={teacherId} onChange={(e) => setTeacherId(e.target.value)}>
              <option value="">Choose a teacher</option>
              {teachers.map((t) => <option key={t.id} value={t.id}>{t.user.name} ({t.user.email})</option>)}
            </Select>
          </Field>
        )}
      </form>
    </Modal>
  );
}

export default function SubjectsPage() {
  const toast = useToast();
  const [classId, setClassId] = useState("");
  const subjects = useFetch<Subject[]>("/admin/subjects", { classId });
  const classes = useFetch<ClassSummary[]>("/admin/all-class");
  const teachers = useFetch<AdminTeacher[]>("/admin/all-teachers");
  const [addSubject, setAddSubject] = useState(false);
  const [addTeacher, setAddTeacher] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  const list = subjects.data ?? [];
  const classList = classes.data ?? [];
  const teacherList = teachers.data ?? [];
  const grouped = useMemo(() => {
    const map = new Map<string, Subject[]>();
    list.forEach((s) => map.set(s.class?.name ?? "No class", [...(map.get(s.class?.name ?? "No class") ?? []), s]));
    return [...map.entries()];
  }, [list]);

  async function changeTeacher(subject: Subject, teacherId: string) {
    setSavingId(subject.id);
    try {
      await api.patch(`/admin/subjects/${subject.id}/teacher`, { teacherId: teacherId || null });
      toast.success(teacherId ? `Teacher updated for ${subject.name}.` : `${subject.name} now has no teacher.`);
      subjects.reload();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSavingId(null);
    }
  }

  return (
    <>
      <PageHeader
        title="Subjects"
        description="Each subject belongs to one class and can have one teacher."
        actions={
          <>
            <Button variant="secondary" icon={<UserRoundPlus className="size-4" />} onClick={() => setAddTeacher(true)}>Add subject teacher</Button>
            <Button icon={<Plus className="size-4" />} onClick={() => setAddSubject(true)}>Add subject</Button>
          </>
        }
      />
      <div className="mb-5 max-w-xs">
        <Select aria-label="Filter by class" value={classId} onChange={(e) => setClassId(e.target.value)}>
          <option value="">All classes</option>
          {classList.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
      </div>

      {subjects.loading ? (
        <ListSkeleton />
      ) : subjects.error ? (
        <ErrorState message={subjects.error} onRetry={subjects.reload} />
      ) : list.length === 0 ? (
        <div className="card"><EmptyState icon={<BookOpen className="size-5" />} title="No subjects yet" description="Add subjects to a class so teachers can set assignments and enter marks." action={<Button onClick={() => setAddSubject(true)}>Add subject</Button>} /></div>
      ) : (
        <div className="space-y-6">
          {grouped.map(([cls, items]) => (
            <section key={cls} className="card overflow-x-auto">
              <h2 className="border-b border-border px-5 py-3.5 font-display text-lg font-semibold">{cls}</h2>
              <table className="tbl">
                <thead><tr><th>Subject</th><th>Teacher</th><th>Role</th></tr></thead>
                <tbody>
                  {items.map((s) => (
                    <tr key={s.id}>
                      <td className="font-medium">{s.name}</td>
                      <td className="min-w-64">
                        <Select aria-label={`Teacher for ${s.name}`} disabled={savingId === s.id} value={s.teacher?.id ?? ""} onChange={(e) => changeTeacher(s, e.target.value)} className="!h-9">
                          <option value="">No teacher</option>
                          {teacherList.map((t) => <option key={t.id} value={t.id}>{t.user.name}</option>)}
                        </Select>
                      </td>
                      <td>{s.teacher ? <Badge tone={s.teacher.isSubjectOnly ? "gold" : "neutral"}>{s.teacher.isSubjectOnly ? "Subject teacher" : "Class head teacher"}</Badge> : <span className="text-muted">Not assigned</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          ))}
        </div>
      )}

      <AddSubject open={addSubject} onClose={() => setAddSubject(false)} onDone={() => subjects.reload()} classes={classList} teachers={teacherList} defaultClassId={classId || classList[0]?.id || ""} />
      <AddSubjectTeacher open={addTeacher} onClose={() => setAddTeacher(false)} onDone={() => { subjects.reload(); teachers.reload(); }} subjects={list} teachers={teacherList} />
    </>
  );
}
