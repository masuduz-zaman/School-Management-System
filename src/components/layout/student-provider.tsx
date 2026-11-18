"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { api } from "@/lib/api";
import type { NotificationList } from "@/lib/types";

type StudentState = { unread: number; refreshUnread: () => Promise<void> };
const StudentContext = createContext<StudentState | null>(null);

export function StudentProvider({ children }: { children: React.ReactNode }) {
  const [unread, setUnread] = useState(0);
  const pathname = usePathname();

  const refreshUnread = useCallback(async () => {
    try {
      const res = await api.get<NotificationList>("/student/notifications", { unread: true });
      setUnread(res.unread.student + res.unread.parent);
    } catch {
      /* the badge is optional */
    }
  }, []);

  useEffect(() => {
    void refreshUnread();
  }, [refreshUnread, pathname]);

  const value = useMemo(() => ({ unread, refreshUnread }), [unread, refreshUnread]);
  return <StudentContext.Provider value={value}>{children}</StudentContext.Provider>;
}

export function useStudent() {
  const ctx = useContext(StudentContext);
  if (!ctx) throw new Error("useStudent must be used inside the student area");
  return ctx;
}
