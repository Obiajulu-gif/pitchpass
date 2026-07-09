// Wallet helpers. Self-custodial via TronLink (the user holds their keys); a
// demo wallet is provided as a fallback so the app is usable without an
// extension. USDT balances are read through our /api/wallet route (TronGrid).

declare global {
  interface Window {
    tronLink?: any;
    tronWeb?: any;
  }
}

export interface ConnectResult {
  address: string;
  provider: "tronlink" | "demo";
}

export async function connectTronLink(): Promise<ConnectResult> {
  if (typeof window === "undefined" || !window.tronLink) {
    throw new Error("TronLink not found");
  }
  const res = await window.tronLink.request({ method: "tron_requestAccounts" });
  // TronLink returns { code: 200 } on success and injects tronWeb
  const address =
    window.tronWeb?.defaultAddress?.base58 || res?.base58 || null;
  if (!address) throw new Error("Could not read TronLink address");
  return { address, provider: "tronlink" };
}

export function connectDemoWallet(): ConnectResult {
  // A deterministic-looking demo address so the UX is complete without an extension.
  let addr = "";
  if (typeof window !== "undefined") {
    addr = localStorage.getItem("pitchpass.demoAddr") || "";
    if (!addr) {
      const rnd = Array.from({ length: 33 }, () =>
        "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789".charAt(
          Math.floor(Math.random() * 57)
        )
      ).join("");
      addr = "T" + rnd;
      localStorage.setItem("pitchpass.demoAddr", addr);
    }
  }
  return { address: addr, provider: "demo" };
}

export async function fetchUsdtBalance(
  address: string,
  provider: "tronlink" | "demo"
): Promise<number> {
  if (provider === "demo") {
    // demo wallet starts funded so the flows are demonstrable
    const key = "pitchpass.demoBalance";
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(key);
      if (stored) return Number(stored);
      localStorage.setItem(key, "2500");
      return 2500;
    }
    return 2500;
  }
  try {
    const res = await fetch(`/api/wallet/balance?address=${address}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(String(res.status));
    const data = await res.json();
    return Number(data.usdt) || 0;
  } catch {
    return 0;
  }
}

// Demo-mode spend/receive so prize payouts and ticket purchases visibly move funds.
export function adjustDemoBalance(delta: number) {
  if (typeof window === "undefined") return;
  const cur = Number(localStorage.getItem("pitchpass.demoBalance") || "0");
  localStorage.setItem("pitchpass.demoBalance", String(Math.max(0, cur + delta)));
}

// Placeholder tx hash for the demo settlement ledger.
export function fakeTxHash(): string {
  return (
    Array.from({ length: 64 }, () =>
      "0123456789abcdef".charAt(Math.floor(Math.random() * 16))
    ).join("")
  );
}
