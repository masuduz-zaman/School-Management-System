"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Bell, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { roleHome, useAuth } from "@/components/providers/auth-provider";
import { Crest } from "@/components/ui/logo";
import { adminNav, studentNav, teacherNav, type NavItem } from "@/lib/nav";
import type { Role } from "@/lib/types";
import { SidebarContent } from "./sidebar";
import { StudentProvider, useStudent } from "./student-provider";
import { TeacherProvider, useTeacher } from "./teacher-provider";
import { ThemeToggle } from "./theme-toggle";

function Frame({ nav, children, showBell }: { nav: NavItem[]; children: React.ReactNode; showBell?: { count: number } }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="min-h-dvh lg:pl-64">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">
        <SidebarContent nav={nav} idPrefix="desktop" />
      </aside>

      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-40 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            <div className="absolute inset-0 bg-[var(--overlay)]" onClick={() => setOpen(false)} />
            <motion.aside
              className="absolute inset-y-0 left-0 w-72 max-w-[85vw]"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 360, damping: 38 }}
            >
              <SidebarContent nav={nav} idPrefix="mobile" />
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-bg/85 px-4 backdrop-blur-md sm:px-6 lg:px-10">
        <div className="flex items-center gap-2">
          <button className="btn btn-ghost !h-10 !w-10 !p-0 lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu className="size-5" />
          </button>
          <Crest className="size-7 text-fg lg:hidden" />
        </div>
        <div className="flex items-center gap-1">
          {showBell && (
            <Link href="/student/notifications" className="btn btn-ghost relative !h-10 !w-10 !p-0" aria-label={`Notifications${showBell.count ? `, ${showBell.count} unread` : ""}`}>
              <Bell className="size-5" />
              {showBell.count > 0 && <span className="absolute right-1.5 top-1.5 size-2.5 rounded-full bg-gold ring-2 ring-bg" />}
            </Link>
          )}
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 lg:px-10 lg:py-10">
        <motion.div key={pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24, ease: "easeOut" }}>
          {children}
        </motion.div>
      </main>
    </div>
  );
}

function TeacherFrame({ children }: { children: React.ReactNode }) {
  const { overview } = useTeacher();
  return <Frame nav={teacherNav(overview)}>{children}</Frame>;
}

function StudentFrame({ children }: { children: React.ReactNode }) {
  const { unread } = useStudent();
  return (
    <Frame nav={studentNav(unread)} showBell={{ count: unread }}>
      {children}
    </Frame>
  );
}

function ShellSkeleton() {
  return (
    <div className="grid min-h-dvh place-items-center">
      <motion.div animate={{ opacity: [0.35, 1, 0.35] }} transition={{ duration: 1.6, repeat: Infinity }}>
        <Crest className="size-12 text-muted" />
      </motion.div>
    </div>
  );
}

/** Wraps every signed-in area: checks the session and role, then draws the frame. */
export function RoleShell({ allow, children }: { allow?: Role[]; children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const blocked = !!user && !!allow && !allow.includes(user.role);

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    else if (blocked) router.replace(roleHome(user.role));
  }, [loading, user, blocked, router, pathname]);

  if (loading || !user || blocked) return <ShellSkeleton />;

  if (user.role === "TEACHER") {
    return (
      <TeacherProvider>
        <TeacherFrame>{children}</TeacherFrame>
      </TeacherProvider>
    );
  }
  if (user.role === "STUDENT") {
    return (
      <StudentProvider>
        <StudentFrame>{children}</StudentFrame>
      </StudentProvider>
    );
  }
  return <Frame nav={adminNav}>{children}</Frame>;
}
