import { NextResponse } from "next/server";
import type { Fixture } from "@/lib/types";
import { MOCK_FIXTURES } from "@/lib/mock";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Free-tier friendly competitions on Football-Data.org
const COMPETITIONS = ["PL", "PD", "CL"]; // Premier League, LaLiga, Champions League

interface FDMatch {
  id: number;
  utcDate: string;
  status: string;
  matchday?: number;
  competition?: { name: string };
  homeTeam: { id: number; name: string; shortName?: string; tla?: string; crest?: string };
  awayTeam: { id: number; name: string; shortName?: string; tla?: string; crest?: string };
  score?: { fullTime?: { home: number | null; away: number | null } };
}

function mapMatch(m: FDMatch): Fixture {
  return {
    id: m.id,
    utcDate: m.utcDate,
    status: m.status,
    matchday: m.matchday,
    competition: m.competition?.name,
    homeTeam: {
      id: m.homeTeam.id,
      name: m.homeTeam.name,
      shortName: m.homeTeam.tla || m.homeTeam.shortName || m.homeTeam.name,
      crest: m.homeTeam.crest,
    },
    awayTeam: {
      id: m.awayTeam.id,
      name: m.awayTeam.name,
      shortName: m.awayTeam.tla || m.awayTeam.shortName || m.awayTeam.name,
      crest: m.awayTeam.crest,
    },
    score: {
      home: m.score?.fullTime?.home ?? null,
      away: m.score?.fullTime?.away ?? null,
    },
  };
}

export async function GET() {
  const key = process.env.FOOTBALL_DATA_API_KEY;
  if (!key) {
    return NextResponse.json({ fixtures: MOCK_FIXTURES, source: "mock" });
  }

  try {
    const today = new Date();
    const dateFrom = today.toISOString().slice(0, 10);
    const dateTo = new Date(today.getTime() + 21 * 864e5)
      .toISOString()
      .slice(0, 10);

    const results = await Promise.allSettled(
      COMPETITIONS.map(async (comp) => {
        const url = `https://api.football-data.org/v4/competitions/${comp}/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`;
        const r = await fetch(url, {
          headers: { "X-Auth-Token": key },
          cache: "no-store",
        });
        if (!r.ok) throw new Error(`${comp}:${r.status}`);
        const j = await r.json();
        return (j.matches || []) as FDMatch[];
      })
    );

    const matches: FDMatch[] = results
      .filter((r): r is PromiseFulfilledResult<FDMatch[]> => r.status === "fulfilled")
      .flatMap((r) => r.value);

    if (matches.length === 0) {
      return NextResponse.json({ fixtures: MOCK_FIXTURES, source: "mock" });
    }

    const fixtures = matches
      .map(mapMatch)
      .sort((a, b) => +new Date(a.utcDate) - +new Date(b.utcDate))
      .slice(0, 24);

    return NextResponse.json({ fixtures, source: "live" });
  } catch {
    return NextResponse.json({ fixtures: MOCK_FIXTURES, source: "mock" });
  }
}
