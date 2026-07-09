"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchFixtures } from "@/lib/football";
import type { Fixture } from "@/lib/types";
import { fmtDate } from "@/lib/format";
import { getLeagues, getTickets, subscribe } from "@/lib/storage";
import { useWallet } from "@/components/WalletProvider";

export default function DashboardPage() {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [source, setSource] = useState<"live" | "mock">("mock");
  const [counts, setCounts] = useState({ leagues: 0, pool: 0, tickets: 0 });
  const { connected } = useWallet();

  useEffect(() => {
    fetchFixtures().then(({ fixtures, source }) => {
      setFixtures(fixtures.slice(0, 6));
      setSource(source);
    });
  }, []);

  useEffect(() => {
    const update = () => {
      const leagues = getLeagues();
      const tickets = getTickets().filter((t) => t.status === "listed");
      setCounts({
        leagues: leagues.length,
        pool: leagues.reduce((s, l) => s + l.prizePoolUSDT, 0),
        tickets: tickets.length,
      });
    };
    update();
    return subscribe(update);
  }, []);

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="panel turf-lines relative overflow-hidden p-8 md:p-12">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-tether/20 blur-3xl" />
        <div className="absolute -bottom-20 left-10 h-56 w-56 rounded-full bg-violetglow/20 blur-3xl" />
        <div className="relative max-w-2xl">
          <div className="label-eyebrow text-tether-light">
            Tether Developers Cup
          </div>
          <h1 className="mt-2 font-display text-4xl font-bold leading-tight md:text-5xl">
            Play the pitch.{" "}
            <span className="text-tether-light text-glow-tether">
              Own the pass.
            </span>
          </h1>
          <p className="mt-4 max-w-xl text-slate-300">
            Build fantasy squads from real fixtures, compete for a USDT prize
            pool, and trade matchday tickets peer-to-peer — all settled in USDT,
            all self-custodial.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/fantasy" className="btn-primary">
              ⚽ Enter a League
            </Link>
            <Link href="/marketplace" className="btn-cyan">
              🎟 Browse Tickets
            </Link>
            {!connected && (
              <Link href="/wallet" className="btn-ghost">
                Connect Wallet
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile label="Active Leagues" value={counts.leagues} accent="tether" />
        <StatTile
          label="Prize Pool (USDT)"
          value={counts.pool}
          accent="gold"
        />
        <StatTile
          label="Tickets Listed"
          value={counts.tickets}
          accent="cyan"
        />
      </section>

      {/* Upcoming fixtures */}
      <section className="panel-glass p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">Upcoming Fixtures</h2>
          <span
            className={`stat-chip ${
              source === "live" ? "text-tether-light" : "text-slate-400"
            }`}
          >
            {source === "live" ? "● Live data" : "● Demo data"}
          </span>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {fixtures.map((f) => (
            <div
              key={f.id}
              className="readout flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="font-display font-bold">
                  {f.homeTeam.shortName}
                </span>
                <span className="text-xs text-slate-500">vs</span>
                <span className="font-display font-bold">
                  {f.awayTeam.shortName}
                </span>
              </div>
              <div className="text-right">
                <div className="text-[11px] text-tether-light">
                  {f.competition}
                </div>
                <div className="text-[11px] text-slate-400">
                  {fmtDate(f.utcDate)}
                </div>
              </div>
            </div>
          ))}
          {fixtures.length === 0 && (
            <div className="text-sm text-slate-400">Loading fixtures…</div>
          )}
        </div>
      </section>

      {/* Two products */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FeatureCard
          href="/fantasy"
          emoji="⚽"
          title="Fantasy Leagues"
          desc="Draft a squad within budget, score from real fixtures, and the winner takes the USDT pool automatically."
          cta="Create or join"
        />
        <FeatureCard
          href="/marketplace"
          emoji="🎟"
          title="Ticket Marketplace"
          desc="List a spare ticket or grab one. Payment in USDT; ownership transfers only when the payment confirms."
          cta="Trade tickets"
        />
      </section>
    </div>
  );
}

function StatTile({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: "tether" | "gold" | "cyan";
}) {
  const color =
    accent === "tether"
      ? "text-tether-light"
      : accent === "gold"
      ? "text-gold"
      : "text-cyanglow";
  return (
    <div className="panel p-5">
      <div className="label-eyebrow">{label}</div>
      <div className={`mt-2 font-display text-3xl font-bold ${color}`}>
        {value.toLocaleString()}
      </div>
    </div>
  );
}

function FeatureCard({
  href,
  emoji,
  title,
  desc,
  cta,
}: {
  href: string;
  emoji: string;
  title: string;
  desc: string;
  cta: string;
}) {
  return (
    <Link
      href={href}
      className="panel group relative overflow-hidden p-6 transition-all hover:-translate-y-1 hover:shadow-glow-tether"
    >
      <div className="text-4xl">{emoji}</div>
      <h3 className="mt-3 font-display text-xl font-bold">{title}</h3>
      <p className="mt-2 text-sm text-slate-300">{desc}</p>
      <div className="mt-4 font-semibold text-tether-light">
        {cta} →
      </div>
    </Link>
  );
}
