"use client";

import { CalendarCheck, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useTeacher } from "@/components/layout/teacher-provider";
import { StatusToggle } from "@/components/teacher/status-toggle";
import { Button } from "@/components/ui/button";
import { Badge, EmptyState, ErrorState, ListSkeleton, Skeleton } from "@/components/ui/feedback";
import { Field, Input, Select, Switch } from "@/components/ui/form";
import { PageHeader } from "@/components/ui/page-header";
import { Bar } from "@/components/ui/progress";
import { Tabs } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { useFetch } from "@/hooks/use-fetch";
import { api, errorMessage } from "@/lib/api";
import { fmtYmd, todayYmd } from "@/lib/format";
import type { AttendanceReport, AttendanceStatus, DaySheet } from "@/lib/types";

type Tab = "take" | "report";

function TakeAttendance({ classId }: { classId: string }) {
  const toast = useToast();
  const [date, setDate] = useState(todayYmd());
  const { data, loading, error, reload } = useFetch<DaySheet>("/teacher/attendance", { classId, date });
  const [marks, setMarks] = useState<Record<string, AttendanceStatus | null>>({});
  const [whatsapp, setWhatsapp] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!data) return;
    const next: Record<string, AttendanceStatus | null> = {};
    data.students.forEach((s) => (next[s.studentId] = s.status));
    setMarks(next);
  }, [data]);

  const students = data?.students ?? [];
  const count = (s: AttendanceStatus) => students.filter((x) => marks[x.studentId] === s).length;
  const unmarked = students.filter((x) => !marks[x.studentId]).length;

  async function save() {
    setBusy(true);
    try {
      const res = await api.post<{ saved: number; notified: number }>("/teacher/attendance", {
        classId,
        date,
        sendWhatsapp: whatsapp,
        records: students.map((s) => ({ studentId: s.studentId, status: marks[s.studentId] })),
      });
      toast.success(res.notified ? `Attendance saved. ${res.notified} students and parents were notified.` : "Attendance saved. Nobody's status changed, so no one was notified again.");
      reload();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="mb-5 flex flex-wrap items-end gap-3">
        <Field label="Date" className="w-full sm:w-52"><Input type="date" max={todayYmd()} value={date} onChange={(e) => e.target.value && setDate(e.target.value)} /></Field>
        <Button variant="secondary" onClick={() => setMarks(Object.fromEntries(students.map((s) => [s.studentId, "PRESENT" as const])))}>Mark everyone present</Button>
        {data?.taken && <Badge tone="success">Already taken for {fmtYmd(date)}</Badge>}
      </div>

      {loading ? (
        <ListSkeleton />
      ) : error || !data ? (
        <ErrorState message={error ?? "Could not load the sheet."} onRetry={reload} />
      ) : students.length === 0 ? (
        <div className="card"><EmptyState title="No students in this class" description="Approved students will appear here." /></div>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            <Badge tone="success">{count("PRESENT")} present</Badge>
            <Badge tone="danger">{count("ABSENT")} absent</Badge>
            <Badge tone="gold">{count("LATE")} late</Badge>
            {unmarked > 0 && <Badge>{unmarked} not marked</Badge>}
          </div>
          <div className="card divide-y divide-border">
            {students.map((s) => (
              <div key={s.studentId} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="w-8 text-right text-sm tabular-nums text-muted">{s.classRoll ?? ""}</span>
                  <span className="truncate font-medium">{s.name}</span>
                </div>
                <StatusToggle id={s.studentId} name={s.name} value={marks[s.studentId] ?? null} onChange={(v) => setMarks((m) => ({ ...m, [s.studentId]: v }))} />
              </div>
            ))}
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
            <Switch checked={whatsapp} onChange={setWhatsapp} label="Message parents on WhatsApp" hint="Parents always see the update in the app. WhatsApp is sent only if the school has it set up." />
            <Button icon={<Save className="size-4" />} loading={busy} disabled={unmarked > 0} onClick={save}>{unmarked > 0 ? `Mark ${unmarked} more to save` : "Save attendance"}</Button>
          </div>
        </>
      )}
    </>
  );
}

function Report({ classId }: { classId: string }) {
  const today = todayYmd();
  const [from, setFrom] = useState(`${today.slice(0, 8)}01`);
  const [to, setTo] = useState(today);
  const { data, loading, error, reload } = useFetch<AttendanceReport>("/teacher/attendance/report", { classId, from, to });

  return (
    <>
      <div className="mb-5 flex flex-wrap gap-3">
        <Field label="From" className="w-full sm:w-48"><Input type="date" value={from} max={to} onChange={(e) => e.target.value && setFrom(e.target.value)} /></Field>
        <Field label="To" className="w-full sm:w-48"><Input type="date" value={to} min={from} max={today} onChange={(e) => e.target.value && setTo(e.target.value)} /></Field>
      </div>
      {loading ? (
        <Skeleton className="h-64" />
      ) : error || !data ? (
        <ErrorState message={error ?? "Could not load the report."} onRetry={reload} />
      ) : data.totalClassDays === 0 ? (
        <div className="card"><EmptyState title="No attendance in this range" description="Take attendance for at least one day to see percentages." /></div>
      ) : (
        <>
          <p className="mb-3 text-sm text-muted">{data.totalClassDays} class days. Late counts as attended.</p>
          <div className="card overflow-x-auto">
            <table className="tbl">
              <thead><tr><th>Roll</th><th>Student</th><th>Present</th><th>Late</th><th>Absent</th><th className="min-w-48">Attendance</th></tr></thead>
              <tbody>
                {data.students.map((s) => (
                  <tr key={s.studentId}>
                    <td className="tabular-nums">{s.classRoll ?? <span className="text-muted">None</span>}</td>
                    <td className="font-medium">{s.name}</td>
                    <td className="tabular-nums">{s.present}</td>
                    <td className="tabular-nums">{s.late}</td>
                    <td className="tabular-nums">{s.absent}</td>
                    <td>
                      <div className="flex items-center gap-3">
                        <Bar value={s.percentage} tone={s.percentage >= 90 ? "success" : s.percentage >= 75 ? "gold" : "danger"} />
                        <span className="w-12 shrink-0 text-right text-sm tabular-nums">{s.percentage}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}

export default function AttendancePage() {
  const { overview, loading } = useTeacher();
  const heads = overview?.headOfClasses ?? [];
  const [classId, setClassId] = useState("");
  const [tab, setTab] = useState<Tab>("take");
  const active = classId || heads[0]?.id || "";

  if (loading) return <ListSkeleton />;
  if (!overview?.isClassHead) {
    return <div className="card"><EmptyState icon={<CalendarCheck className="size-5" />} title="Attendance is for class head teachers" description="Only the class head teacher can take attendance for a class." /></div>;
  }

  return (
    <>
      <PageHeader title="Attendance" description="Every save notifies students and their parents." actions={heads.length > 1 ? <Select aria-label="Class" value={active} onChange={(e) => setClassId(e.target.value)} className="!w-48">{heads.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select> : <Badge tone="gold">{heads[0]?.name}</Badge>} />
      <Tabs id="attendance-tabs" className="mb-5" value={tab} onChange={setTab} items={[{ value: "take", label: "Take attendance" }, { value: "report", label: "Report" }]} />
      {tab === "take" ? <TakeAttendance key={active} classId={active} /> : <Report key={active} classId={active} />}
    </>
  );
}
