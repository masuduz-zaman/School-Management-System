"use client";

import { Ban, RotateCcw, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { api, errorMessage } from "@/lib/api";
import type { UserStatus } from "@/lib/types";

/** Suspend / reactivate / delete buttons for a student or teacher account. */
export function AccountActions({ userId, name, status, onChanged }: { userId: string; name: string; status: UserStatus; onChanged: () => void }) {
  const toast = useToast();
  const [confirm, setConfirm] = useState<"suspend" | "delete" | null>(null);
  const [busy, setBusy] = useState(false);

  async function run(action: "suspend" | "activate" | "delete") {
    setBusy(true);
    try {
      if (action === "delete") {
        await api.del(`/admin/delete/${userId}`);
        toast.success(`${name} was deleted.`);
      } else {
        await api.patch(`/admin/user-status/${userId}`, { status: action === "suspend" ? "SUSPENDED" : "ACTIVE" });
        toast.success(action === "suspend" ? `${name} was suspended.` : `${name} can sign in again.`);
      }
      setConfirm(null);
      onChanged();
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex justify-end gap-1.5">
      {status === "ACTIVE" ? (
        <Button size="sm" variant="ghost" icon={<Ban className="size-4" />} onClick={() => setConfirm("suspend")}>
          Suspend
        </Button>
      ) : (
        <Button size="sm" variant="ghost" icon={<RotateCcw className="size-4" />} loading={busy} onClick={() => run("activate")}>
          Reactivate
        </Button>
      )}
      <Button size="sm" variant="ghost" className="!text-danger" aria-label={`Delete ${name}`} icon={<Trash2 className="size-4" />} onClick={() => setConfirm("delete")} />
      <ConfirmDialog
        open={confirm === "suspend"}
        onClose={() => setConfirm(null)}
        onConfirm={() => run("suspend")}
        loading={busy}
        title={`Suspend ${name}?`}
        message="They will be blocked from signing in and from every page until you reactivate the account."
        confirmLabel="Suspend account"
      />
      <ConfirmDialog
        open={confirm === "delete"}
        onClose={() => setConfirm(null)}
        onConfirm={() => run("delete")}
        loading={busy}
        title={`Delete ${name}?`}
        message="This permanently removes the account. Attendance, submissions and results linked to it may stop the deletion. This cannot be undone."
        confirmLabel="Delete account"
      />
    </div>
  );
}
