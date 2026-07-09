import type { League, TicketListing } from "./types";
import { MOCK_TICKETS } from "./mock";

// Local-first persistence via localStorage. This keeps the app fully usable
// with zero backend. Swap these functions for a DB/API layer (e.g. Vercel KV)
// to make state shared across users.

const LEAGUES_KEY = "pitchpass.leagues.v1";
const TICKETS_KEY = "pitchpass.tickets.v1";

type Listener = () => void;
const listeners = new Set<Listener>();

export function subscribe(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
function emit() {
  listeners.forEach((l) => l());
}

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
  emit();
}

// ---------- Leagues ----------
export function getLeagues(): League[] {
  return read<League[]>(LEAGUES_KEY, []);
}
export function saveLeagues(leagues: League[]) {
  write(LEAGUES_KEY, leagues);
}
export function getLeague(id: string): League | undefined {
  return getLeagues().find((l) => l.id === id);
}
export function upsertLeague(league: League) {
  const all = getLeagues();
  const idx = all.findIndex((l) => l.id === league.id);
  if (idx >= 0) all[idx] = league;
  else all.unshift(league);
  saveLeagues(all);
}

// ---------- Tickets ----------
export function getTickets(): TicketListing[] {
  const stored = read<TicketListing[] | null>(TICKETS_KEY, null);
  if (stored === null) {
    // seed first run
    write(TICKETS_KEY, MOCK_TICKETS);
    return MOCK_TICKETS;
  }
  return stored;
}
export function saveTickets(tickets: TicketListing[]) {
  write(TICKETS_KEY, tickets);
}
export function upsertTicket(ticket: TicketListing) {
  const all = getTickets();
  const idx = all.findIndex((t) => t.id === ticket.id);
  if (idx >= 0) all[idx] = ticket;
  else all.unshift(ticket);
  saveTickets(all);
}

export function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}

export function inviteCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}
