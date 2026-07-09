"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useWallet } from "@/components/WalletProvider";
import { getLeague, subscribe, upsertLeague } from "@/lib/storage";
import { getPlayerPool, playersByIds } from "@/lib/football";
import { BUDGET, SQUAD_SIZE, rosterPoints, validateSquad } from "@/lib/scoring";
import { PlayerCard } from "@/components/PlayerCard";
import type { League, Player } from "@/lib/types";
import { usdt, shortAddr } from "@/lib/format";
import { fakeTxHash } from "@/lib/wallet";

export default function LeagueDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { address, applyDemoDelta } = useWallet();
  const [league, setLeague] = useState<League | undefined>();
  const [picks, setPicks] = useState<number[]>([]);
  const [posFilter, setPosFilter] = useState<string>("ALL");
  const [msg, setMsg] = useState<string | null>(null);

  const pool = useMemo(() => getPlayerPool(), []);

  useEffect(() => {
    const update = () => setLeague(getLeague(id));
    update();
    return subscribe(update);
  }, [id]);

  const me = league?.members.find((m) => m.address === address);
  useEffect(() => {
    if (me) setPicks(me.playerIds);
  }, [me?.address, league?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!league) {
    return (
      <div className="panel p-8 text-center text-slate-400">
        League not found.{" "}
        <Link href="/fantasy" className="text-tether-light">
          Back to leagues
        </Link>
      </div>
    );
  }

  const selectedPlayers = playersByIds(picks);
  const spend = selectedPlayers.reduce((s, p) => s + p.price, 0);
  const filtered =
    posFilter === "ALL" ? pool : pool.filter((p) => p.position === posFilter);

  function togglePick(p: Player) {
    setPicks((prev) =>
      prev.includes(p.id)
        ? prev.filter((x) => x !== p.id)
        : prev.length >= SQUAD_SIZE
        ? prev
        : [...prev, p.id]
    );
  }

  function saveSquad() {
    if (!me) {
      setMsg("Join this league first.");
      return;
    }
    const check = validateSquad(playersByIds(picks));
    if (!check.ok) {
      setMsg(check.reason!);
      return;
    }
    me.playerIds = picks;
    me.points = rosterPoints(playersByIds(picks));
    upsertLeague({ ...league! });
    setMsg("Squad saved and scored!");
  }

  function settle() {
    if (!league) return;
    if (league.ownerAddress !== address) {
      setMsg("Only the league owner can settle the pool.");
      return;
    }
    const scored = league.members.map((m) => ({
      ...m,
      points: m.playerIds.length ? rosterPoints(playersByIds(m.playerIds)) : 0,
    }));
    const winner = [...scored].sort((a, b) => b.points - a.points)[0];
    if (!winner || winner.points === 0) {
      setMsg("No squads scored yet — managers must save a squad first.");
      return;
    }
    league.members = scored;
    league.status = "settled";
    league.winnerAddress = winner.address;
    upsertLeague({ ...league });
    // pay the winner (demo credits the current user if they won)
    if (winner.address === address) applyDemoDelta(league.prizePoolUSDT);
    setMsg(
      `Settled! ${shortAddr(winner.address)} wins ${usdt(
        league.prizePoolUSDT
      )} · tx ${fakeTxHash().slice(0, 10)}…`
    );
  }

  const standings = [...league.members].sort((a, b) => b.points - a.points);
  const isOwner = league.ownerAddress === address;

  return (
    <div className="space-y-6">
      <Link href="/fantasy" className="text-sm text-slate-400 hover:text-white">
        ← All leagues
      </Link>

      {/* Header */}
      <div className="panel turf-lines flex flex-wrap items-center justify-between gap-4 p-6">
        <div>
          <h1 className="font-display text-2xl font-bold">{league.name}</h1>
          <div className="mt-1 text-sm text-slate-400">
            Invite code{" "}
            <span className="font-display text-tether-light">
              {league.inviteCode}
            </span>{" "}
            · {league.members.length} managers · Entry{" "}
            {usdt(league.entryFeeUSDT)}
          </div>
        </div>
        <div className="text-right">
          <div className="label-eyebrow">Prize Pool</div>
          <div className="font-display text-3xl font-bold text-gold text-glow-cyan">
            {usdt(league.prizePoolUSDT)}
          </div>
          <div className="mt-1 text-[11px] uppercase tracking-widest text-slate-400">
            {league.status}
          </div>
        </div>
      </div>

      {msg && (
        <div className="panel-glass border-tether/40 p-4 text-sm text-tether-light">
          {msg}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Draft */}
        <div className="lg:col-span-2 space-y-4">
          <div className="panel p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-lg font-bold">Draft your XI</h2>
              <div className="flex items-center gap-3">
                <div className="readout">
                  <span className="text-[10px] text-slate-400">BUDGET</span>{" "}
                  <span
                    className={`font-display font-bold ${
                      spend > BUDGET ? "text-red-400" : "text-tether-light"
                    }`}
                  >
                    {spend.toFixed(1)}/{BUDGET}
                  </span>
                </div>
                <div className="readout">
                  <span className="text-[10px] text-slate-400">PICKS</span>{" "}
                  <span className="font-display font-bold text-cyanglow">
                    {picks.length}/{SQUAD_SIZE}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              {["ALL", "GK", "DEF", "MID", "FWD"].map((p) => (
                <button
                  key={p}
                  onClick={() => setPosFilter(p)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                    posFilter === p
                      ? "bg-tether-light text-midnight-900 shadow-glow-tether"
                      : "bg-white/5 text-slate-300 hover:bg-white/10"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {filtered.map((p) => (
                <PlayerCard
                  key={p.id}
                  player={p}
                  selected={picks.includes(p.id)}
                  disabled={picks.length >= SQUAD_SIZE}
                  onToggle={togglePick}
                />
              ))}
            </div>

            <button
              className="btn-primary mt-5 w-full"
              onClick={saveSquad}
              disabled={league.status !== "open"}
            >
              {league.status === "open" ? "Save & Score Squad" : "League locked"}
            </button>
          </div>
        </div>

        {/* Standings + settle */}
        <div className="space-y-4">
          <div className="panel p-5">
            <h2 className="font-display text-lg font-bold">Standings</h2>
            <div className="mt-3 space-y-2">
              {standings.map((m, i) => (
                <div
                  key={m.address}
                  className={`readout flex items-center justify-between ${
                    m.address === league.winnerAddress
                      ? "ring-1 ring-gold"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`grid h-6 w-6 place-items-center rounded-full text-xs font-bold ${
                        i === 0
                          ? "bg-gold text-midnight-900"
                          : "bg-white/10 text-slate-300"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span className="text-sm">
                      {m.address === address ? "You" : m.displayName}
                    </span>
                  </div>
                  <span className="font-display font-bold text-cyanglow">
                    {m.points} pts
                  </span>
                </div>
              ))}
            </div>
          </div>

          {isOwner && league.status === "open" && (
            <button className="btn-gold w-full" onClick={settle}>
              🏆 Settle Pool to Winner
            </button>
          )}
          {league.status === "settled" && league.winnerAddress && (
            <div className="panel-glass border-gold/40 p-4 text-center">
              <div className="label-eyebrow text-gold">Champion</div>
              <div className="mt-1 font-display text-lg font-bold">
                {league.winnerAddress === address
                  ? "You 🏆"
                  : shortAddr(league.winnerAddress)}
              </div>
              <div className="text-sm text-gold">
                won {usdt(league.prizePoolUSDT)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
