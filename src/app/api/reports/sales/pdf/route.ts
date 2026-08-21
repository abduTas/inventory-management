import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { SalesReportPdf } from "@/lib/reports/pdf/sales-report-pdf";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const storeName = searchParams.get("storeName") ?? "Store";
  const orgName = searchParams.get("orgName") ?? "Business";
  const currency = searchParams.get("currency") ?? "INR";
  const totalRevenue = Number(searchParams.get("totalRevenue") ?? 0);
  const transactionCount = Number(searchParams.get("transactionCount") ?? 0);
  const topProductsRaw = searchParams.get("topProducts") ?? "[]";

  let topProducts: Array<{ product_name: string; total_qty: number; total_revenue: number }> = [];
  try {
    topProducts = JSON.parse(topProductsRaw);
  } catch {
    topProducts = [];
  }

  const buffer = await renderToBuffer(
    SalesReportPdf({
      storeName,
      orgName,
      currency,
      totalRevenue,
      transactionCount,
      topProducts,
      generatedAt: new Date().toISOString(),
    })
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="sales-report-${Date.now()}.pdf"`,
    },
  });
}
