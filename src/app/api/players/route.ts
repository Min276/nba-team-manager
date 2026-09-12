import { NextResponse, type NextRequest } from "next/server";
import type { Player, PlayersPage } from "@/features/players/types";

const UPSTREAM_URL = "https://api.balldontlie.io/v1/players";
const PAGE_SIZE = 10;
const REVALIDATE_SECONDS = 60 * 60;

interface UpstreamPlayer {
  id: number;
  first_name: string;
  last_name: string;
  position: string | null;
  team: { full_name: string } | null;
}

interface UpstreamResponse {
  data: UpstreamPlayer[];
  meta: { next_cursor?: number };
}

const toPlayer = (player: UpstreamPlayer): Player => ({
  id: player.id,
  firstName: player.first_name,
  lastName: player.last_name,
  position: player.position ?? "",
  nbaTeam: player.team?.full_name ?? "Free agent",
});

const fail = (message: string, status: number) => NextResponse.json({ message }, { status });

export async function GET(request: NextRequest) {
  const apiKey = process.env.BALLDONTLIE_API_KEY;
  if (!apiKey) return fail("Server is missing BALLDONTLIE_API_KEY.", 500);

  const cursor = request.nextUrl.searchParams.get("cursor");
  if (cursor !== null && !/^\d+$/.test(cursor)) return fail("Invalid cursor.", 400);

  const url = new URL(UPSTREAM_URL);
  url.searchParams.set("per_page", String(PAGE_SIZE));
  if (cursor) url.searchParams.set("cursor", cursor);

  let upstream: Response;
  try {
    upstream = await fetch(url, {
      headers: { Authorization: apiKey },
      next: { revalidate: REVALIDATE_SECONDS },
    });
  } catch {
    return fail("Could not reach the players API.", 502);
  }

  if (upstream.status === 429) {
    return fail("The players API is rate limited — please try again in a minute.", 429);
  }
  if (!upstream.ok) return fail(`The players API responded with ${upstream.status}.`, 502);

  const { data, meta }: UpstreamResponse = await upstream.json();
  if (!Array.isArray(data)) return fail("Unexpected response from the players API.", 502);
  const page: PlayersPage = { data: data.map(toPlayer), nextCursor: meta.next_cursor ?? null };
  return NextResponse.json(page);
}
