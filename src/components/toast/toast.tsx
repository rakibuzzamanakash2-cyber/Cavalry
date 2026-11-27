"use client";

// Ported from Ru'sAuth (src/toast/Toast.tsx), restyled with CAVALRY's tokens.

import { CheckCircle, DangerCircle, X } from "@mynaui/icons-react";
import { useToastStore } from "./toast-store";

export function Toast() {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-[100] flex w-full flex-col items-center gap-2 px-3 sm:top-5 sm:px-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          role={t.type === "success" ? "status" : "alert"}
          className={`bg-surface text-ink pointer-events-auto flex w-full max-w-md items-start gap-3 border border-l-4 px-4 py-3 shadow-[6px_6px_0_0_var(--color-sand)] ${
            t.type === "success" ? "border-line border-l-primary" : "border-line border-l-accent"
          }`}
        >
          <span
            className={`mt-0.5 shrink-0 ${t.type === "success" ? "text-primary" : "text-accent-strong"}`}
          >
            {t.type === "success" ? (
              <CheckCircle size={20} stroke={1.8} />
            ) : (
              <DangerCircle size={20} stroke={1.8} />
            )}
          </span>
          <p className="min-w-0 flex-1 text-sm leading-relaxed">{t.message}</p>
          <button
            type="button"
            onClick={() => removeToast(t.id)}
            className="text-muted hover:text-ink shrink-0 cursor-pointer p-0.5 transition-colors"
            aria-label="Close notification"
          >
            <X size={18} stroke={2} />
          </button>
        </div>
      ))}
    </div>
  );
}
