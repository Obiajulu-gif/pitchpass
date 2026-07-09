import type { Fixture, Player } from "./types";
import { MOCK_PLAYERS } from "./mock";

// Client-side helpers that call our own API routes (which hold the secret key
// server-side). Everything degrades gracefully to mock data.

export async function fetchFixtures(): Promise<{
  fixtures: Fixture[];
  source: "live" | "mock";
}> {
  try {
    const res = await fetch("/api/football/fixtures", { cache: "no-store" });
    if (!res.ok) throw new Error(String(res.status));
    const data = await res.json();
    return { fixtures: data.fixtures as Fixture[], source: data.source };
  } catch {
    const { MOCK_FIXTURES } = await import("./mock");
    return { fixtures: MOCK_FIXTURES, source: "mock" };
  }
}

// Player pool is served from mock data (a free player-valuation feed is out of
// scope). Structured so a real provider can replace this later.
export function getPlayerPool(): Player[] {
  return MOCK_PLAYERS;
}

export function playersByIds(ids: number[]): Player[] {
  const map = new Map(MOCK_PLAYERS.map((p) => [p.id, p]));
  return ids.map((id) => map.get(id)).filter(Boolean) as Player[];
}
