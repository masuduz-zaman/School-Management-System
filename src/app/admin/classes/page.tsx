"use client";

import { Building2, Plus, Trash2, UserRoundCog } from "lucide-react";
import { useMemo, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge, CardGridSkeleton, EmptyState, ErrorState } from "@/components/ui/feedback";
import { Field, Input, Select, Switch, Textarea } from "@/components/ui/form";
import { Drawer, Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { useToast } from "@/components/ui/toast";
import { useFetch } from "@/hooks/use-fetch";
import { api, errorMessage } from "@/lib/api";
import type { AdminTeacher, ClassSummary, Subject } from "@/lib/types";

function CreateClass({ open, onClose, onDone }: { open: boolean; onClose: () => void; onDone: () => void }) {
  const toast = useToast();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post("/admin/add-class", { name: name.trim(), description: description.trim() || undefined });
      toast.success(`${name.trim()} was added.`);
      setName("");
      setDescription("");
      onDone();
      onClose();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add a class"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="create-class" loading={busy}>Add class</Button>
        </>
      }
    >
      <form id="create-class" onSubmit={submit} className="space-y-4">
        <Field label="Class name" hint="Names must be unique, for example Class 5 or Grade 7B.">
          <Input required value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        </Field>
        <Field label="Description" hint="Optional">
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </Field>
      </form>
    </Modal>
  );
}

