"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { WalletState } from "@/lib/types";
import {
  adjustDemoBalance,
  connectDemoWallet,
  connectTronLink,
  fetchUsdtBalance,
} from "@/lib/wallet";

interface WalletContextValue extends WalletState {
  connecting: boolean;
  error: string | null;
  connect: (mode: "tronlink" | "demo") => Promise<void>;
  disconnect: () => void;
  refresh: () => Promise<void>;
  /** demo-mode helper to reflect a spend/receive in the on-screen balance */
  applyDemoDelta: (delta: number) => void;
}

const WalletContext = createContext<WalletContextValue | null>(null);

const STORAGE_KEY = "pitchpass.wallet";

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<WalletState>({
    connected: false,
    address: null,
    usdtBalance: 0,
    network: "Tron",
    provider: null,
  });
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBalance = useCallback(
    async (address: string, provider: "tronlink" | "demo") => {
      const bal = await fetchUsdtBalance(address, provider);
      setState((s) => ({ ...s, usdtBalance: bal }));
    },
    []
  );

  const connect = useCallback(
    async (mode: "tronlink" | "demo") => {
      setConnecting(true);
      setError(null);
      try {
        const res =
          mode === "tronlink" ? await connectTronLink() : connectDemoWallet();
        const next: WalletState = {
          connected: true,
          address: res.address,
          usdtBalance: 0,
          network: mode === "demo" ? "Tron (demo)" : "Tron",
          provider: res.provider,
        };
        setState(next);
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ address: res.address, provider: res.provider })
        );
        await loadBalance(res.address, res.provider);
      } catch (e: any) {
        setError(
          mode === "tronlink"
            ? "TronLink not detected. Install it or use the demo wallet."
            : e?.message || "Failed to connect"
        );
      } finally {
        setConnecting(false);
      }
    },
    [loadBalance]
  );

  const disconnect = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState({
      connected: false,
      address: null,
      usdtBalance: 0,
      network: "Tron",
      provider: null,
    });
  }, []);

  const refresh = useCallback(async () => {
    if (state.address && state.provider) {
      await loadBalance(state.address, state.provider);
    }
  }, [state.address, state.provider, loadBalance]);

  const applyDemoDelta = useCallback(
    (delta: number) => {
      if (state.provider === "demo") {
        adjustDemoBalance(delta);
        setState((s) => ({
          ...s,
          usdtBalance: Math.max(0, s.usdtBalance + delta),
        }));
      }
    },
    [state.provider]
  );

  // reconnect on refresh
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const { address, provider } = JSON.parse(raw);
      if (address && provider) {
        setState((s) => ({
          ...s,
          connected: true,
          address,
          provider,
          network: provider === "demo" ? "Tron (demo)" : "Tron",
        }));
        loadBalance(address, provider);
      }
    } catch {
      /* ignore */
    }
  }, [loadBalance]);

  const value = useMemo<WalletContextValue>(
    () => ({
      ...state,
      connecting,
      error,
      connect,
      disconnect,
      refresh,
      applyDemoDelta,
    }),
    [state, connecting, error, connect, disconnect, refresh, applyDemoDelta]
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
