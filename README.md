# ⚽ PitchPass

**Decentralized Fantasy Football + Peer-to-Peer Ticket Marketplace, settled in USDT.**

Built for the **Tether Developers Cup**. PitchPass is one app with two integrated products:

1. **Fantasy Leagues** — Create or join a league, draft a squad within a budget from real fixtures, score points, and the winner automatically takes the USDT prize pool.
2. **Ticket Marketplace** — List spare matchday tickets or buy one. Payment is in USDT and ticket ownership transfers only once the payment confirms.

Wallets are **self-custodial via Tether's [WDK](https://wdk.tether.io) (`@tetherto/wdk`)** — a 12-word key is generated **on the user's device**, stored only in their browser, and **every in-app action is signed with their private key**. A **demo wallet** lets anyone try the full flow with play money. Live football data comes from **Football-Data.org**.

> ### 🏆 Track: **WDK (Wallets)**
> This project uses the **real WDK SDK** running **client-side in the browser** for wallet creation, EVM account derivation, on-chain balance reads, and message/transaction signing. Keys never touch a server. See [`lib/wdkWallet.ts`](./lib/wdkWallet.ts) and the signing calls in the fantasy and marketplace flows.

> **Design:** a "futuristic skeuomorphism" UI — tactile glass/metal panels, embossed press-down buttons, holographic ticket stubs, and trading-card player tiles, in a neon Tether-green palette.

---

## ✨ Features

- Create/join fantasy leagues with USDT entry fees and an auto-growing prize pool
- Budget-constrained squad drafting with position filters and live scoring
- Owner-settled prize payout to the top manager
- List and buy P2P tickets with an atomic-style purchase flow (charge → confirm → transfer)
- Self-custodial wallet (TronLink) + demo wallet, with a USDT activity ledger
- Real fixtures from Football-Data.org, with an automatic **mock-data fallback** so it runs with **zero keys**

---

## 🧱 Tech Stack

- **Next.js 14** (App Router) + **React 18** + **TypeScript**
- **Tailwind CSS** custom skeuomorphic design system
- **WDK** (`@tetherto/wdk`, `@tetherto/wdk-wallet-evm`) — self-custodial wallet, **bundled to run in the browser** (a small `sodium-universal` shim in [`shims/`](./shims) supplies `sodium_memzero` so WDK's EVM signer runs client-side)
- **Server routes** proxy external APIs so keys never reach the browser
- **localStorage** persistence layer (swappable for a DB / Vercel KV to make state multi-user)

## 🔐 How WDK is used (self-custody)

1. **Create** — `WDK.getRandomSeedPhrase()` generates a 12-word BIP39 mnemonic in the browser; it is stored only in `localStorage` and shown once for backup.
2. **Derive** — `new WDK(seed).registerWallet("ethereum", WalletManagerEvm, …)` derives a real EVM account and address.
3. **Read** — `account.getBalance()` reads the on-chain native balance via a public RPC.
4. **Sign** — `account.sign(...)` signs each action (creating a league, buying a ticket) with the user's key, proving self-custody. Keys never leave the device.

---

## 🔌 APIs used & where to get them

| Service | Purpose | Key needed? |
|-----|---------|-----------|
| [WDK](https://wdk.tether.io) (`@tetherto/wdk`) | Self-custodial wallet, signing | **No key** — runs on device |
| [Football-Data.org](https://www.football-data.org/client/register) | Fixtures & competitions | Free registration |
| [TheSportsDB](https://www.thesportsdb.com/api.php) | Backup sports data | Public test key `123` |
| Public EVM RPC (`eth.drpc.org`) | On-chain balance reads via WDK | No key (override with `NEXT_PUBLIC_EVM_RPC`) |

API keys live in `.env.local` (git-ignored) and are read **server-side only**. The WDK wallet needs **no keys and no server** — it is fully self-custodial in the browser.

---

## 🚀 Getting started

```bash
# 1. Install
npm install

# 2. Configure environment
cp .env.example .env.local
# then paste your keys into .env.local

# 3. Run
npm run dev
# open http://localhost:3000
```

**Runs with no keys at all** — it falls back to bundled mock fixtures and the demo wallet, so a judge can `npm install && npm run dev` and use every screen immediately.

### Environment variables

```
FOOTBALL_DATA_API_KEY=   # football-data.org
THESPORTSDB_API_KEY=123  # public test key
TRONGRID_API_KEY=        # trongrid.io
USDT_TRC20_CONTRACT=TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t
```

---

## 🕹️ How to demo

1. Click **Connect Wallet → 🔐 Create WDK Wallet**. A real 12-word key is generated **in your browser**; back it up when prompted. (Or use the **Demo Wallet** for play money.)
2. On the **Wallet** page, hit **Sign a proof message** to see WDK sign with your private key locally.
3. **Fantasy:** create a league — you'll **sign the action with your key** — then open it, draft 5 players within budget, **Save & Score**, and **Settle Pool** to pay the winner.
4. **Tickets:** browse seeded listings and **Buy** one — the purchase is **signed by your WDK key** before ownership transfers — or **List a Ticket** of your own.
5. **Wallet:** watch the in-app USDT ledger and activity update across both products.

To use **real** fixtures: add a Football-Data.org key. The WDK wallet is real out of the box (no key required).

---

## ☁️ Deploy to Vercel

1. Push this repo to GitHub.
2. Import it at [vercel.com/new](https://vercel.com/new).
3. Add the environment variables from `.env.example` in the Vercel project settings.
4. Deploy.

---

## 🗺️ Roadmap / where to take it next

- Replace `localStorage` with **Vercel KV / Postgres** so leagues and listings are shared across users.
- Wire **real USDT transfers** (TronLink `signTransaction`) for entry fees, payouts, and purchases.
- Live gameweek scoring from real match events.
- Optional on-device AI (QVAC) squad recommender.

---

## 📄 License

MIT — see [LICENSE](./LICENSE).
