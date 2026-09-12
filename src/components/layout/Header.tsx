"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { loggedOut, selectUser } from "@/features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";

const links = [
  { href: "/players", label: "Players" },
  { href: "/teams", label: "Teams" },
] as const;

export function Header() {
  const user = useAppSelector(selectUser);
  const dispatch = useAppDispatch();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex min-h-14 max-w-4xl flex-wrap items-center gap-x-6 gap-y-1 px-4 py-2">
        <Link
          href="/"
          className="shrink-0 font-semibold tracking-tight whitespace-nowrap text-gray-900"
        >
          🏀 NBA Team Manager
        </Link>
        {user && (
          <>
            <nav aria-label="Main" className="flex gap-1">
              {links.map(({ href, label }) => {
                const active = pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                      active ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>
            <div className="ml-auto flex items-center gap-3">
              <span className="text-sm whitespace-nowrap text-gray-600">
                Hi, <span className="font-medium text-gray-900">{user.name}</span>
              </span>
              <Button variant="secondary" size="sm" onClick={() => dispatch(loggedOut())}>
                Log out
              </Button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
