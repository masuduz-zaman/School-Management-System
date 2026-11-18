"use client";

import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/feedback";
import { Field, Textarea } from "@/components/ui/form";
import { ConfirmDialog } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { useToast } from "@/components/ui/toast";
import { useFetch } from "@/hooks/use-fetch";
import { api, errorMessage } from "@/lib/api";
import { fmtDateTime } from "@/lib/format";
import type { SchoolContent } from "@/lib/types";

export default function ContentPage() {
  const toast = useToast();
  const { user } = useAuth();
  const content = useFetch<SchoolContent | null>("/admin/content");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const current = content.data;

  useEffect(() => {
    if (current) setMessage(current.headTeacherMessage);
  }, [current]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    try {
      await api.post("/admin/create-content", { headTeacherMessage: message.trim(), updatedById: user.id });
      toast.success("Message published on the home page.");
      content.reload();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!current) return;
    setBusy(true);
    try {
      await api.del(`/admin/content/${current.id}`);
      setMessage("");
      toast.success("Message removed from the home page.");
      setConfirm(false);
      content.reload();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader title="Head teacher message" description="This note appears on the public home page, under the notice board." />
      {content.loading ? (
        <Skeleton className="h-64" />
      ) : (
        <form onSubmit={save} className="card card-pad max-w-3xl space-y-4">
          <Field label="Message" hint={current ? `Last published ${fmtDateTime(current.updatedAt)} by ${current.updateBy.name}.` : "Nothing is published yet."}>
            <Textarea required rows={10} value={message} onChange={(e) => setMessage(e.target.value)} className="font-display !text-lg !leading-relaxed" />
          </Field>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" loading={busy} disabled={!message.trim() || message.trim() === current?.headTeacherMessage}>Publish message</Button>
            {current && <Button variant="danger" icon={<Trash2 className="size-4" />} onClick={() => setConfirm(true)}>Remove message</Button>}
          </div>
        </form>
      )}
      <ConfirmDialog open={confirm} onClose={() => setConfirm(false)} onConfirm={remove} loading={busy} title="Remove the message?" message="The head teacher section disappears from the home page until you publish a new message." confirmLabel="Remove message" />
    </>
  );
}
