"use client";

import { Award, Bell, CalendarCheck, ClipboardList, GraduationCap } from "lucide-react";
import { useState } from "react";
import { useStudent } from "@/components/layout/student-provider";
import { Button } from "@/components/ui/button";
import { Badge, EmptyState, ErrorState, ListSkeleton } from "@/components/ui/feedback";
import { Select } from "@/components/ui/form";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { useFetch } from "@/hooks/use-fetch";
import { api, errorMessage } from "@/lib/api";
import { cx, fmtDateTime } from "@/lib/format";
import type { AppNotification, NotificationList, NotificationType } from "@/lib/types";

type Audience = "STUDENT" | "PARENT";
const icons = { ASSIGNMENT: ClipboardList, ATTENDANCE: CalendarCheck, RESULT: Award, PROMOTION: GraduationCap, GENERAL: Bell } as const;
const typeLabel: Record<NotificationType, string> = { ASSIGNMENT: "Assignments", ATTENDANCE: "Attendance", RESULT: "Results", PROMOTION: "Promotion", GENERAL: "General" };
const wa = {
  SENT: { label: "Sent on WhatsApp", tone: "success" },
  FAILED: { label: "WhatsApp failed", tone: "danger" },
  PENDING: { label: "Sending on WhatsApp", tone: "gold" },
  SKIPPED: { label: "In the app only", tone: "neutral" },
} as const;

export default function NotificationsPage() {
  const toast = useToast();
  const { refreshUnread } = useStudent();
  const [audience, setAudience] = useState<Audience>("STUDENT");
  const [type, setType] = useState("");
  const { data, loading, error, reload, setData } = useFetch<NotificationList>("/student/notifications", { audience, type });
  const [busy, setBusy] = useState(false);

  async function open(n: AppNotification) {
    if (n.isRead) return;
    setData((d) => d && { ...d, items: d.items.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)) });
    try {
      await api.patch(`/student/notifications/${n.id}/read`);
      void refreshUnread();
      reload();
    } catch (e) {
      toast.error(errorMessage(e));
    }
  }

  async function readAll() {
    setBusy(true);
    try {
      await api.patch(`/student/notifications/read-all?audience=${audience}`);
      reload();
      void refreshUnread();
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  const items = data?.items ?? [];
  const unreadHere = items.filter((n) => !n.isRead).length;

  return (
    <>
      <PageHeader title="Notifications" description="The parent view shows exactly what your guardian receives." actions={<Button variant="secondary" disabled={unreadHere === 0} loading={busy} onClick={readAll}>Mark all as read</Button>} />
      <Tabs id="aud" value={audience} onChange={(a) => { setAudience(a); setType(""); }} items={[{ value: "STUDENT", label: "For me", count: data?.unread.student }, { value: "PARENT", label: "Parent view", count: data?.unread.parent }]} />
      <div className="my-5 max-w-xs">
        <Select aria-label="Type" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">All types</option>
          {Object.entries(typeLabel).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </Select>
      </div>

      {loading && !data ? <ListSkeleton /> : error ? <ErrorState message={error} onRetry={reload} /> : items.length === 0 ? (
        <div className="card"><EmptyState icon={<Bell className="size-5" />} title="Nothing here yet" description="Attendance, assignments and results will show up as soon as teachers save them." /></div>
      ) : (
        <ul className="card divide-y divide-border">
          {items.map((n) => {
            const Icon = icons[n.type];
            const w = n.audience === "PARENT" && n.whatsappStatus !== "NOT_REQUIRED" ? wa[n.whatsappStatus] : null;
            return (
              <li key={n.id}>
                <button onClick={() => open(n)} className={cx("flex w-full items-start gap-4 px-5 py-4 text-left transition-colors hover:bg-surface-2", !n.isRead && "bg-gold-soft/40")}>
                  <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-surface-2 text-muted"><Icon className="size-[18px]" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-3">
                      <span className={cx("block", n.isRead ? "font-medium" : "font-semibold")}>{n.title}</span>
                      {!n.isRead && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-gold" aria-label="Unread" />}
                    </span>
                    <span className="mt-0.5 block whitespace-pre-line text-sm leading-relaxed text-muted">{n.message}</span>
                    <span className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">{fmtDateTime(n.createdAt)}{w && <Badge tone={w.tone}>{w.label}</Badge>}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
