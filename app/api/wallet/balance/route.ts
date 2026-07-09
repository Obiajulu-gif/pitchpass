import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Reads a real USDT (TRC-20) balance from TronGrid for a given Tron address.
// USDT on Tron has 6 decimals.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get("address");
  if (!address) {
    return NextResponse.json({ error: "address required" }, { status: 400 });
  }

  const apiKey = process.env.TRONGRID_API_KEY;
  const usdtContract =
    process.env.USDT_TRC20_CONTRACT || "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";

  try {
    const res = await fetch(
      `https://api.trongrid.io/v1/accounts/${address}`,
      {
        headers: apiKey ? { "TRON-PRO-API-KEY": apiKey } : {},
        cache: "no-store",
      }
    );
    if (!res.ok) throw new Error(String(res.status));
    const data = await res.json();
    const account = data?.data?.[0];
    const trc20: Array<Record<string, string>> = account?.trc20 || [];
    const entry = trc20.find((t) => usdtContract in t);
    const raw = entry ? Number(entry[usdtContract]) : 0;
    const usdt = raw / 1e6;
    return NextResponse.json({ address, usdt, source: "trongrid" });
  } catch (e) {
    return NextResponse.json(
      { address, usdt: 0, source: "error", error: String(e) },
      { status: 200 }
    );
  }
}
