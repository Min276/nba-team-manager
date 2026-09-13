import type { Metadata } from "next";
import { Suspense } from "react";
import { TeamList } from "@/features/teams/TeamList";

export const metadata: Metadata = { title: "Teams" };

export default function TeamsPage() {
  return (
    <Suspense fallback={null}>
      <TeamList />
    </Suspense>
  );
}
