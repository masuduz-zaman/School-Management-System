
"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  label?: string;
  fallbackUrl?: string;
  className?: string;
}

export function BackButton({
  label = "Go Back",
  fallbackUrl = "/",
  className = "",
}: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackUrl);
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className={`inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-fg transition-colors hover:bg-muted/50 ${className}`}
    >
      <ArrowLeft className="size-4" />
      {label}
    </button>
  );
}
