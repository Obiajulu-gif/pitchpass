"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  adjustDemoBalance,
  connectDemoWallet,
  getDemoBalance,
} from "@/lib/wallet";
import {
  forgetWallet,
  getOnchainBalance,
  hasStoredWallet,
  initWallet,
  signAction,
} from "@/lib/wdkWallet";

type Provider = "wdk" | "demo" | null;

interface WalletState {
  connected: boolean;
  address: string | null;
  usdtBalance: number; // in-app game ledger (USDT)
  onchainBalance: number; // real on-chain native balance (WDK)
  network: string;
  provider: Provider;
}

interface WalletContextValue extends WalletState {
  connecting: boolean;
  error: string | null;
  /** Seed shown once, right after a new WDK wallet is created (for backup). */
  newSeed: string | null;
  clearNewSeed: () => void;
  connect: (mode: "wdk" | "demo") => Promise<void>;
  disconnect: () => void;
  refresh: () => Promise<void>;
  applyDemoDelta: (delta: number) => void;
  /** Sign an in-app action with the user's WDK key (proves self-custody). */
  sign: (message: string) => Promise<string>;
}

const WalletContext = createContext<WalletContextValue | null>(null);
const STORAGE_KEY = "pitchpass.wallet";

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<WalletState>({
    connected: false,
    address: null,
    usdtBalance: 0,
    onchainBalance: 0,
    network: "Ethereum",
    provider: null,
  });
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newSeed, setNewSeed] = useState<string | null>(null);

  const connect = useCallback(async (mode: "wdk" | "demo") => {
    setConnecting(true);
    setError(null);
    try {
      if (mode === "demo") {
        const res = connectDemoWallet();
        setState({
          connected: true,
          address: res.address,
          usdtBalance: getDemoBalance(),
          onchainBalance: 0,
          network: "Demo",
          provider: "demo",
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ provider: "demo" }));
      } else {
        // Real WDK self-custodial wallet (seed stays on device).
        const { address, seedPhrase, isNew } = await initWallet();
        if (isNew) setNewSeed(seedPhrase);
        const onchain = await getOnchainBalance();
        setState({
          connected: true,
          address,
          usdtBalance: getDemoBalance(),
          onchainBalance: onchain,
          network: "Ethereum (WDK)",
          provider: "wdk",
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ provider: "wdk" }));
      }
    } catch (e: any) {
      setError(e?.message || "Failed to connect wallet");
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    // note: we keep the WDK seed in storage so the user can reconnect; use
    // "forget" on the wallet page to wipe keys.
    setState({
      connected: false,
      address: null,
      usdtBalance: 0,
      onchainBalance: 0,
      network: "Ethereum",
      provider: null,
    });
  }, []);

  const refresh = useCallback(async () => {
    setState((s) => ({ ...s, usdtBalance: getDemoBalance() }));
    if (state.provider === "wdk") {
      const onchain = await getOnchainBalance();
      setState((s) => ({ ...s, onchainBalance: onchain }));
    }
  }, [state.provider]);

  const applyDemoDelta = useCallback((delta: number) => {
    adjustDemoBalance(delta);
    setState((s) => ({ ...s, usdtBalance: Math.max(0, s.usdtBalance + delta) }));
  }, []);

  const sign = useCallback(
    async (message: string) => {
      if (state.provider === "wdk") {
        return signAction(message);
      }
      // demo fallback: a deterministic-looking pseudo signature
      return "0xdemo" + btoa(message).slice(0, 60);
    },
    [state.provider]
  );

  const clearNewSeed = useCallback(() => setNewSeed(null), []);

  // reconnect on refresh
  useEffect(() => {
    (async () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const { provider } = JSON.parse(raw) as { provider: Provider };
        if (provider === "demo") {
          const res = connectDemoWallet();
          setState({
            connected: true,
            address: res.address,
            usdtBalance: getDemoBalance(),
            onchainBalance: 0,
            network: "Demo",
            provider: "demo",
          });
        } else if (provider === "wdk" && hasStoredWallet()) {
          const { address } = await initWallet();
          const onchain = await getOnchainBalance();
          setState({
            connected: true,
            address,
            usdtBalance: getDemoBalance(),
            onchainBalance: onchain,
            network: "Ethereum (WDK)",
            provider: "wdk",
          });
        }
      } catch {
        /* ignore */
      }
    })();
  }, []);

  const value = useMemo<WalletContextValue>(
    () => ({
      ...state,
      connecting,
      error,
      newSeed,
      clearNewSeed,
      connect,
      disconnect,
      refresh,
      applyDemoDelta,
      sign,
    }),
    [
      state,
      connecting,
      error,
      newSeed,
      clearNewSeed,
      connect,
      disconnect,
      refresh,
      applyDemoDelta,
      sign,
    ]
  );

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}
