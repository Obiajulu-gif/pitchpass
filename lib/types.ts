// Shared domain types for PitchPass

export type Position = "GK" | "DEF" | "MID" | "FWD";

export interface Team {
  id: number;
  name: string;
  shortName: string;
  crest?: string;
}

export interface Player {
  id: number;
  name: string;
  position: Position;
  teamId: number;
  teamName: string;
  price: number; // in fantasy credits (millions)
  points: number; // season fantasy points
  form: number; // 0-10
}

export interface Fixture {
  id: number;
  homeTeam: Team;
  awayTeam: Team;
  utcDate: string;
  status: string;
  matchday?: number;
  competition?: string;
  score?: { home: number | null; away: number | null };
}

export interface League {
  id: string;
  name: string;
  ownerAddress: string;
  entryFeeUSDT: number;
  prizePoolUSDT: number;
  inviteCode: string;
  createdAt: number;
  members: LeagueMember[];
  status: "open" | "locked" | "settled";
  winnerAddress?: string;
}

export interface LeagueMember {
  address: string;
  displayName: string;
  playerIds: number[];
  points: number;
  paid: boolean;
}

export interface TicketListing {
  id: string;
  fixtureLabel: string;
  matchDate: string;
  stadium: string;
  section: string;
  row: string;
  seat: string;
  priceUSDT: number;
  sellerAddress: string;
  sellerName: string;
  status: "listed" | "sold";
  buyerAddress?: string;
  createdAt: number;
  txHash?: string;
}

export interface WalletState {
  connected: boolean;
  address: string | null;
  usdtBalance: number;
  network: string;
  provider: "tronlink" | "demo" | null;
}