function ClassDrawer({ cls, classes, teachers, subjectOnlyIds, onClose, onChanged }: { cls: ClassSummary; classes: ClassSummary[]; teachers: AdminTeacher[]; subjectOnlyIds: Set<string>; onClose: () => void; onChanged: () => void }) {
  const toast = useToast();
  const head = teachers.find((t) => t.classesAsClassTeacher.some((c) => c.id === cls.id));
  const eligible = teachers.filter((t) => !subjectOnlyIds.has(t.id));
  const [teacherId, setTeacherId] = useState("");
  const [createNew, setCreateNew] = useState(false);
  const [fresh, setFresh] = useState({ name: "", email: "", password: "", phone: "" });
  const [nextId, setNextId] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  async function run(key: string, fn: () => Promise<unknown>, success: string) {
    setBusy(key);
    try {
      await fn();
      toast.success(success);
      onChanged();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(null);
    }
  }

  const assign = () =>
    run(
      "assign",
      () =>
        createNew
          ? api.post("/admin/class-teacher", { classId: cls.id, newTeacher: { name: fresh.name.trim(), email: fresh.email.trim(), password: fresh.password, phone: fresh.phone.trim() || undefined } })
          : api.post("/admin/class-teacher", { classId: cls.id, teacherId }),
      "Class head teacher saved.",
    );

  const canAssign = createNew ? fresh.name && fresh.email && fresh.password.length >= 6 : !!teacherId;

  return (
    <Drawer open onClose={onClose} title={cls.name} description={cls.description ?? `${cls.totalStudents} students enrolled`}>
      <div className="space-y-8">
        <section>
          <h3 className="font-display text-lg font-semibold">Class head teacher</h3>
          <p className="mt-1 text-sm text-muted">Takes attendance, creates exams, publishes results and promotes students.</p>
          {head ? (
            <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-border bg-surface-2 p-3.5">
              <div className="flex min-w-0 items-center gap-3">
                <Avatar name={head.user.name} size={40} />
                <div className="min-w-0">
                  <p className="truncate font-medium">{head.user.name}</p>
                  <p className="truncate text-sm text-muted">{head.user.email}</p>
                </div>
              </div>
              <Button size="sm" variant="danger" icon={<Trash2 className="size-4" />} loading={busy === "remove"} onClick={() => run("remove", () => api.del(`/admin/class-teacher/${cls.id}`), "Class head removed.")}>
                Remove
              </Button>
            </div>
          ) : (
            <Badge tone="gold" className="mt-4">No class head yet</Badge>
          )}

          <div className="mt-5 space-y-3">
            <Switch checked={createNew} onChange={setCreateNew} label="Create a new teacher account" hint="Turn off to pick someone who already has an account." />
            {createNew ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Name"><Input value={fresh.name} onChange={(e) => setFresh({ ...fresh, name: e.target.value })} /></Field>
                <Field label="Email"><Input type="email" value={fresh.email} onChange={(e) => setFresh({ ...fresh, email: e.target.value })} /></Field>
                <Field label="Temporary password" hint="At least 6 characters"><Input type="password" value={fresh.password} onChange={(e) => setFresh({ ...fresh, password: e.target.value })} /></Field>
                <Field label="Phone" hint="Optional"><Input type="tel" value={fresh.phone} onChange={(e) => setFresh({ ...fresh, phone: e.target.value })} /></Field>
              </div>
            ) : (
              <Field label="Teacher">
                <Select value={teacherId} onChange={(e) => setTeacherId(e.target.value)}>
                  <option value="">Choose a teacher</option>
                  {eligible.map((t) => (
                    <option key={t.id} value={t.id}>{t.user.name} ({t.user.email})</option>
                  ))}
                </Select>
              </Field>
            )}
            <Button icon={<UserRoundCog className="size-4" />} disabled={!canAssign} loading={busy === "assign"} onClick={assign}>
              {head ? "Replace class head" : "Set class head"}
            </Button>
          </div>
        </section>

        <section className="divider pt-6">
          <h3 className="font-display text-lg font-semibold">Promotion path</h3>
          <p className="mt-1 text-sm text-muted">Students who pass the final exam move to this class.</p>
          <div className="mt-4 flex flex-wrap items-end gap-2">
            <Field label="Next class" className="min-w-52 flex-1">
              <Select value={nextId} onChange={(e) => setNextId(e.target.value)}>
                <option value="">Choose a class</option>
                {classes.filter((c) => c.id !== cls.id).map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
            </Field>
            <Button disabled={!nextId} loading={busy === "next"} onClick={() => run("next", () => api.patch(`/admin/class/${cls.id}/next-class`, { nextClassId: nextId }), "Promotion path saved.")}>Save</Button>
            <Button variant="secondary" loading={busy === "clear"} onClick={() => run("clear", () => api.patch(`/admin/class/${cls.id}/next-class`, { nextClassId: null }), "Promotion path cleared.")}>Clear</Button>
          </div>
        </section>

        <section className="divider pt-6">
          <h3 className="font-display text-lg font-semibold">Students ({cls.totalStudents})</h3>
          {cls.students.length === 0 ? (
            <p className="mt-3 text-sm text-muted">No students in this class yet.</p>
          ) : (
            <ul className="mt-3 divide-y divide-border rounded-xl border border-border">
              {cls.students.map((s) => (
                <li key={s.id} className="flex items-center gap-3 px-3.5 py-2.5">
                  <Avatar name={s.user.name} size={32} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{s.user.name}</p>
                    <p className="truncate text-xs text-muted">{s.user.email}</p>
                  </div>
                  {s.parentPhone && <span className="hidden text-xs text-muted sm:block">Parent: {s.parentPhone}</span>}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </Drawer>
  );
}

export default function ClassesPage() {
  const classes = useFetch<ClassSummary[]>("/admin/all-class");
  const teachers = useFetch<AdminTeacher[]>("/admin/all-teachers");
  const subjects = useFetch<Subject[]>("/admin/subjects");
  const [creating, setCreating] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const list = classes.data ?? [];
  const teacherList = teachers.data ?? [];
  const selected = list.find((c) => c.id === selectedId) ?? null;
  const subjectOnlyIds = useMemo(() => new Set((subjects.data ?? []).filter((s) => s.teacher?.isSubjectOnly).map((s) => s.teacher!.id)), [subjects.data]);
  const headOf = (id: string) => teacherList.find((t) => t.classesAsClassTeacher.some((c) => c.id === id))?.user.name;

  const reloadAll = () => {
    classes.reload();
    teachers.reload();
    subjects.reload();
  };

  return (
    <>
      <PageHeader title="Classes" description="Create classes, choose a class head teacher and set where promoted students go next." actions={<Button icon={<Plus className="size-4" />} onClick={() => setCreating(true)}>Add class</Button>} />

      {classes.loading ? (
        <CardGridSkeleton />
      ) : classes.error ? (
        <ErrorState message={classes.error} onRetry={classes.reload} />
      ) : list.length === 0 ? (
        <div className="card">
          <EmptyState icon={<Building2 className="size-5" />} title="No classes yet" description="Add your first class, then approve students into it." action={<Button onClick={() => setCreating(true)}>Add class</Button>} />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((c) => {
            const head = headOf(c.id);
            return (
              <button key={c.id} onClick={() => setSelectedId(c.id)} className="card card-pad text-left transition-colors hover:border-primary/40">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-display text-2xl font-semibold leading-tight">{c.name}</h2>
                  <Badge>{c.totalStudents} students</Badge>
                </div>
                {c.description && <p className="clamp-3 mt-2 text-sm text-muted">{c.description}</p>}
                <div className="divider mt-4 pt-3 text-sm">
                  {head ? <span><span className="text-muted">Class head:</span> <span className="font-medium">{head}</span></span> : <span className="text-gold">No class head yet</span>}
                </div>
              </button>
            );
          })}
        </div>
      )}

      <CreateClass open={creating} onClose={() => setCreating(false)} onDone={reloadAll} />
      {selected && <ClassDrawer cls={selected} classes={list} teachers={teacherList} subjectOnlyIds={subjectOnlyIds} onClose={() => setSelectedId(null)} onChanged={reloadAll} />}
    </>
  );
}
