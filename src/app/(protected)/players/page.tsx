import type { Metadata } from "next";
import { PlayerList } from "@/features/players/PlayerList";

export const metadata: Metadata = { title: "Players" };

export default function PlayersPage() {
  return (
    <>
      <h1 className="mb-6 text-2xl font-semibold">Players</h1>
      <PlayerList />
    </>
  );
}
