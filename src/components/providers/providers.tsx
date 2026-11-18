"use client";

import { MotionConfig } from "framer-motion";
import { AuthProvider } from "./auth-provider";
import { ThemeProvider } from "./theme-provider";
import { ToastProvider } from "@/components/ui/toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>{children}</AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </MotionConfig>
  );
}
