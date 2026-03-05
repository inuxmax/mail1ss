import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return new NextResponse("Unauthorized", { status: 403 });

  const accounts = await prisma.gmailAccount.findMany({
    where: { isActive: true },
    select: { id: true, email: true }
  });

  return NextResponse.json(accounts);
}
