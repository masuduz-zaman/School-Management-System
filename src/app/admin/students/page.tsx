"use client";

import { GraduationCap } from "lucide-react";
import { useMemo, useState } from "react";
import { AccountActions } from "@/components/admin/account-actions";
import { Avatar } from "@/components/ui/avatar";
import { Badge, EmptyState, ErrorState, ListSkeleton } from "@/components/ui/feedback";
import { SearchInput, Select } from "@/components/ui/form";
import { PageHeader } from "@/components/ui/page-header";
import { useFetch } from "@/hooks/use-fetch";
import { fmtDate } from "@/lib/format";
import type { AdminStudent } from "@/lib/types";

export default function StudentsPage() {
  const { data, loading, error, reload } = useFetch<AdminStudent[]>("/admin/all-students");
  const [q, setQ] = useState("");
  const [cls, setCls] = useState("");

  const all = data ?? [];
  const classNames = useMemo(() => [...new Set(all.map((s) => s.class?.name).filter(Boolean) as string[])].sort(), [all]);
  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return all.filter((s) => (!cls || s.class?.name === cls) && (!needle || s.user.name.toLowerCase().includes(needle) || s.user.email.toLowerCase().includes(needle)));
  }, [all, q, cls]);

  return (
    <>
      <PageHeader title="Students" description={`${all.length} enrolled`} />
      <div className="mb-5 flex flex-wrap gap-3">
        <SearchInput className="w-full sm:w-80" placeholder="Search by name or email" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search students" />
        <Select className="!w-48" aria-label="Filter by class" value={cls} onChange={(e) => setCls(e.target.value)}>
          <option value="">All classes</option>
          {classNames.map((n) => <option key={n} value={n}>{n}</option>)}
        </Select>
      </div>

      {loading ? (
        <ListSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : rows.length === 0 ? (
        <div className="card"><EmptyState icon={<GraduationCap className="size-5" />} title={all.length ? "No students match" : "No students yet"} description={all.length ? "Try a different name or class." : "Approved student requests will show up here."} /></div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="tbl">
            <thead><tr><th>Student</th><th>Class</th><th>Roll</th><th>Parent phone</th><th>Joined</th><th>Status</th><th className="text-right">Actions</th></tr></thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <Avatar name={s.user.name} size={36} />
                      <div className="min-w-0"><p className="truncate font-medium">{s.user.name}</p><p className="truncate text-xs text-muted">{s.user.email}</p></div>
                    </div>
                  </td>
                  <td>{s.class?.name ?? <span className="text-muted">No class</span>}</td>
                  <td>{s.classRoll ?? <span className="text-muted">Not set</span>}</td>
                  <td>{s.parentPhone ?? <span className="text-muted">Not set</span>}</td>
                  <td className="whitespace-nowrap text-muted">{fmtDate(s.user.createdAt)}</td>
                  <td><Badge tone={s.user.status === "ACTIVE" ? "success" : "danger"}>{s.user.status === "ACTIVE" ? "Active" : "Suspended"}</Badge></td>
                  <td><AccountActions userId={s.user.id} name={s.user.name} status={s.user.status} onChanged={reload} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
