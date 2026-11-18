"use client";

import { Users } from "lucide-react";
import { useMemo, useState } from "react";
import { AccountActions } from "@/components/admin/account-actions";
import { Avatar } from "@/components/ui/avatar";
import { Badge, EmptyState, ErrorState, ListSkeleton } from "@/components/ui/feedback";
import { SearchInput } from "@/components/ui/form";
import { PageHeader } from "@/components/ui/page-header";
import { useFetch } from "@/hooks/use-fetch";
import { fmtDate } from "@/lib/format";
import type { AdminTeacher } from "@/lib/types";

export default function TeachersPage() {
  const { data, loading, error, reload } = useFetch<AdminTeacher[]>("/admin/all-teachers");
  const [q, setQ] = useState("");
  const all = data ?? [];
  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return all.filter((t) => !needle || t.user.name.toLowerCase().includes(needle) || t.user.email.toLowerCase().includes(needle));
  }, [all, q]);

  return (
    <>
      <PageHeader title="Teachers" description={`${all.length} on staff`} />
      <SearchInput className="mb-5 w-full sm:w-80" placeholder="Search by name or email" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search teachers" />

      {loading ? (
        <ListSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : rows.length === 0 ? (
        <div className="card"><EmptyState icon={<Users className="size-5" />} title={all.length ? "No teachers match" : "No teachers yet"} description={all.length ? "Try a different name or email." : "Approved teacher requests and teachers you add will show up here."} /></div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="tbl">
            <thead><tr><th>Teacher</th><th>Phone</th><th>Class head of</th><th>Joined</th><th>Status</th><th className="text-right">Actions</th></tr></thead>
            <tbody>
              {rows.map((t) => (
                <tr key={t.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <Avatar name={t.user.name} size={36} />
                      <div className="min-w-0"><p className="truncate font-medium">{t.user.name}</p><p className="truncate text-xs text-muted">{t.user.email}</p></div>
                    </div>
                  </td>
                  <td>{t.user.phone ?? <span className="text-muted">Not set</span>}</td>
                  <td>
                    {t.classesAsClassTeacher.length === 0 ? <span className="text-muted">None</span> : <div className="flex flex-wrap gap-1.5">{t.classesAsClassTeacher.map((c) => <Badge key={c.id} tone="gold">{c.name}</Badge>)}</div>}
                  </td>
                  <td className="whitespace-nowrap text-muted">{fmtDate(t.user.createdAt)}</td>
                  <td><Badge tone={t.user.status === "ACTIVE" ? "success" : "danger"}>{t.user.status === "ACTIVE" ? "Active" : "Suspended"}</Badge></td>
                  <td><AccountActions userId={t.user.id} name={t.user.name} status={t.user.status} onChanged={reload} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
