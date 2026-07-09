"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@/components/WalletProvider";
import {
  getTickets,
  newId,
  subscribe,
  upsertTicket,
} from "@/lib/storage";
import type { TicketListing } from "@/lib/types";
import { TicketStub } from "@/components/TicketStub";
import { fakeTxHash } from "@/lib/wallet";
import { usdt, shortAddr } from "@/lib/format";

export default function MarketplacePage() {
  const { connected, address, usdtBalance, applyDemoDelta, sign } = useWallet();
  const [tickets, setTickets] = useState<TicketListing[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [tab, setTab] = useState<"listed" | "mine" | "sold">("listed");

  // form state
  const [form, setForm] = useState({
    fixtureLabel: "",
    matchDate: "",
    stadium: "",
    section: "",
    row: "",
    seat: "",
    priceUSDT: 100,
  });

  useEffect(() => {
    const update = () => setTickets(getTickets());
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

  function listTicket(e: React.FormEvent) {
    e.preventDefault();
    if (!requireWallet()) return;
    if (!form.fixtureLabel || !form.stadium || !form.seat) {
      setMsg("Fill in the fixture, stadium and seat.");
      return;
    }
    const ticket: TicketListing = {
      id: newId("tkt"),
      fixtureLabel: form.fixtureLabel,
      matchDate: form.matchDate || new Date(Date.now() + 3 * 864e5).toISOString(),
      stadium: form.stadium,
      section: form.section || "GA",
      row: form.row || "—",
      seat: form.seat,
      priceUSDT: Math.max(1, Number(form.priceUSDT)),
      sellerAddress: address!,
      sellerName: shortAddr(address),
      status: "listed",
      createdAt: Date.now(),
    };
    upsertTicket(ticket);
    setShowForm(false);
    setForm({
      fixtureLabel: "",
      matchDate: "",
      stadium: "",
      section: "",
      row: "",
      seat: "",
      priceUSDT: 100,
    });
    setMsg("Ticket listed!");
  }

  async function buyTicket(t: TicketListing) {
    if (!requireWallet()) return;
    if (t.sellerAddress === address) {
      setMsg("That's your own listing.");
      return;
    }
    if (usdtBalance < t.priceUSDT) {
      setMsg(
        `Insufficient balance: need ${usdt(t.priceUSDT)}, have ${usdt(
          usdtBalance
        )}.`
      );
      return;
    }
    setBusyId(t.id);
    try {
      // 1. Authorise the purchase with the user's WDK key (self-custody proof).
      const signature = await sign(
        `PitchPass:buy-ticket:${t.id}:price=${t.priceUSDT}:buyer=${address}`
      );
      // 2. Atomic-style flow: charge, confirm, then transfer ownership.
      await new Promise((r) => setTimeout(r, 700));
      applyDemoDelta(-t.priceUSDT);
      const updated: TicketListing = {
        ...t,
        status: "sold",
        buyerAddress: address!,
        txHash: fakeTxHash(),
      };
      upsertTicket(updated);
      setMsg(
        `Purchased! Ownership transferred. Signed by your key ${signature.slice(
          0,
          14
        )}… · tx ${updated.txHash!.slice(0, 10)}…`
      );
    } catch (e: any) {
      setMsg(`Purchase cancelled: ${e?.message || "signature rejected"}`);
    } finally {
      setBusyId(null);
    }
  }

  const listed = tickets.filter((t) => t.status === "listed");
  const mine = tickets.filter(
    (t) => t.sellerAddress === address || t.buyerAddress === address
  );
  const sold = tickets.filter((t) => t.status === "sold");
  const shown = tab === "listed" ? listed : tab === "mine" ? mine : sold;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Ticket Marketplace</h1>
          <p className="mt-1 text-slate-400">
            Peer-to-peer matchday tickets. Pay in USDT, ownership moves on
            confirmation.
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm((s) => !s)}>
          {showForm ? "Close" : "＋ List a Ticket"}
        </button>
      </header>

      {msg && (
        <div className="panel-glass border-tether/40 p-4 text-sm text-tether-light">
          {msg}
        </div>
      )}

      {showForm && (
        <form onSubmit={listTicket} className="panel grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
          <Field label="Fixture" value={form.fixtureLabel} onChange={(v) => setForm({ ...form, fixtureLabel: v })} placeholder="Arsenal vs Chelsea" />
          <Field label="Stadium" value={form.stadium} onChange={(v) => setForm({ ...form, stadium: v })} placeholder="Emirates Stadium" />
          <Field label="Match date" type="datetime-local" value={form.matchDate} onChange={(v) => setForm({ ...form, matchDate: v })} />
          <Field label="Section" value={form.section} onChange={(v) => setForm({ ...form, section: v })} placeholder="North Bank" />
          <Field label="Row" value={form.row} onChange={(v) => setForm({ ...form, row: v })} placeholder="14" />
          <Field label="Seat" value={form.seat} onChange={(v) => setForm({ ...form, seat: v })} placeholder="102" />
          <Field label="Price (USDT)" type="number" value={String(form.priceUSDT)} onChange={(v) => setForm({ ...form, priceUSDT: Number(v) })} />
          <div className="flex items-end">
            <button className="btn-primary w-full">List for {usdt(form.priceUSDT)}</button>
          </div>
        </form>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        {([
          ["listed", `Listed (${listed.length})`],
          ["mine", `Mine (${mine.length})`],
          ["sold", `Sold (${sold.length})`],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`rounded-lg px-4 py-2 text-sm font-bold ${
              tab === key
                ? "bg-tether-light text-midnight-900 shadow-glow-tether"
                : "bg-white/5 text-slate-300 hover:bg-white/10"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {shown.map((t) => (
          <TicketStub
            key={t.id}
            ticket={t}
            busy={busyId === t.id}
            isOwn={t.sellerAddress === address}
            onBuy={buyTicket}
          />
        ))}
        {shown.length === 0 && (
          <div className="panel col-span-full p-8 text-center text-slate-400">
            Nothing here yet.
          </div>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="label-eyebrow">{label}</label>
      <input
        type={type}
        className="readout mt-1 w-full bg-transparent text-white outline-none [color-scheme:dark]"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
