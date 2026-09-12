"use client";

import Link from "next/link";
import { selectUser } from "@/features/auth/authSlice";
import { useAppSelector } from "@/lib/hooks";

const cards = [
  { href: "/players", title: "Players", text: "Browse NBA players and add them to your teams." },
  { href: "/teams", title: "Teams", text: "Create, edit and delete teams and manage rosters." },
] as const;

export default function HomePage() {
  const user = useAppSelector(selectUser);

  return (
    <>
      <h1 className="text-2xl font-semibold">Welcome back, {user?.name}</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {cards.map(({ href, title, text }) => (
          <Link
            key={href}
            href={href}
            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-indigo-300 hover:shadow"
          >
            <h2 className="font-semibold text-gray-900">{title} →</h2>
            <p className="mt-1 text-sm text-gray-600">{text}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
