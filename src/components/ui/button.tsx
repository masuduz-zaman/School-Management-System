import { LoaderCircle } from "lucide-react";
import { cx } from "@/lib/format";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
  loading?: boolean;
  icon?: React.ReactNode;
};

export function Button({ variant = "primary", size = "md", loading, icon, className, children, disabled, ...rest }: Props) {
  return (
    <button
      {...rest}
      type={rest.type ?? "button"}
      disabled={disabled || loading}
      className={cx("btn", `btn-${variant}`, size === "sm" && "btn-sm", className)}
    >
      {loading ? <LoaderCircle className="size-4 animate-spin" /> : icon}
      {children}
    </button>
  );
}
