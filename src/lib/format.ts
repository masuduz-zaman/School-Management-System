import { TIMEZONE } from "./config";

export const cx = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(" ");

const LOCALE = "en-GB";

export const fmtDate = (v?: string | Date | null) =>
  v
    ? new Date(v).toLocaleDateString(LOCALE, { day: "numeric", month: "short", year: "numeric", timeZone: TIMEZONE })
    : "Not set";

export const fmtDateTime = (v?: string | Date | null) =>
  v
    ? new Date(v).toLocaleString(LOCALE, {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZone: TIMEZONE,
      })
    : "Not set";

/** For calendar-day strings such as "2026-11-17" (no time zone shifting). */
export const fmtYmd = (ymd: string, opts?: Intl.DateTimeFormatOptions) =>
  new Date(`${ymd}T00:00:00Z`).toLocaleDateString(LOCALE, {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...opts,
    timeZone: "UTC",
  });

export const fmtMonth = (ym: string) =>
  new Date(`${ym}-01T00:00:00Z`).toLocaleDateString(LOCALE, { month: "long", year: "numeric", timeZone: "UTC" });

export const todayYmd = () => new Date().toLocaleDateString("en-CA", { timeZone: TIMEZONE });

/** Value for <input type="datetime-local"> */
export const toLocalInput = (v: string | Date) => {
  const d = new Date(v);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const localInputToIso = (v: string) => new Date(v).toISOString();

export const dueText = (deadline: string) => {
  const diff = new Date(deadline).getTime() - Date.now();
  const abs = Math.abs(diff);
  const mins = Math.round(abs / 60000);
  const hours = Math.round(abs / 3600000);
  const days = Math.round(abs / 86400000);
  const span = mins < 60 ? `${Math.max(mins, 1)} min` : hours < 48 ? `${hours} hr` : `${days} days`;
  return diff >= 0 ? `Due in ${span}` : `Overdue by ${span}`;
};

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const pct = (n: number) => `${Math.round(n * 10) / 10}%`;
