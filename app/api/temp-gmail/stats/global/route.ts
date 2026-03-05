import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user || !user.id) return new NextResponse("Unauthorized", { status: 403 });

  try {
    const allTempGmails = await prisma.userTempGmail.findMany({
      where: { userId: user.id },
      select: { id: true }
    });

    if (allTempGmails.length === 0) {
      return NextResponse.json({
        emailAddress: 0,
        inboxEmails: 0,
        unreadEmails: 0
      });
    }

    const tempGmailIds = allTempGmails.map(t => t.id);

    const inboxEmails = await prisma.tempGmailMessage.count({
        where: { tempGmailId: { in: tempGmailIds } }
    });

    const unreadEmails = await prisma.tempGmailMessage.count({
        where: { 
            tempGmailId: { in: tempGmailIds },
            isRead: false
        }
    });

    return NextResponse.json({
      emailAddress: allTempGmails.length,
      inboxEmails,
      unreadEmails
    });

  } catch (error) {
    console.error("Error fetching global stats:", error);
    return new NextResponse("Failed to fetch global stats", { status: 500 });
  }
}
