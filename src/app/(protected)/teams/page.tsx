import type { Metadata } from "next";
import { TeamList } from "@/features/teams/TeamList";

export const metadata: Metadata = { title: "Teams" };

export default function TeamsPage() {
  return <TeamList />;
}
