import type { Player } from "./types";

// Fantasy scoring helpers. In a full build these points come from live match
// events; here we derive a deterministic gameweek score from player form so the
// demo is reproducible.

export function gameweekPoints(player: Player, seed = 0): number {
  const base = player.form * 1.2;
  const variance = ((player.id + seed) % 7) - 3; // -3..+3
  const posBonus = player.position === "FWD" ? 2 : player.position === "MID" ? 1 : 0;
  return Math.max(0, Math.round(base + variance + posBonus));
}

export function rosterPoints(players: Player[], seed = 0): number {
  return players.reduce((sum, p) => sum + gameweekPoints(p, seed), 0);
}

export const SQUAD_SIZE = 5; // simplified: 1 GK, 1 DEF, 2 MID, 1 FWD-ish
export const BUDGET = 40; // fantasy credits

export function validateSquad(players: Player[]): { ok: boolean; reason?: string } {
  if (players.length !== SQUAD_SIZE) {
    return { ok: false, reason: `Pick exactly ${SQUAD_SIZE} players` };
  }
  const spend = players.reduce((s, p) => s + p.price, 0);
  if (spend > BUDGET) {
    return { ok: false, reason: `Over budget: ${spend.toFixed(1)} / ${BUDGET}` };
  }
  if (!players.some((p) => p.position === "GK")) {
    return { ok: false, reason: "Squad needs a goalkeeper" };
  }
  return { ok: true };
}
