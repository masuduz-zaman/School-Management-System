import { RoleShell } from "@/components/layout/role-shell";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <RoleShell>{children}</RoleShell>;
}
