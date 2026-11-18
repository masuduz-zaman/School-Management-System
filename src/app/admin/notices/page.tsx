"use client";

import { Megaphone } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState, Skeleton } from "@/components/ui/feedback";
import { Field, Input, Textarea } from "@/components/ui/form";
import { PageHeader } from "@/components/ui/page-header";
import { useToast } from "@/components/ui/toast";
import { useFetch } from "@/hooks/use-fetch";
import { api, errorMessage } from "@/lib/api";
import { fmtDate, localInputToIso } from "@/lib/format";
import type { Notice } from "@/lib/types";

export default function NoticesPage() {
  const toast = useToast();
  const live = useFetch<Notice[]>("/notice");
  const [form, setForm] = useState({ title: "", content: "", publishDate: "", days: "30" });
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post("/admin/create-notice", {
        title: form.title.trim(),
        content: form.content.trim(),
        publishDate: form.publishDate ? localInputToIso(form.publishDate) : undefined,
        durationInDays: Number(form.days) || 30,
      });
      toast.success(form.publishDate ? "Notice scheduled." : "Notice published.");
      setForm({ title: "", content: "", publishDate: "", days: "30" });
      live.reload();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  const notices = live.data ?? [];

  return (
    <>
      <PageHeader title="Notices" description="Post admission and school announcements to the public notice board." />
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <form onSubmit={submit} className="card card-pad h-fit space-y-4">
          <h2 className="font-display text-xl font-semibold">New notice</h2>
          <Field label="Title"><Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
          <Field label="Message"><Textarea required rows={5} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Publish at" hint="Leave empty to publish now."><Input type="datetime-local" value={form.publishDate} onChange={(e) => setForm({ ...form, publishDate: e.target.value })} /></Field>
            <Field label="Visible for (days)"><Input type="number" min={1} max={365} value={form.days} onChange={(e) => setForm({ ...form, days: e.target.value })} /></Field>
          </div>
          <Button type="submit" loading={busy}>{form.publishDate ? "Schedule notice" : "Publish notice"}</Button>
        </form>

        <section>
          <h2 className="mb-3 font-display text-xl font-semibold">Showing on the notice board</h2>
          {live.loading ? (
            <Skeleton className="h-40" />
          ) : notices.length === 0 ? (
            <div className="card"><EmptyState icon={<Megaphone className="size-5" />} title="No live notices" description="Published notices appear here until they expire." /></div>
          ) : (
            <div className="space-y-3">
              {notices.map((n) => (
                <article key={n.id} className="card card-pad">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold">{n.title}</h3>
                    <time className="shrink-0 text-xs text-muted">{fmtDate(n.publishedAt)}</time>
                  </div>
                  <p className="clamp-3 mt-1.5 whitespace-pre-line text-sm text-muted">{n.content}</p>
                  <p className="mt-3 text-xs text-muted">Visible until {fmtDate(n.expiresAt)}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
