export type Role = "ADMIN" | "TEACHER" | "STUDENT";
export type UserStatus = "ACTIVE" | "SUSPENDED";
export type RequestStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" | "BLOCKED";
export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE";

export interface Me {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: Role;
  status: UserStatus;
  profile: { id: string; profilePhoto: string | null; bio: string | null } | null;
  student: { id: string; classId: string | null; classRoll: string | null; parentPhone: string | null } | null;
  teacher: { id: string; isSubjectOnly: boolean } | null;
}

/* ---------- public ---------- */
export interface Notice {
  id: string;
  title: string;
  content: string;
  publishedAt: string;
  expiresAt: string;
  createdBy: { name: string };
}
export interface GalleryImage {
  id: string;
  imageUrl: string;
  title: string | null;
  description: string | null;
}
export interface GalleryAlbum {
  id: string;
  name: string;
  slug: string;
  images: GalleryImage[];
}
export interface SchoolContent {
  id: string;
  headTeacherMessage: string;
  updatedAt: string;
  updateBy: { id: string; name: string; email: string };
}

/* ---------- admin ---------- */
export interface ClassSummary {
  id: string;
  name: string;
  description: string | null;
  totalStudents: number;
  students: { id: string; parentPhone: string | null; user: { id: string; name: string; email: string; phone: string | null } }[];
}
export interface RegistrationRequest {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  classRoll: string | null;
  requestType: "STUDENT" | "TEACHER";
  status: RequestStatus;
  classId: string | null;
  parentPhone: string | null;
  createdAt: string;
}
interface AccountUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: UserStatus;
  createdAt: string;
}
export interface AdminStudent {
  id: string;
  classRoll: string | null;
  parentPhone: string | null;
  class: { id: string; name: string } | null;
  user: AccountUser;
}
export interface AdminTeacher {
  id: string;
  user: AccountUser;
  classesAsClassTeacher: { id: string; name: string }[];
}
export interface TeacherSummary {
  id: string;
  isSubjectOnly: boolean;
  user: { id: string; name: string; email: string; phone: string | null };
}
export interface Subject {
  id: string;
  name: string;
  class: { id: string; name: string } | null;
  teacher: TeacherSummary | null;
}
export interface AdminGalleryCategory extends GalleryAlbum {
  description: string | null;
}

/* ---------- teacher ---------- */
export interface SubjectRef {
  id: string;
  name: string;
  class: { id: string; name: string } | null;
}
export interface TeacherOverview {
  teacherId: string;
  isSubjectOnly: boolean;
  isClassHead: boolean;
  headOfClasses: { id: string; name: string; nextClass: { id: string; name: string } | null; totalStudents: number }[];
  subjects: SubjectRef[];
}
export interface TeacherAssignment {
  id: string;
  title: string;
  description: string | null;
  classId: string;
  subjectId: string;
  scheduledAt: string;
  deadline: string;
  totalMarks: number;
  isPublished: boolean;
  subject: { id: string; name: string };
  class: { id: string; name: string };
  _count: { submissions: number };
  totalStudents: number;
  state: "SCHEDULED" | "ACTIVE" | "CLOSED";
}
export interface Submission {
  id: string;
  fileUrl: string;
  fileName: string | null;
  status: "SUBMITTED" | "GRADED";
  submittedAt: string;
  marks: number | null;
  feedback: string | null;
  gradedAt: string | null;
}
export interface SubmissionSheet {
  assignment: { id: string; title: string; subject: string; deadline: string; totalMarks: number; isPublished: boolean };
  summary: { totalStudents: number; submitted: number; graded: number; notSubmitted: number };
  students: { studentId: string; name: string; email: string; classRoll: string | null; submission: Submission | null }[];
}
export interface Exam {
  id: string;
  name: string;
  classId: string;
  examDate: string | null;
  totalMarks: number;
  passMarks: number;
  isFinal: boolean;
  isPublished: boolean;
  class: { id: string; name: string };
  _count: { results: number };
}
export interface MarksSheet {
  exam: { id: string; name: string; class: string; totalMarks: number; passMarks: number; isFinal: boolean; isPublished: boolean };
  subjects: { id: string; name: string }[];
  students: {
    studentId: string;
    name: string;
    classRoll: string | null;
    subjects: { subjectId: string; marks: number | null; remarks: string | null }[];
    total?: number;
    complete?: boolean;
  }[];
}
export interface PromotionPreview {
  exam: { id: string; name: string; isFinal: boolean; passMarks: number };
  fromClass: string;
  nextClass: { id: string; name: string } | null;
  canPromote: boolean;
  counts: { passed: number; failed: number; incomplete: number };
  students: {
    studentId: string;
    name: string;
    classRoll: string | null;
    total: number;
    percentage: number;
    status: "PASSED" | "FAILED" | "INCOMPLETE";
    failedSubjects: string[];
    missingSubjects: string[];
  }[];
}
export interface DaySheet {
  date: string;
  taken: boolean;
  counts: { total: number; present: number; absent: number; late: number };
  students: { studentId: string; name: string; classRoll: string | null; status: AttendanceStatus | null; note: string | null }[];
}
export interface AttendanceReport {
  from: string | null;
  to: string | null;
  totalClassDays: number;
  students: { studentId: string; name: string; classRoll: string | null; present: number; late: number; absent: number; percentage: number }[];
}

