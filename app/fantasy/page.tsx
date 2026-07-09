"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useWallet } from "@/components/WalletProvider";
import {
  getLeagues,
  inviteCode,
  newId,
  subscribe,
  upsertLeague,
} from "@/lib/storage";
import type { League } from "@/lib/types";
import { usdt, shortAddr } from "@/lib/format";

export default function FantasyPage() {
  const { connected, address, applyDemoDelta } = useWallet();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [name, setName] = useState("");
  const [fee, setFee] = useState(50);
  const [joinCode, setJoinCode] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const update = () => setLeagues(getLeagues());
    update();
    return subscribe(update);
  }, []);

  function requireWallet(): boolean {
    if (!connected || !address) {
      setMsg("Connect your wallet first (top-right).");
      return false;
    }
    return true;
  }

  function createLeague(e: React.FormEvent) {
    e.preventDefault();
    if (!requireWallet()) return;
    if (!name.trim()) {
      setMsg("Give your league a name.");
      return;
    }
    const league: League = {
      id: newId("lg"),
      name: name.trim(),
      ownerAddress: address!,
      entryFeeUSDT: fee,
      prizePoolUSDT: fee, // owner's own entry seeds the pool
      inviteCode: inviteCode(),
      createdAt: Date.now(),
      status: "open",
      members: [
        {
          address: address!,
          displayName: shortAddr(address),
          playerIds: [],
          points: 0,
          paid: true,
        },
      ],
    };
    applyDemoDelta(-fee); // pay entry (demo)
    upsertLeague(league);
    setName("");
    setMsg(`League created. Invite code: ${league.inviteCode}`);
  }

  function joinLeague(e: React.FormEvent) {
    e.preventDefault();
    if (!requireWallet()) return;
    const code = joinCode.trim().toUpperCase();
    const league = getLeagues().find((l) => l.inviteCode === code);
    if (!league) {
      setMsg("No league with that code.");
      return;
    }
    if (league.members.some((m) => m.address === address)) {
      setMsg("You're already in that league.");
      return;
    }
    if (league.status !== "open") {
      setMsg("That league is locked.");
      return;
    }
    league.members.push({
      address: address!,
      displayName: shortAddr(address),
      playerIds: [],
      points: 0,
      paid: true,
    });
    league.prizePoolUSDT += league.entryFeeUSDT;
    applyDemoDelta(-league.entryFeeUSDT);
    upsertLeague(league);
    setJoinCode("");
    setMsg(`Joined ${league.name}!`);
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl font-bold">Fantasy Leagues</h1>
        <p className="mt-1 text-slate-400">
          Draft a squad, score from real fixtures, winner takes the USDT pool.
        </p>
      </header>

      {msg && (
        <div className="panel-glass border-tether/40 p-4 text-sm text-tether-light">
          {msg}
        </div>
      )}

      {/* Create + Join */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <form onSubmit={createLeague} className="panel space-y-4 p-6">
          <h2 className="font-display text-lg font-bold">Create a League</h2>
          <div>
            <label className="label-eyebrow">League name</label>
            <input
              className="readout mt-1 w-full bg-transparent text-white outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Champions of the Group Stage"
            />
          </div>
          <div>
            <label className="label-eyebrow">Entry fee (USDT)</label>
            <input
              type="number"
              min={1}
              className="readout mt-1 w-full bg-transparent text-white outline-none"
              value={fee}
              onChange={(e) => setFee(Math.max(1, Number(e.target.value)))}
            />
          </div>
          <button className="btn-primary w-full">Create · Pay {usdt(fee)}</button>
        </form>

        <form onSubmit={joinLeague} className="panel space-y-4 p-6">
          <h2 className="font-display text-lg font-bold">Join with a Code</h2>
          <div>
            <label className="label-eyebrow">Invite code</label>
            <input
              className="readout mt-1 w-full bg-transparent font-display uppercase tracking-widest text-white outline-none"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              placeholder="AB12CD"
              maxLength={6}
            />
          </div>
          <button className="btn-cyan w-full">Join League</button>
          <p className="text-xs text-slate-400">
            Ask a friend for their league&apos;s invite code, then draft your
            squad.
          </p>
        </form>
      </div>

      {/* League list */}
      <section>
        <h2 className="mb-3 font-display text-xl font-bold">Your Leagues</h2>
        {leagues.length === 0 ? (
          <div className="panel p-8 text-center text-slate-400">
            No leagues yet. Create one above to get started.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {leagues.map((l) => (
              <Link
                key={l.id}
                href={`/fantasy/${l.id}`}
                className="panel group flex items-center justify-between p-5 transition-all hover:-translate-y-0.5 hover:shadow-glow-tether"
              >
                <div>
                  <div className="font-display text-lg font-bold">{l.name}</div>
                  <div className="mt-1 text-xs text-slate-400">
                    {l.members.length} manager
                    {l.members.length === 1 ? "" : "s"} · Code{" "}
                    <span className="font-display text-tether-light">
                      {l.inviteCode}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-display text-xl font-bold text-gold">
                    {usdt(l.prizePoolUSDT)}
                  </div>
                  <div className="text-[11px] uppercase tracking-widest text-slate-400">
                    {l.status}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
