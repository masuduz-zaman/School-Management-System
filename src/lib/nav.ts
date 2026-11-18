import {
  Award,
  Bell,
  BookOpen,
  Building2,
  CalendarCheck,
  ClipboardList,
  GraduationCap,
  Images,
  Inbox,
  LayoutDashboard,
  Megaphone,
  Phone,
  Quote,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { TeacherOverview } from "./types";

export type NavItem = { href: string; label: string; icon: LucideIcon; exact?: boolean; badge?: number };

export const adminNav: NavItem[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/requests", label: "Requests", icon: Inbox },
  { href: "/admin/classes", label: "Classes", icon: Building2 },
  { href: "/admin/subjects", label: "Subjects", icon: BookOpen },
  { href: "/admin/students", label: "Students", icon: GraduationCap },
  { href: "/admin/teachers", label: "Teachers", icon: Users },
  { href: "/admin/notices", label: "Notices", icon: Megaphone },
  { href: "/admin/content", label: "Head teacher message", icon: Quote },
  { href: "/admin/gallery", label: "Gallery", icon: Images },
];

export const teacherNav = (overview: TeacherOverview | null): NavItem[] => [
  { href: "/teacher", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/teacher/assignments", label: "Assignments", icon: ClipboardList },
  { href: "/teacher/exams", label: "Exams and results", icon: Award },
  ...(overview?.isClassHead ? [{ href: "/teacher/attendance", label: "Attendance", icon: CalendarCheck }] : []),
];

export const studentNav = (unread: number): NavItem[] => [
  { href: "/student", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/student/assignments", label: "Assignments", icon: ClipboardList },
  { href: "/student/results", label: "Results", icon: Award },
  { href: "/student/attendance", label: "Attendance", icon: CalendarCheck },
  { href: "/student/notifications", label: "Notifications", icon: Bell, badge: unread },
  { href: "/student/teachers", label: "My teachers", icon: Phone },
];
