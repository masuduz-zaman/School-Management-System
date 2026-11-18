import { CountUp } from "./progress";
import { cx } from "@/lib/format";

export function StatCard({ label, value, suffix, decimals, icon, tone = "primary", hint }: { label: string; value: number | string; suffix?: string; decimals?: number; icon?: React.ReactNode; tone?: "primary" | "gold" | "success" | "danger"; hint?: string }) {
  const toneClass = { primary: "bg-surface-2 text-fg", gold: "bg-gold-soft text-gold", success: "bg-success-soft text-success", danger: "bg-danger-soft text-danger" }[tone];
  return (
    <div className="card card-pad flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm text-muted">{label}</p>
        <p className="mt-1.5 font-display text-4xl font-semibold leading-none tabular-nums">
          {typeof value === "number" ? <CountUp value={value} suffix={suffix} decimals={decimals} /> : value}
        </p>
        {hint && <p className="mt-2 text-xs text-muted">{hint}</p>}
      </div>
      {icon && <span className={cx("grid size-10 shrink-0 place-items-center rounded-xl", toneClass)}>{icon}</span>}
    </div>
  );
}
