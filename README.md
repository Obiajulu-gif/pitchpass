# ⚽ PitchPass

**Decentralized Fantasy Football + Peer-to-Peer Ticket Marketplace, settled in USDT.**

Built for the **Tether Developers Cup**. PitchPass is one app with two integrated products:

1. **Fantasy Leagues** — Create or join a league, draft a squad within a budget from real fixtures, score points, and the winner automatically takes the USDT prize pool.
2. **Ticket Marketplace** — List spare matchday tickets or buy one. Payment is in USDT and ticket ownership transfers only once the payment confirms.

Wallets are **self-custodial** (your keys stay on your device) via **TronLink**, with a **demo wallet** so anyone can try the full flow instantly. Live football data comes from **Football-Data.org**, and real USDT (TRC-20) balances are read from **TronGrid**.

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
- **Server routes** proxy external APIs so keys never reach the browser
- **localStorage** persistence layer (swappable for a DB / Vercel KV to make state multi-user)

---

## 🔌 APIs used & where to get them

| API | Purpose | Get a key |
|-----|---------|-----------|
| [Football-Data.org](https://www.football-data.org/client/register) | Fixtures & competitions | Free registration |
| [TheSportsDB](https://www.thesportsdb.com/api.php) | Backup sports data | Public test key `123` |
| [TronGrid](https://www.trongrid.io) | USDT (TRC-20) balance reads | Free API key |

All keys live in `.env.local` (git-ignored) and are read **server-side only**.

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

1. Click **Connect Wallet → Demo Wallet** (starts funded with 2,500 USDT).
2. **Fantasy:** create a league (pays the entry fee), open it, draft 5 players within budget, **Save & Score**, then **Settle Pool** to pay the winner.
3. **Tickets:** browse seeded listings, **Buy** one (USDT is debited, ownership transfers), or **List a Ticket** of your own.
4. **Wallet:** watch the balance and activity ledger update across both products.

To use **real** data: add a Football-Data.org key (live fixtures) and connect **TronLink** (real on-chain USDT balance via TronGrid).

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
