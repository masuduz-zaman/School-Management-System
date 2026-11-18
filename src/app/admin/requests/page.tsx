"use client";

import { Ban, Check, Inbox, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge, EmptyState, ErrorState, ListSkeleton } from "@/components/ui/feedback";
import { ConfirmDialog } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { useFetch } from "@/hooks/use-fetch";
import { api, errorMessage } from "@/lib/api";
import { fmtDate } from "@/lib/format";
import type { ClassSummary, RegistrationRequest, RequestStatus } from "@/lib/types";

type Filter = "PENDING" | "APPROVED" | "CANCELLED" | "BLOCKED" | "ALL";
type Action = "APPROVED" | "CANCELLED" | "BLOCKED";

const statusLabel: Record<RequestStatus, string> = { PENDING: "Waiting", APPROVED: "Approved", CANCELLED: "Declined", BLOCKED: "Blocked", REJECTED: "Rejected" };
const statusTone = { PENDING: "gold", APPROVED: "success", CANCELLED: "neutral", BLOCKED: "danger", REJECTED: "danger" } as const;

const copy: Record<Action, { title: (n: string) => string; message: string; label: string; tone: "danger" | "primary" }> = {
  APPROVED: { title: (n) => `Approve ${n}?`, message: "An account is created right away and they can sign in with the email and password they chose.", label: "Approve", tone: "primary" },
  CANCELLED: { title: (n) => `Decline ${n}?`, message: "The request is closed without creating an account.", label: "Decline", tone: "danger" },
  BLOCKED: { title: (n) => `Block ${n}?`, message: "The request is closed and marked as blocked. Use this for spam or people who should not apply again.", label: "Block", tone: "danger" },
};

export default function RequestsPage() {
  const toast = useToast();
  const requests = useFetch<RegistrationRequest[]>("/admin/all-requests");
  const classes = useFetch<ClassSummary[]>("/admin/all-class");
  const [filter, setFilter] = useState<Filter>("PENDING");
  const [pending, setPending] = useState<{ request: RegistrationRequest; action: Action } | null>(null);
  const [busy, setBusy] = useState(false);

  const all = requests.data ?? [];
  const className = (id: string | null) => classes.data?.find((c) => c.id === id)?.name ?? null;
  const count = (s: Filter) => (s === "ALL" ? all.length : all.filter((r) => r.status === s).length);
  const rows = useMemo(() => (filter === "ALL" ? all : all.filter((r) => r.status === filter)), [all, filter]);

  async function confirm() {
    if (!pending) return;
    setBusy(true);
    try {
      await api.patch(`/admin/status/${pending.request.id}`, { status: pending.action });
      toast.success(pending.action === "APPROVED" ? `${pending.request.name} was approved.` : `${pending.request.name} was ${pending.action === "BLOCKED" ? "blocked" : "declined"}.`);
      setPending(null);
      requests.reload();
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader title="Requests" description="Review people who asked for a student or teacher account." />
      <Tabs
        id="requests"
        className="mb-5"
        value={filter}
        onChange={setFilter}
        items={[
          { value: "PENDING", label: "Waiting", count: count("PENDING") },
          { value: "APPROVED", label: "Approved", count: count("APPROVED") },
          { value: "CANCELLED", label: "Declined", count: count("CANCELLED") },
          { value: "BLOCKED", label: "Blocked", count: count("BLOCKED") },
          { value: "ALL", label: "All", count: count("ALL") },
        ]}
      />

      {requests.loading ? (
        <ListSkeleton />
      ) : requests.error ? (
        <ErrorState message={requests.error} onRetry={requests.reload} />
      ) : rows.length === 0 ? (
        <div className="card">
          <EmptyState icon={<Inbox className="size-5" />} title="Nothing here" description={filter === "PENDING" ? "No one is waiting for approval." : "No requests match this filter."} />
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="tbl">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Type</th>
                <th>Class</th>
                <th>Phone</th>
                <th>Sent</th>
                <th>Status</th>
                <th className="text-right">Decision</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <Avatar name={r.name} size={36} />
                      <div className="min-w-0">
                        <p className="truncate font-medium">{r.name}</p>
                        <p className="truncate text-xs text-muted">{r.email}</p>
                      </div>
                    </div>
                  </td>
                  <td><Badge tone={r.requestType === "TEACHER" ? "gold" : "neutral"}>{r.requestType === "TEACHER" ? "Teacher" : "Student"}</Badge></td>
                  <td>{className(r.classId) ?? <span className="text-muted">Not set</span>}{r.classRoll && <span className="text-muted">, roll {r.classRoll}</span>}</td>
                  <td className="text-sm">
                    {r.phone ?? <span className="text-muted">Not set</span>}
                    {r.parentPhone && <p className="text-xs text-muted">Parent: {r.parentPhone}</p>}
                  </td>
                  <td className="whitespace-nowrap text-muted">{fmtDate(r.createdAt)}</td>
                  <td><Badge tone={statusTone[r.status]}>{statusLabel[r.status]}</Badge></td>
                  <td>
                    {r.status === "PENDING" && (
                      <div className="flex justify-end gap-1.5">
                        <Button size="sm" icon={<Check className="size-4" />} onClick={() => setPending({ request: r, action: "APPROVED" })}>Approve</Button>
                        <Button size="sm" variant="secondary" icon={<X className="size-4" />} onClick={() => setPending({ request: r, action: "CANCELLED" })}>Decline</Button>
                        <Button size="sm" variant="ghost" aria-label={`Block ${r.name}`} icon={<Ban className="size-4" />} onClick={() => setPending({ request: r, action: "BLOCKED" })} />
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pending && (
        <ConfirmDialog
          open
          onClose={() => setPending(null)}
          onConfirm={confirm}
          loading={busy}
          title={copy[pending.action].title(pending.request.name)}
          message={copy[pending.action].message}
          confirmLabel={copy[pending.action].label}
          tone={copy[pending.action].tone}
        />
      )}
    </>
  );
}
