import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { createInvoice } from "@/lib/payment";
import { env } from "@/env.mjs";
import { checkUserStatus } from "@/lib/dto/user";

export async function POST(req: NextRequest) {
  try {
    const user = checkUserStatus(await getCurrentUser());
    if (user instanceof Response) return user;

    const { planId } = await req.json();

    if (!planId) {
      return Response.json({ error: "Plan ID is required" }, { status: 400 });
    }

    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return Response.json({ error: "Plan not found" }, { status: 404 });
    }
    if (!plan.isActive) {
      return Response.json({ error: "Plan is inactive" }, { status: 400 });
    }
    if (Number(plan.price) <= 0) {
      return Response.json({ error: "Plan price must be greater than 0" }, { status: 400 });
    }

    const requestId = crypto.randomUUID();

    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        planId: plan.id,
        amount: plan.price,
        requestId,
        status: "waiting",
      },
    });

    const baseUrl = env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const invoice = await createInvoice({
      name: `Upgrade to ${plan.name}`,
      description: `Upgrade user ${user.email} to ${plan.name} plan`,
      amount: Number(plan.price),
      requestId,
      callbackUrl: `${baseUrl}/api/payment/callback`,
      successUrl: `${baseUrl}/dashboard?payment=success`,
      cancelUrl: `${baseUrl}/dashboard?payment=cancel`,
    });

    if (invoice.status === "success" && invoice.data) {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          transId: invoice.data.trans_id,
        },
      });

      return Response.json({ url: invoice.data.url_payment });
    }

    await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        status: "failed",
      },
    });

    return Response.json({ error: invoice.msg }, { status: 400 });
  } catch (error) {
    console.error("Payment create error:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
