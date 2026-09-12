"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { selectUser } from "@/features/auth/authSlice";
import { useAppSelector } from "@/lib/hooks";
import { selectHydrated } from "@/lib/persistence";

export function AuthGuard({ children }: { children: ReactNode }) {
  const hydrated = useAppSelector(selectHydrated);
  const user = useAppSelector(selectUser);
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !user) router.replace("/login");
  }, [hydrated, user, router]);

  return user ? children : null;
}