/* ---------- student ---------- */
export type AssignmentState = "PENDING" | "SUBMITTED" | "GRADED" | "OVERDUE";
export interface StudentAssignment {
  id: string;
  title: string;
  description: string | null;
  totalMarks: number;
  scheduledAt: string;
  deadline: string;
  publishedAt: string | null;
  subject: { id: string; name: string };
  teacher: { user: { name: string; phone: string | null } };
  mySubmission: Submission | null;
  state: AssignmentState;
}
export interface StudentResults {
  exams: {
    exam: { id: string; name: string; examDate: string | null; class: string; isFinal: boolean; passMarks: number };
    subjects: { subjectId: string; subject: string; marks: number; totalMarks: number; percentage: number; grade: string; passed: boolean; remarks: string | null }[];
    totalObtained: number;
    totalMarks: number;
    percentage: number;
    grade: string;
    status: "PASSED" | "FAILED" | "INCOMPLETE";
  }[];
  assignmentsBySubject: {
    subjectId: string;
    subject: string;
    obtained: number;
    outOf: number;
    percentage: number;
    items: { assignmentId: string; title: string; deadline: string; totalMarks: number; status: "GRADED" | "SUBMITTED" | "PENDING" | "NOT_SUBMITTED"; marks: number | null; feedback: string | null }[];
  }[];
}
interface AttendanceSummary {
  totalDays: number;
  present: number;
  late: number;
  absent: number;
  percentage: number;
}
export interface StudentAttendance {
  overall: AttendanceSummary;
  selected: (AttendanceSummary & { month: string }) | null;
  monthly: (AttendanceSummary & { month: string })[];
  records: { date: string; status: AttendanceStatus; note: string | null }[];
}
export type NotificationType = "ASSIGNMENT" | "ATTENDANCE" | "RESULT" | "PROMOTION" | "GENERAL";
export interface AppNotification {
  id: string;
  audience: "STUDENT" | "PARENT";
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  whatsappStatus: "NOT_REQUIRED" | "PENDING" | "SENT" | "FAILED" | "SKIPPED";
  createdAt: string;
}
export interface NotificationList {
  unread: { student: number; parent: number };
  items: AppNotification[];
}
export interface TeacherCard {
  name: string;
  phone: string | null;
  email: string;
  profilePhoto: string | null;
}
export interface MyTeachers {
  class: { id: string; name: string } | null;
  classTeacher: TeacherCard | null;
  subjectTeachers: { subjectId: string; subject: string; teacher: TeacherCard | null }[];
}
