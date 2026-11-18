"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/feedback";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/form";
import { PageHeader } from "@/components/ui/page-header";
import { useToast } from "@/components/ui/toast";
import { api, errorMessage } from "@/lib/api";

const roleLabel = { ADMIN: "Administrator", TEACHER: "Teacher", STUDENT: "Student" } as const;

export default function ProfilePage() {
  const { user, refresh } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ name: "", email: "", profilePhoto: "", bio: "" });
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [busy, setBusy] = useState<"profile" | "password" | null>(null);

  useEffect(() => {
    if (user) setForm({ name: user.name, email: user.email, profilePhoto: user.profile?.profilePhoto ?? "", bio: user.profile?.bio ?? "" });
  }, [user]);

  if (!user) return null;

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setBusy("profile");
    try {
      await api.put("/profile", { name: form.name.trim(), email: form.email.trim(), profilePhoto: form.profilePhoto.trim() || undefined, bio: form.bio.trim() || undefined });
      await refresh();
      toast.success("Profile saved.");
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(null);
    }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    if (pw.next.length < 6) return toast.error("The new password must be at least 6 characters.");
    if (pw.next !== pw.confirm) return toast.error("The new passwords do not match.");
    setBusy("password");
    try {
      await api.put("/profile", { currentPassword: pw.current, newPassword: pw.next });
      setPw({ current: "", next: "", confirm: "" });
      toast.success("Password changed.");
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <PageHeader title="Profile" description="Your details and password." />
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <section className="card card-pad h-fit text-center">
          <Avatar name={user.name} src={user.profile?.profilePhoto} size={88} className="mx-auto" />
          <h2 className="mt-4 font-display text-2xl font-semibold">{user.name}</h2>
          <p className="break-all text-sm text-muted">{user.email}</p>
          <Badge className="mt-3" tone="gold">{roleLabel[user.role]}</Badge>
          <dl className="divider mt-5 space-y-2 pt-4 text-left text-sm">
            {user.phone && <div className="flex justify-between gap-3"><dt className="text-muted">Phone</dt><dd>{user.phone}</dd></div>}
            {user.student?.classRoll && <div className="flex justify-between gap-3"><dt className="text-muted">Class roll</dt><dd>{user.student.classRoll}</dd></div>}
            {user.student?.parentPhone && <div className="flex justify-between gap-3"><dt className="text-muted">Parent phone</dt><dd>{user.student.parentPhone}</dd></div>}
          </dl>
        </section>

        <div className="space-y-6">
          <form onSubmit={saveProfile} className="card card-pad space-y-4">
            <h2 className="font-display text-xl font-semibold">Your details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name"><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
              <Field label="Email"><Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
            </div>
            <Field label="Photo link" hint="Paste the web address of an image."><Input type="url" value={form.profilePhoto} onChange={(e) => setForm({ ...form, profilePhoto: e.target.value })} placeholder="https://" /></Field>
            <Field label="About you" hint="Optional"><Textarea rows={4} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} /></Field>
            <Button type="submit" loading={busy === "profile"}>Save details</Button>
          </form>

          <form onSubmit={savePassword} className="card card-pad space-y-4">
            <h2 className="font-display text-xl font-semibold">Change password</h2>
            <Field label="Current password"><Input type="password" required autoComplete="current-password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} /></Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="New password" hint="At least 6 characters"><Input type="password" required autoComplete="new-password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} /></Field>
              <Field label="Repeat new password"><Input type="password" required autoComplete="new-password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} /></Field>
            </div>
            <Button type="submit" variant="secondary" loading={busy === "password"}>Change password</Button>
          </form>
        </div>
      </div>
    </>
  );
}
