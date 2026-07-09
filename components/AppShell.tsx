"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWallet } from "./WalletProvider";
import { shortAddr, usdt } from "@/lib/format";
import { useState } from "react";

const NAV = [
  { href: "/", label: "Dashboard", icon: "◎" },
  { href: "/fantasy", label: "Fantasy", icon: "⚽" },
  { href: "/marketplace", label: "Tickets", icon: "🎟" },
  { href: "/wallet", label: "Wallet", icon: "💳" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-midnight-900/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-b from-tether-light to-tether-dark shadow-glow-tether">
              <span className="font-display text-lg font-bold text-midnight-900">
                P
              </span>
            </div>
            <div className="leading-tight">
              <div className="font-display text-lg font-bold tracking-wide text-glow-tether">
                PitchPass
              </div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-slate-400">
                Fantasy · Tickets · USDT
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((n) => {
              const active =
                n.href === "/" ? pathname === "/" : pathname.startsWith(n.href);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                    active
                      ? "bg-white/10 text-white shadow-skeu"
                      : "text-slate-300 hover:bg-white/5"
                  }`}
                >
                  <span className="mr-1.5">{n.icon}</span>
                  {n.label}
                </Link>
              );
            })}
          </nav>

          <WalletButton />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>

      {/* Bottom nav (mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-midnight-900/90 backdrop-blur-xl md:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-around px-2 py-2">
          {NAV.map((n) => {
            const active =
              n.href === "/" ? pathname === "/" : pathname.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`flex flex-col items-center gap-0.5 rounded-lg px-3 py-1 text-[11px] ${
                  active ? "text-tether-light" : "text-slate-400"
                }`}
              >
                <span className="text-lg">{n.icon}</span>
                {n.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <footer className="mx-auto max-w-7xl px-4 pb-24 pt-10 text-center text-xs text-slate-500 md:pb-10">
        PitchPass · Built for the Tether Developers Cup · Settled in USDT ·
        Self-custodial
      </footer>
    </div>
  );
}

function WalletButton() {
  const { connected, address, usdtBalance, connect, disconnect, connecting } =
    useWallet();
  const [open, setOpen] = useState(false);

  if (!connected) {
    return (
      <div className="relative">
        <button
          className="btn-primary text-sm"
          onClick={() => setOpen((o) => !o)}
          disabled={connecting}
        >
          {connecting ? "Connecting…" : "Connect Wallet"}
        </button>
        {open && (
          <div className="panel-glass absolute right-0 mt-2 w-64 p-2">
            <button
              className="btn-primary w-full text-sm"
              onClick={() => {
                connect("wdk");
                setOpen(false);
              }}
            >
              🔐 Create WDK Wallet
            </button>
            <button
              className="btn-ghost mt-2 w-full text-sm"
              onClick={() => {
                connect("demo");
                setOpen(false);
              }}
            >
              Demo Wallet (play money)
            </button>
            <p className="mt-2 px-1 text-[10px] text-slate-400">
              WDK generates a 12-word key on your device. Self-custodial — keys
              never leave your machine.
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="readout hidden text-right sm:block">
        <div className="text-[10px] uppercase tracking-widest text-slate-400">
          Balance
        </div>
        <div className="font-display text-sm font-bold text-tether-light">
          {usdt(usdtBalance)}
        </div>
      </div>
      <button
        className="btn-ghost text-sm"
        onClick={disconnect}
        title="Click to disconnect"
      >
        <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-tether-light shadow-glow-tether" />
        {shortAddr(address)}
      </button>
    </div>
  );
}
