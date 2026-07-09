// Real self-custodial wallet, powered by Tether's WDK (@tetherto/wdk).
//
// The 12-word seed phrase is generated ON THE USER'S DEVICE, kept in the
// browser only, and NEVER sent to any server. The app derives an EVM account,
// reads the on-chain balance, and cryptographically SIGNS every in-app action
// with the user's key — proving genuine self-custody.
//
// This module must only ever run in the browser (it is imported from client
// components). WDK does key generation, derivation and signing; nothing leaves
// the device.

import WDK from "@tetherto/wdk";
import WalletManagerEvm from "@tetherto/wdk-wallet-evm";

const CHAIN = "ethereum";
// Public read RPC; override with NEXT_PUBLIC_EVM_RPC if you like.
const RPC =
  process.env.NEXT_PUBLIC_EVM_RPC || "https://eth.drpc.org";

const SEED_KEY = "pitchpass.wdk.seed";

let account: any = null;
let cachedAddress: string | null = null;

export function hasStoredWallet(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem(SEED_KEY);
}

export function generateSeedPhrase(): string {
  return WDK.getRandomSeedPhrase();
}

function persistSeed(seed: string) {
  if (typeof window !== "undefined") localStorage.setItem(SEED_KEY, seed);
}

export function getStoredSeed(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(SEED_KEY);
}

export function forgetWallet() {
  if (typeof window !== "undefined") localStorage.removeItem(SEED_KEY);
  account = null;
  cachedAddress = null;
}

/**
 * Initialise (or create) the WDK wallet.
 * - Pass a seed to restore an existing wallet.
 * - Pass nothing to load the stored seed, or generate+persist a fresh one.
 * Returns the derived EVM address and the seed (so the UI can prompt a backup).
 */
export async function initWallet(
  seed?: string
): Promise<{ address: string; seedPhrase: string; isNew: boolean }> {
  let isNew = false;
  let seedPhrase = seed || getStoredSeed() || "";
  if (!seedPhrase) {
    seedPhrase = generateSeedPhrase();
    isNew = true;
  }
  persistSeed(seedPhrase);

  // Cast: the WDK beta packages ship slightly different internal type
  // declarations for WalletManager, but they are runtime-compatible.
  const wdk = new WDK(seedPhrase).registerWallet(
    CHAIN,
    WalletManagerEvm as any,
    { provider: RPC }
  );
  account = await wdk.getAccount(CHAIN, 0);
  cachedAddress = await account.getAddress();
  return { address: cachedAddress!, seedPhrase, isNew };
}

export function getAddress(): string | null {
  return cachedAddress;
}

/** On-chain native balance (wei -> ETH). Real read via the WDK provider. */
export async function getOnchainBalance(): Promise<number> {
  if (!account) return 0;
  try {
    const wei: bigint = await account.getBalance();
    return Number(wei) / 1e18;
  } catch {
    return 0;
  }
}

/** Sign an arbitrary in-app action with the user's key. Proves self-custody. */
export async function signAction(message: string): Promise<string> {
  if (!account) throw new Error("Wallet not initialised");
  const sig = await account.sign(message);
  return String(sig);
}

export const WALLET_RPC = RPC;
