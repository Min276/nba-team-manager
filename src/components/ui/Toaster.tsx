"use client";

import { useEffect } from "react";
import { selectToast, toastDismissed } from "@/features/toast/toastSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";

const DISMISS_AFTER_MS = 3500;

export function Toaster() {
  const toast = useAppSelector(selectToast);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => dispatch(toastDismissed()), DISMISS_AFTER_MS);
    return () => clearTimeout(timer);
  }, [toast, dispatch]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-6 z-20 flex justify-center px-4"
    >
      {toast && (
        <button
          key={toast.id}
          type="button"
          onClick={() => dispatch(toastDismissed())}
          className="pointer-events-auto animate-[toast-in_200ms_ease-out] rounded-lg bg-gray-900 px-4 py-2.5 text-sm text-white shadow-lg motion-reduce:animate-none"
        >
          {toast.message}
        </button>
      )}
    </div>
  );
}
