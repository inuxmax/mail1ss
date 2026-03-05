import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { env } from "@/env.mjs";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const requestId = searchParams.get("request_id");
    const transId = searchParams.get("trans_id");
    const merchantId = searchParams.get("merchant_id");
    const apiKey = searchParams.get("api_key");
    const status = searchParams.get("status");

    if (merchantId !== env.FPAYMENT_MERCHANT_ID || apiKey !== env.FPAYMENT_API_KEY) {
      return Response.json({ status: "error", message: "Invalid credentials" }, {
        status: 403,
      });
    }

    if (!requestId || !status) {
      return Response.json({ status: "error", message: "Missing parameters" }, {
        status: 400,
      });
    }

    const transaction = await prisma.transaction.findUnique({
      where: { requestId },
      include: { plan: true },
    });

    if (!transaction) {
      return Response.json({ status: "error", message: "Transaction not found" }, {
        status: 404,
      });
    }

    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { status, transId: transId || transaction.transId },
    });

    if (status === "completed") {
      await prisma.user.update({
        where: { id: transaction.userId },
        data: { team: transaction.plan.name },
      });
    }

    return Response.json({ status: "success", message: "Callback processed" });
  } catch (error) {
    console.error("Payment callback error:", error);
    return Response.json({ status: "error", message: "Internal Server Error" }, {
      status: 500,
    });
  }
}
