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
      const user = await prisma.user.findUnique({
        where: { id: transaction.userId },
        select: { team: true, planExpiresAt: true }
      });

      let newExpiresAt = new Date();
      // If user is already on the same plan and it hasn't expired, extend it
      if (user?.team === transaction.plan.name && user?.planExpiresAt && user.planExpiresAt > new Date()) {
        newExpiresAt = new Date(user.planExpiresAt);
      }

      // Add duration (months)
      newExpiresAt.setMonth(newExpiresAt.getMonth() + (transaction.duration || 1));

      await prisma.user.update({
        where: { id: transaction.userId },
        data: { 
          team: transaction.plan.name,
          planExpiresAt: newExpiresAt
        },
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
