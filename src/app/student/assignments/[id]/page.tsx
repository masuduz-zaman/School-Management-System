"use client";

import { motion } from "framer-motion";
import { ArrowLeft, FileText, Upload } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge, ErrorState, Skeleton } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page-header";
import { useToast } from "@/components/ui/toast";
import { useFetch } from "@/hooks/use-fetch";
import { api, errorMessage } from "@/lib/api";
import { stateMeta } from "@/lib/assignment";
import { cx, dueText, fmtDateTime } from "@/lib/format";
import type { StudentAssignment } from "@/lib/types";

export default function StudentAssignmentPage() {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();
  const { data, loading, error, reload } = useFetch<StudentAssignment>(`/student/assignments/${id}`);
  const [file, setFile] = useState<File | null>(null);
  const [drag, setDrag] = useState(false);
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  if (loading) return <Skeleton className="h-96" />;
  if (error || !data) return <ErrorState message={error ?? "Assignment not found."} onRetry={reload} />;

  const sub = data.mySubmission;
  const closed = new Date(data.deadline).getTime() <= Date.now();
  const locked = data.state === "GRADED" || closed;

  function pick(f: File | undefined) {
    if (!f) return;
    if (f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) return toast.error("Only PDF files can be uploaded.");
    if (f.size > 10 * 1024 * 1024) return toast.error("The PDF must be smaller than 10 MB.");
    setFile(f);
  }

  async function submit() {
    if (!file) return;
    setBusy(true);
    try {
      const form = new FormData();
      form.append("file", file);
      await api.upload(`/student/assignments/${id}/submit`, form);
      toast.success(sub ? "Your new PDF replaced the old one." : "Handed in. Your teacher can see it now.");
      setFile(null);
      reload();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Link href="/student/assignments" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg"><ArrowLeft className="size-4" />All assignments</Link>
      <PageHeader title={data.title} description={`${data.subject.name}, set by ${data.teacher.user.name}`} actions={<Badge tone={stateMeta[data.state].tone}>{stateMeta[data.state].label}</Badge>} />

      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <div className="space-y-6">
          <section className="card card-pad">
            <h2 className="font-display text-lg font-semibold">Instructions</h2>
            <p className="mt-2 whitespace-pre-line leading-relaxed text-muted">{data.description || "Your teacher did not add instructions."}</p>
            <dl className="divider mt-5 grid grid-cols-2 gap-4 pt-4 text-sm">
              <div><dt className="text-muted">Deadline</dt><dd className="mt-0.5 font-medium">{fmtDateTime(data.deadline)}</dd><dd className={closed ? "text-danger" : "text-gold"}>{dueText(data.deadline)}</dd></div>
              <div><dt className="text-muted">Total marks</dt><dd className="mt-0.5 font-medium">{data.totalMarks}</dd></div>
            </dl>
          </section>

          {sub?.status === "GRADED" && (
            <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card card-pad">
              <h2 className="font-display text-lg font-semibold">Your result</h2>
              <p className="mt-2 font-display text-5xl font-semibold text-gold">{sub.marks}<span className="text-2xl text-muted"> / {data.totalMarks}</span></p>
              {sub.feedback && <p className="mt-4 whitespace-pre-line rounded-xl bg-surface-2 p-4 text-sm leading-relaxed">{sub.feedback}</p>}
            </motion.section>
          )}
        </div>

        <section className="card card-pad h-fit">
          <h2 className="font-display text-lg font-semibold">Your submission</h2>
          {sub && (
            <a href={sub.fileUrl} target="_blank" rel="noopener noreferrer" className="mt-3 flex items-center gap-3 rounded-xl border border-border bg-surface-2 p-3 transition-colors hover:bg-bg">
              <FileText className="size-5 shrink-0 text-gold" />
              <span className="min-w-0"><span className="block truncate text-sm font-medium">{sub.fileName ?? "Submitted PDF"}</span><span className="block text-xs text-muted">Handed in {fmtDateTime(sub.submittedAt)}</span></span>
            </a>
          )}

          {locked ? (
            <p className="mt-4 text-sm text-muted">{data.state === "GRADED" ? "Your teacher has checked this assignment, so it can no longer be changed." : "The deadline has passed, so uploads are closed."}</p>
          ) : (
            <>
              <button
                type="button"
                onClick={() => input.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                onDragLeave={() => setDrag(false)}
                onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files[0]); }}
                className={cx("mt-4 flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors", drag ? "border-primary bg-surface-2" : "border-border hover:border-primary/50")}
              >
                <Upload className="size-6 text-muted" />
                <span className="text-sm font-medium">{file ? file.name : sub ? "Choose a new PDF to replace it" : "Drop your PDF here or browse"}</span>
                <span className="text-xs text-muted">PDF only, up to 10 MB</span>
              </button>
              <input ref={input} type="file" accept="application/pdf,.pdf" className="sr-only" onChange={(e) => pick(e.target.files?.[0])} />
              <Button className="mt-4 w-full" disabled={!file} loading={busy} onClick={submit}>{sub ? "Replace PDF" : "Hand in"}</Button>
              {sub && <p className="mt-3 text-xs text-muted">You can replace your PDF until the deadline or until your teacher checks it.</p>}
            </>
          )}
        </section>
      </div>
    </>
  );
}
