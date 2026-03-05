import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return new NextResponse("Unauthorized", { status: 403 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return new NextResponse("ID required", { status: 400 });

  const userTempGmail = await prisma.userTempGmail.findUnique({
    where: { id },
  });

  if (!userTempGmail || userTempGmail.userId !== user.id) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    // Count from DB
    const inboxCount = await prisma.tempGmailMessage.count({
        where: { tempGmailId: id }
    });

    const unreadCount = await prisma.tempGmailMessage.count({
        where: { 
            tempGmailId: id,
            isRead: false
        }
    });

    return NextResponse.json({ inboxCount, unreadCount });

  } catch (error) {
    console.error("Error fetching stats:", error);
    return new NextResponse("Failed to fetch stats", { status: 500 });
  }
}
