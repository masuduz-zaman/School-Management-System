"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Crest } from "@/components/ui/logo";
import { SCHOOL_NAME } from "@/lib/config";

const arcs = [88, 128, 168, 208, 248];

function Arcs() {
  return (
    <svg viewBox="0 0 520 520" className="pointer-events-none absolute -bottom-40 -right-40 w-[560px] text-[var(--sidebar-fg)]" fill="none" aria-hidden>
      {arcs.map((r, i) => (
        <motion.circle
          key={r}
          cx="260"
          cy="260"
          r={r}
          stroke={i === 2 ? "var(--sidebar-accent)" : "currentColor"}
          strokeOpacity={i === 2 ? 0.9 : 0.16}
          strokeWidth={i === 2 ? 1.6 : 1}
          initial={{ pathLength: 0, rotate: -90 }}
          animate={{ pathLength: 1, rotate: -90 }}
          transition={{ duration: 1.8, delay: 0.15 * i, ease: [0.22, 1, 0.36, 1] }}
          style={{ originX: "260px", originY: "260px" }}
        />
      ))}
    </svg>
  );
}

export function AuthLayout({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <aside className="relative hidden overflow-hidden bg-[var(--sidebar)] p-12 text-[var(--sidebar-fg)] lg:flex lg:flex-col lg:justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Crest className="size-10" />
          <span className="font-display text-xl font-semibold">{SCHOOL_NAME}</span>
        </Link>
        <div className="relative z-10 max-w-md">
          <motion.h2 className="font-display text-5xl font-medium leading-[1.08]" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}>
            Every student, teacher and family on the same page.
          </motion.h2>
          <motion.p className="mt-5 text-[var(--sidebar-muted)]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.6 }}>
            Attendance, assignments, results and notices arrive the moment a teacher saves them.
          </motion.p>
        </div>
        <Arcs />
        <div className="h-4" />
      </aside>

      <main className="relative flex flex-col px-5 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 lg:invisible">
            <Crest className="size-7" />
            <span className="font-display text-lg font-semibold">{SCHOOL_NAME}</span>
          </Link>
          <ThemeToggle />
        </div>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-8">
          <h1 className="font-display text-4xl font-semibold leading-tight">{title}</h1>
          <p className="mb-8 mt-2 text-muted">{subtitle}</p>
          {children}
        </div>
      </main>
    </div>
  );
}
