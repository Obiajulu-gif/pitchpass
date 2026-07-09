"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@/components/WalletProvider";
import { getLeagues, getTickets, subscribe } from "@/lib/storage";
import { usdt, shortAddr } from "@/lib/format";
import { forgetWallet, getStoredSeed, WALLET_RPC } from "@/lib/wdkWallet";

export default function WalletPage() {
  const {
    connected,
    address,
    usdtBalance,
    onchainBalance,
    network,
    provider,
    connect,
    disconnect,
    refresh,
    connecting,
    error,
    newSeed,
    clearNewSeed,
    sign,
  } = useWallet();

  const [activity, setActivity] = useState<
    { label: string; amount: number }[]
  >([]);
  const [revealSeed, setRevealSeed] = useState(false);
  const [sigDemo, setSigDemo] = useState<string | null>(null);

  useEffect(() => {
    const update = () => {
      if (!address) return setActivity([]);
      const acts: { label: string; amount: number }[] = [];
      getLeagues().forEach((l) => {
        if (l.members.some((m) => m.address === address))
          acts.push({ label: `Entry · ${l.name}`, amount: -l.entryFeeUSDT });
        if (l.winnerAddress === address)
          acts.push({ label: `Prize · ${l.name}`, amount: l.prizePoolUSDT });
      });
      getTickets().forEach((t) => {
        if (t.buyerAddress === address)
          acts.push({ label: `Bought · ${t.fixtureLabel}`, amount: -t.priceUSDT });
        if (t.sellerAddress === address && t.status === "sold")
          acts.push({ label: `Sold · ${t.fixtureLabel}`, amount: t.priceUSDT });
      });
      setActivity(acts);
    };
    update();
    return subscribe(update);
  }, [address]);

  async function testSign() {
    const sig = await sign(`PitchPass proof-of-key · ${Date.now()}`);
    setSigDemo(sig);
  }

  function wipeKeys() {
    if (
      confirm(
        "This permanently deletes your WDK seed from this device. Make sure you've backed it up. Continue?"
      )
    ) {
      forgetWallet();
      disconnect();
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold">Wallet</h1>

      {/* New-seed backup banner */}
      {newSeed && (
        <div className="panel-glass border-gold/50 space-y-3 p-6">
          <div className="label-eyebrow text-gold">
            ⚠️ Back up your recovery phrase
          </div>
          <p className="text-sm text-slate-300">
            This 12-word phrase is the <strong>only</strong> way to recover your
            wallet. Write it down and keep it private. It is stored only on this
            device — we never see it.
          </p>
          <div className="readout grid grid-cols-2 gap-2 sm:grid-cols-3">
            {newSeed.split(" ").map((w, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500">{i + 1}</span>
                <span className="font-display text-sm text-tether-light">
                  {w}
                </span>
              </div>
            ))}
          </div>
          <button className="btn-gold" onClick={clearNewSeed}>
            I&apos;ve saved it
          </button>
        </div>
      )}

      {!connected ? (
        <div className="panel space-y-4 p-8 text-center">
          <div className="text-5xl">🔐</div>
          <h2 className="font-display text-xl font-bold">
            Create a self-custodial wallet with WDK
          </h2>
          <p className="mx-auto max-w-md text-sm text-slate-400">
            Powered by Tether&apos;s Wallet Development Kit. A 12-word key is
            generated on your device and never leaves it — you hold your own
            keys. Or use the demo wallet to explore with play money.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              className="btn-primary"
              onClick={() => connect("wdk")}
              disabled={connecting}
            >
              {connecting ? "Creating…" : "🔐 Create WDK Wallet"}
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
            <div className="label-eyebrow">
              In-app USDT balance · {network}
            </div>
            <div className="mt-2 font-display text-4xl font-bold text-tether-light text-glow-tether">
              {usdt(usdtBalance)}
            </div>

            {provider === "wdk" && (
              <div className="mt-2 text-sm text-slate-400">
                On-chain (native):{" "}
                <span className="font-display text-cyanglow">
                  {onchainBalance.toFixed(6)} ETH
                </span>
              </div>
            )}

            <div className="readout mt-4 inline-flex items-center gap-2 font-mono text-sm">
              {shortAddr(address)}
              <button
                className="text-tether-light hover:underline"
                onClick={() => navigator.clipboard?.writeText(address || "")}
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
                {provider === "wdk"
                  ? "WDK · self-custodial (EVM)"
                  : "Demo wallet"}
              </span>
            </div>
          </div>

          {/* WDK proof-of-key panel */}
          {provider === "wdk" && (
            <div className="panel space-y-3 p-6">
              <h2 className="font-display text-lg font-bold">
                🔑 Self-custody (WDK)
              </h2>
              <p className="text-sm text-slate-400">
                Your key signs every action in PitchPass. Try it — this signs a
                message locally with your private key. Nothing is sent anywhere.
              </p>
              <div className="flex flex-wrap gap-2">
                <button className="btn-cyan text-sm" onClick={testSign}>
                  Sign a proof message
                </button>
                <button
                  className="btn-ghost text-sm"
                  onClick={() => setRevealSeed((v) => !v)}
                >
                  {revealSeed ? "Hide" : "Reveal"} recovery phrase
                </button>
                <button className="btn-ghost text-sm text-red-300" onClick={wipeKeys}>
                  Wipe keys
                </button>
              </div>
              {sigDemo && (
                <div className="readout break-all font-mono text-xs text-tether-light">
                  {sigDemo}
                </div>
              )}
              {revealSeed && (
                <div className="readout break-words text-sm text-gold">
                  {getStoredSeed()}
                </div>
              )}
              <p className="text-[11px] text-slate-500">
                RPC: {WALLET_RPC}
              </p>
            </div>
          )}

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
        </>
      )}
    </div>
  );
}
