import { NextResponse } from "next/server";
import { getStoreContext } from "@/lib/helpers/store-context";

export async function GET() {
  const ctx = await getStoreContext();
  if (!ctx) return NextResponse.json({ error: "No store" }, { status: 404 });
  return NextResponse.json(ctx);
}
