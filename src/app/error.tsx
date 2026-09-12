"use client";

import { Button } from "@/components/ui/Button";

export default function ErrorPage({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <div
      role="alert"
      className="mx-auto mt-16 max-w-md rounded-xl border border-red-200 bg-red-50 p-6 text-center"
    >
      <h1 className="font-semibold text-red-800">Something went wrong</h1>
      <p className="mt-1 text-sm text-red-700">
        An unexpected error occurred while rendering this page.
      </p>
      <Button variant="secondary" className="mt-4" onClick={() => retry()}>
        Try again
      </Button>
    </div>
  );
}
