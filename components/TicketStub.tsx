"use client";

import type { TicketListing } from "@/lib/types";
import { fmtDate, shortAddr, usdt } from "@/lib/format";

export function TicketStub({
  ticket,
  onBuy,
  busy,
  isOwn,
}: {
  ticket: TicketListing;
  onBuy?: (t: TicketListing) => void;
  busy?: boolean;
  isOwn?: boolean;
}) {
  const sold = ticket.status === "sold";
  return (
    <div className="panel foil relative flex overflow-hidden">
      {/* Left stub */}
      <div className="relative flex w-24 flex-col items-center justify-center border-r-2 border-dashed border-white/15 bg-gradient-to-b from-tether-dark/40 to-midnight-900 p-3">
        <div className="rotate-180 font-display text-[10px] uppercase tracking-[0.3em] text-tether-light [writing-mode:vertical-rl]">
          Matchday Pass
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="label-eyebrow">{ticket.stadium}</div>
            <div className="font-display text-base font-bold text-white">
              {ticket.fixtureLabel}
            </div>
            <div className="mt-0.5 text-xs text-slate-400">
              {fmtDate(ticket.matchDate)}
            </div>
          </div>
          {sold ? (
            <span className="rounded-md bg-white/10 px-2 py-1 text-[10px] font-bold uppercase text-slate-300">
              Sold
            </span>
          ) : (
            <span className="rounded-md bg-tether/20 px-2 py-1 text-[10px] font-bold uppercase text-tether-light">
              Listed
            </span>
          )}
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <Cell label="Section" value={ticket.section} />
          <Cell label="Row" value={ticket.row} />
          <Cell label="Seat" value={ticket.seat} />
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <div className="font-display text-xl font-bold text-gold text-glow-cyan">
              {usdt(ticket.priceUSDT)}
            </div>
            <div className="text-[10px] text-slate-400">
              Seller {ticket.sellerName} · {shortAddr(ticket.sellerAddress)}
            </div>
          </div>
          {!sold &&
            (isOwn ? (
              <span className="stat-chip text-slate-400">Your listing</span>
            ) : (
              <button
                className="btn-primary text-sm"
                onClick={() => onBuy?.(ticket)}
                disabled={busy}
              >
                {busy ? "Processing…" : "Buy · USDT"}
              </button>
            ))}
          {sold && ticket.txHash && (
            <span className="stat-chip font-mono text-[10px] text-slate-400">
              tx {ticket.txHash.slice(0, 8)}…
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="readout text-center">
      <div className="text-[9px] uppercase tracking-widest text-slate-400">
        {label}
      </div>
      <div className="font-display text-sm font-bold text-white">{value}</div>
    </div>
  );
}
