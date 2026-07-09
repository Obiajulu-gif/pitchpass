// Demo-wallet helpers (play-money USDT ledger) used for the in-app game
// economy. The REAL self-custodial wallet lives in lib/wdkWallet.ts (WDK).
// The in-app USDT ledger lets entry fees, prize pools and ticket purchases be
// demonstrated without funding a live account or paying gas.

const DEMO_ADDR_KEY = "pitchpass.demoAddr";
const DEMO_BAL_KEY = "pitchpass.demoBalance";
const STARTING_BALANCE = 2500;

export interface ConnectResult {
  address: string;
  provider: "demo";
}

export function connectDemoWallet(): ConnectResult {
  let addr = "";
  if (typeof window !== "undefined") {
    addr = localStorage.getItem(DEMO_ADDR_KEY) || "";
    if (!addr) {
      const rnd = Array.from({ length: 39 }, () =>
        "0123456789abcdef".charAt(Math.floor(Math.random() * 16))
      ).join("");
      addr = "0x" + rnd;
      localStorage.setItem(DEMO_ADDR_KEY, addr);
    }
  }
  return { address: addr, provider: "demo" };
}

export function getDemoBalance(): number {
  if (typeof window === "undefined") return STARTING_BALANCE;
  const stored = localStorage.getItem(DEMO_BAL_KEY);
  if (stored === null) {
    localStorage.setItem(DEMO_BAL_KEY, String(STARTING_BALANCE));
    return STARTING_BALANCE;
  }
  return Number(stored);
}

export function adjustDemoBalance(delta: number) {
  if (typeof window === "undefined") return;
  const cur = getDemoBalance();
  localStorage.setItem(DEMO_BAL_KEY, String(Math.max(0, cur + delta)));
}

// Local settlement-ledger tx hash for the in-app economy.
export function fakeTxHash(): string {
  return Array.from({ length: 64 }, () =>
    "0123456789abcdef".charAt(Math.floor(Math.random() * 16))
  ).join("");
}
