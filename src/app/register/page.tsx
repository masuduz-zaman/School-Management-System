"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/form";
import { Segmented } from "@/components/ui/tabs";
import { useFetch } from "@/hooks/use-fetch";
import { api, errorMessage } from "@/lib/api";
import type { ClassSummary } from "@/lib/types";

type Kind = "STUDENT" | "TEACHER";

export default function RegisterPage() {
  const classes = useFetch<ClassSummary[]>("/admin/all-class");
  const [kind, setKind] = useState<Kind>("STUDENT");
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", className: "", classRoll: "", parentPhone: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (form.password.length < 6) return setError("Password must be at least 6 characters.");
    if (kind === "STUDENT" && !form.className) return setError("Choose your class.");
    setBusy(true);
    try {
      await api.post("/auth/registration", {
        requestType: kind,
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim() || undefined,
        ...(kind === "STUDENT" ? { className: form.className, classRoll: form.classRoll.trim() || undefined, parentPhone: form.parentPhone.trim() || undefined } : {}),
      });
      setDone(true);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <AuthLayout title="Request received" subtitle="An administrator will review it shortly.">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className="mb-6 grid size-16 place-items-center rounded-full bg-success-soft text-success">
          <Check className="size-8" strokeWidth={2.5} />
        </motion.div>
        <p className="text-sm leading-relaxed text-muted">Once your request is approved you can sign in with the email and password you just entered. Until then, sign-in will not work.</p>
        <Link href="/login" className="btn btn-primary mt-6 w-full">
          Go to sign in
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Request an account" subtitle="Accounts are created after an administrator approves your request.">
      <form onSubmit={onSubmit} className="space-y-4">
        <Segmented id="reg-kind" value={kind} onChange={setKind} items={[{ value: "STUDENT", label: "I am a student" }, { value: "TEACHER", label: "I am a teacher" }]} className="w-full" />
        <Field label="Full name">
          <Input required value={form.name} onChange={set("name")} autoComplete="name" />
        </Field>
        <Field label="Email">
          <Input type="email" required value={form.email} onChange={set("email")} autoComplete="email" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Phone" hint="Optional">
            <Input type="tel" value={form.phone} onChange={set("phone")} autoComplete="tel" />
          </Field>
          <Field label="Password" hint="At least 6 characters">
            <Input type="password" required value={form.password} onChange={set("password")} autoComplete="new-password" />
          </Field>
        </div>
        {kind === "STUDENT" && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-4 overflow-hidden">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Class">
                <Select value={form.className} onChange={set("className")} required>
                  <option value="">{classes.loading ? "Loading classes" : "Select class"}</option>
                  {(classes.data ?? []).map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Class roll" hint="Optional">
                <Input value={form.classRoll} onChange={set("classRoll")} inputMode="numeric" />
              </Field>
            </div>
            <Field label="Parent or guardian phone" hint="Attendance updates are sent to this number on WhatsApp. Include the country code if it is not local.">
              <Input type="tel" value={form.parentPhone} onChange={set("parentPhone")} />
            </Field>
          </motion.div>
        )}
        {error && (
          <p role="alert" className="rounded-lg bg-danger-soft px-3.5 py-2.5 text-sm text-danger">
            {error}
          </p>
        )}
        <Button type="submit" className="w-full" loading={busy}>
          Send request
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        Already approved?{" "}
        <Link href="/login" className="font-semibold text-fg underline underline-offset-4 hover:text-gold">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
