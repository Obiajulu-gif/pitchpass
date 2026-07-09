"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@/components/WalletProvider";
import { getLeagues, getTickets, subscribe } from "@/lib/storage";
import { usdt, shortAddr } from "@/lib/format";

export default function WalletPage() {
  const {
    connected,
    address,
    usdtBalance,
    network,
    provider,
    connect,
    disconnect,
    refresh,
    connecting,
    error,
  } = useWallet();

  const [activity, setActivity] = useState<
    { label: string; amount: number; kind: string }[]
  >([]);

  useEffect(() => {
    const update = () => {
      if (!address) return setActivity([]);
      const acts: { label: string; amount: number; kind: string }[] = [];
      getLeagues().forEach((l) => {
        if (l.members.some((m) => m.address === address)) {
          acts.push({
            label: `Entry · ${l.name}`,
            amount: -l.entryFeeUSDT,
            kind: "league",
          });
        }
        if (l.winnerAddress === address) {
          acts.push({
            label: `Prize · ${l.name}`,
            amount: l.prizePoolUSDT,
            kind: "prize",
          });
        }
      });
      getTickets().forEach((t) => {
        if (t.buyerAddress === address)
          acts.push({
            label: `Bought · ${t.fixtureLabel}`,
            amount: -t.priceUSDT,
            kind: "ticket",
          });
        if (t.sellerAddress === address && t.status === "sold")
          acts.push({
            label: `Sold · ${t.fixtureLabel}`,
            amount: t.priceUSDT,
            kind: "ticket",
          });
      });
      setActivity(acts);
    };
    update();
    return subscribe(update);
  }, [address]);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold">Wallet</h1>

      {!connected ? (
        <div className="panel space-y-4 p-8 text-center">
          <div className="text-5xl">💳</div>
          <h2 className="font-display text-xl font-bold">
            Connect a self-custodial wallet
          </h2>
          <p className="mx-auto max-w-md text-sm text-slate-400">
            Your keys stay on your device. Use TronLink for a real USDT (TRC-20)
            balance, or the demo wallet to explore the app instantly.
          </p>
          <div className="flex justify-center gap-3">
            <button
              className="btn-primary"
              onClick={() => connect("tronlink")}
              disabled={connecting}
            >
              Connect TronLink
            </button>
            <button
              className="btn-ghost"
              onClick={() => connect("demo")}
              disabled={connecting}
            >
              Use Demo Wallet
            </button>
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
        </div>
      ) : (
        <>
          {/* Wallet device */}
          <div className="panel bg-metal relative overflow-hidden p-6">
            <div className="absolute right-6 top-6 h-10 w-14 rounded-md bg-gradient-to-br from-gold to-amber-700 shadow-skeu" />
            <div className="label-eyebrow">USDT Balance · {network}</div>
            <div className="mt-2 font-display text-4xl font-bold text-tether-light text-glow-tether">
              {usdt(usdtBalance)}
            </div>
            <div className="mt-6 readout inline-flex items-center gap-2 font-mono text-sm">
              {shortAddr(address)}
              <button
                className="text-tether-light hover:underline"
                onClick={() => {
                  navigator.clipboard?.writeText(address || "");
                }}
              >
                copy
              </button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button className="btn-ghost text-sm" onClick={refresh}>
                ↻ Refresh
              </button>
              <button className="btn-ghost text-sm" onClick={disconnect}>
                Disconnect
              </button>
              <span className="stat-chip self-center text-[11px] text-slate-400">
                {provider === "demo" ? "Demo wallet" : "TronLink · TRC-20"}
              </span>
            </div>
          </div>

          {/* Activity ledger */}
          <div className="panel p-6">
            <h2 className="font-display text-lg font-bold">Activity</h2>
            <div className="mt-3 space-y-2">
              {activity.length === 0 && (
                <div className="text-sm text-slate-400">
                  No activity yet. Join a league or buy a ticket.
                </div>
              )}
              {activity.map((a, i) => (
                <div
                  key={i}
                  className="readout flex items-center justify-between"
                >
                  <span className="text-sm">{a.label}</span>
                  <span
                    className={`font-display font-bold ${
                      a.amount >= 0 ? "text-tether-light" : "text-red-400"
                    }`}
                  >
                    {a.amount >= 0 ? "+" : ""}
                    {usdt(a.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {provider === "demo" && (
            <p className="text-center text-xs text-slate-500">
              Demo balances are stored locally for testing. Connect TronLink to
              read a real on-chain USDT balance via TronGrid.
            </p>
          )}
        </>
      )}
    </div>
  );
}
