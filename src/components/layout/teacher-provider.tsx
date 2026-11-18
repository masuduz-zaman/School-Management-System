"use client";

import { createContext, useContext, useMemo } from "react";
import { useFetch } from "@/hooks/use-fetch";
import type { SubjectRef, TeacherOverview } from "@/lib/types";

type TeacherState = {
  overview: TeacherOverview | null;
  /** Subjects this teacher can create assignments for. */
  subjects: SubjectRef[];
  loading: boolean;
  error: string | null;
  reload: () => void;
};

const TeacherContext = createContext<TeacherState | null>(null);

// Optional backend add-on (see README, "Backend notes"): lets a class head
// pick every subject of the class, not only the ones assigned to them.
const USE_SUBJECTS_ENDPOINT = process.env.NEXT_PUBLIC_TEACHER_SUBJECTS_ENDPOINT === "true";

export function TeacherProvider({ children }: { children: React.ReactNode }) {
  const overview = useFetch<TeacherOverview>("/teacher/overview");
  const extra = useFetch<SubjectRef[]>(USE_SUBJECTS_ENDPOINT ? "/teacher/subjects" : null);

  const value = useMemo<TeacherState>(
    () => ({
      overview: overview.data,
      subjects: extra.data ?? overview.data?.subjects ?? [],
      loading: overview.loading,
      error: overview.error,
      reload: overview.reload,
    }),
    [overview.data, overview.loading, overview.error, overview.reload, extra.data],
  );

  return <TeacherContext.Provider value={value}>{children}</TeacherContext.Provider>;
}

export function useTeacher() {
  const ctx = useContext(TeacherContext);
  if (!ctx) throw new Error("useTeacher must be used inside the teacher area");
  return ctx;
}
