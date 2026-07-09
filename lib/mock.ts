import type { Fixture, Player, Team, TicketListing } from "./types";

// Mock data so the whole app runs offline (no API keys, no rate limits).
// This is the safety net for demos and for judges running the repo cold.

export const MOCK_TEAMS: Team[] = [
  { id: 1, name: "Arsenal FC", shortName: "ARS" },
  { id: 2, name: "Manchester City", shortName: "MCI" },
  { id: 3, name: "Liverpool FC", shortName: "LIV" },
  { id: 4, name: "Real Madrid", shortName: "RMA" },
  { id: 5, name: "FC Barcelona", shortName: "BAR" },
  { id: 6, name: "Bayern München", shortName: "BAY" },
  { id: 7, name: "Paris Saint-Germain", shortName: "PSG" },
  { id: 8, name: "Inter Milan", shortName: "INT" },
];

const NAMES: Record<string, string[]> = {
  GK: ["A. Ramsdale", "Ederson", "Alisson", "T. Courtois", "M. ter Stegen", "M. Neuer", "G. Donnarumma", "Y. Sommer"],
  DEF: ["W. Saliba", "R. Dias", "V. van Dijk", "A. Rüdiger", "R. Araújo", "D. Upamecano", "Marquinhos", "A. Bastoni"],
  MID: ["M. Ødegaard", "K. De Bruyne", "D. Szoboszlai", "J. Bellingham", "Pedri", "J. Kimmich", "Vitinha", "N. Barella"],
  FWD: ["B. Saka", "E. Haaland", "M. Salah", "K. Mbappé", "R. Lewandowski", "H. Kane", "O. Dembélé", "L. Martínez"],
};

function buildPlayers(): Player[] {
  const players: Player[] = [];
  let id = 100;
  const positions: { pos: "GK" | "DEF" | "MID" | "FWD"; base: number }[] = [
    { pos: "GK", base: 4.5 },
    { pos: "DEF", base: 5.5 },
    { pos: "MID", base: 7.5 },
    { pos: "FWD", base: 9.0 },
  ];
  MOCK_TEAMS.forEach((team, ti) => {
    positions.forEach(({ pos, base }) => {
      const name = NAMES[pos][ti];
      const price = +(base + (ti % 3) * 0.6).toFixed(1);
      const points = 40 + ((ti * 7 + base * 3) % 120);
      players.push({
        id: id++,
        name,
        position: pos,
        teamId: team.id,
        teamName: team.shortName,
        price,
        points: Math.round(points),
        form: +(5 + ((ti + base) % 5)).toFixed(1),
      });
    });
  });
  return players;
}

export const MOCK_PLAYERS: Player[] = buildPlayers();

export const MOCK_FIXTURES: Fixture[] = [
  {
    id: 9001,
    homeTeam: MOCK_TEAMS[0],
    awayTeam: MOCK_TEAMS[2],
    utcDate: new Date(Date.now() + 2 * 864e5).toISOString(),
    status: "SCHEDULED",
    competition: "Premier League",
    matchday: 5,
    score: { home: null, away: null },
  },
  {
    id: 9002,
    homeTeam: MOCK_TEAMS[3],
    awayTeam: MOCK_TEAMS[4],
    utcDate: new Date(Date.now() + 3 * 864e5).toISOString(),
    status: "SCHEDULED",
    competition: "LaLiga",
    matchday: 5,
    score: { home: null, away: null },
  },
  {
    id: 9003,
    homeTeam: MOCK_TEAMS[1],
    awayTeam: MOCK_TEAMS[5],
    utcDate: new Date(Date.now() + 5 * 864e5).toISOString(),
    status: "SCHEDULED",
    competition: "Champions League",
    matchday: 1,
    score: { home: null, away: null },
  },
  {
    id: 9004,
    homeTeam: MOCK_TEAMS[6],
    awayTeam: MOCK_TEAMS[7],
    utcDate: new Date(Date.now() + 6 * 864e5).toISOString(),
    status: "SCHEDULED",
    competition: "Champions League",
    matchday: 1,
    score: { home: null, away: null },
  },
];

export const MOCK_TICKETS: TicketListing[] = [
  {
    id: "tkt-seed-1",
    fixtureLabel: "Arsenal vs Liverpool",
    matchDate: new Date(Date.now() + 2 * 864e5).toISOString(),
    stadium: "Emirates Stadium",
    section: "Clock End",
    row: "12",
    seat: "88",
    priceUSDT: 120,
    sellerAddress: "TDemoSeller1111111111111111111111",
    sellerName: "GunnerFan",
    status: "listed",
    createdAt: Date.now() - 36e5,
  },
  {
    id: "tkt-seed-2",
    fixtureLabel: "Real Madrid vs Barcelona",
    matchDate: new Date(Date.now() + 3 * 864e5).toISOString(),
    stadium: "Santiago Bernabéu",
    section: "Lateral Este",
    row: "4",
    seat: "17",
    priceUSDT: 340,
    sellerAddress: "TDemoSeller2222222222222222222222",
    sellerName: "Madridista",
    status: "listed",
    createdAt: Date.now() - 72e5,
  },
  {
    id: "tkt-seed-3",
    fixtureLabel: "Man City vs Bayern",
    matchDate: new Date(Date.now() + 5 * 864e5).toISOString(),
    stadium: "Etihad Stadium",
    section: "South Stand",
    row: "22",
    seat: "5",
    priceUSDT: 210,
    sellerAddress: "TDemoSeller3333333333333333333333",
    sellerName: "CityBlue",
    status: "listed",
    createdAt: Date.now() - 12e5,
  },
];
