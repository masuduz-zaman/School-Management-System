import type { AssignmentState } from "./types";

export const stateMeta: Record<AssignmentState, { label: string; tone: "gold" | "success" | "danger" | "neutral" }> = {
  PENDING: { label: "To hand in", tone: "gold" },
  SUBMITTED: { label: "Handed in", tone: "neutral" },
  GRADED: { label: "Graded", tone: "success" },
  OVERDUE: { label: "Missed", tone: "danger" },
};
