"use client";

import { motion } from "framer-motion";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { Crest } from "@/components/ui/logo";
import { useAuth } from "@/components/providers/auth-provider";
import { SCHOOL_NAME } from "@/lib/config";
import { cx } from "@/lib/format";
import type { NavItem } from "@/lib/nav";

const roleLabel = { ADMIN: "Administrator", TEACHER: "Teacher", STUDENT: "Student" } as const;

export function SidebarContent({ nav, idPrefix }: { nav: NavItem[]; idPrefix: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const isActive = (item: NavItem) => (item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`));

  return (
    <div className="flex h-full flex-col border-r border-[var(--sidebar-border)] bg-[var(--sidebar)] text-[var(--sidebar-fg)]">
      <div className="flex items-center gap-3 px-5 pb-5 pt-6">
        <Crest className="size-9 shrink-0 text-[var(--sidebar-fg)]" />
        <div className="min-w-0">
          <p className="truncate font-display text-lg font-semibold leading-tight">{SCHOOL_NAME}</p>
          {user && <p className="text-xs text-[var(--sidebar-muted)]">{roleLabel[user.role]}</p>}
        </div>
      </div>

      <nav className="scroll-thin flex-1 space-y-0.5 overflow-y-auto px-3 py-2" aria-label="Main">
        {nav.map((item) => {
          const active = isActive(item);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cx(
                "relative flex h-10 items-center gap-3 rounded-lg px-3 text-[0.92rem] transition-colors",
                active ? "font-semibold text-[var(--sidebar-fg)]" : "text-[var(--sidebar-muted)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--sidebar-fg)]",
              )}
            >
              {active && (
                <motion.span layoutId={`${idPrefix}-active`} className="absolute inset-0 rounded-lg bg-[var(--sidebar-hover)]" transition={{ type: "spring", stiffness: 480, damping: 38 }}>
                  <span className="absolute inset-y-2 left-0 w-[3px] rounded-r-full bg-[var(--sidebar-accent)]" />
                </motion.span>
              )}
              <Icon className="relative size-[18px] shrink-0" />
              <span className="relative flex-1 truncate">{item.label}</span>
              {!!item.badge && <span className="relative grid h-5 min-w-5 place-items-center rounded-full bg-[var(--sidebar-accent)] px-1.5 text-[0.7rem] font-bold text-white dark:text-[#0a0d14]">{item.badge > 99 ? "99+" : item.badge}</span>}
            </Link>
          );
        })}
      </nav>

      {user && (
        <div className="border-t border-[var(--sidebar-border)] p-3">
          <Link href="/profile" className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-[var(--sidebar-hover)]">
            <Avatar name={user.name} src={user.profile?.profilePhoto} size={36} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">{user.name}</span>
              <span className="block truncate text-xs text-[var(--sidebar-muted)]">{user.email}</span>
            </span>
          </Link>
          <button
            onClick={async () => {
              await logout();
              router.replace("/login");
            }}
            className="mt-1 flex h-9 w-full items-center gap-3 rounded-lg px-3 text-sm text-[var(--sidebar-muted)] transition-colors hover:bg-[var(--sidebar-hover)] hover:text-[var(--sidebar-fg)]"
          >
            <LogOut className="size-[18px]" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
