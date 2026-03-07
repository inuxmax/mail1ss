import { getOAuth2Client, markMessageAsRead } from "@/lib/gmail";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { NextResponse } from "next/server";
import { syncGmailMessages } from "@/lib/sync-gmail";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return new NextResponse("Unauthorized", { status: 403 });

  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  const messageId = params.id; // Gmail ID

  if (!email || !messageId) return new NextResponse("Email and ID required", { status: 400 });

  const userTempGmail = await prisma.userTempGmail.findUnique({
    where: { tempEmailAddress: email },
    include: { gmailAccount: true }
  });

  if (!userTempGmail || userTempGmail.userId !== user.id) {
    return new NextResponse("Not found", { status: 404 });
  }

  const gmailAccount = userTempGmail.gmailAccount;
  
  try {
    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials({ refresh_token: gmailAccount.refreshToken });
    const { token } = await oauth2Client.getAccessToken();
    
    if (!token) {
      return new NextResponse("Failed to refresh token", { status: 500 });
    }

    // Try to find in DB first
    let dbMessage = await (prisma as any).tempGmailMessage.findUnique({
        where: { gmailId: messageId }
    });

    // If not found, sync (this might be inefficient if only for one message, but reuses logic)
    if (!dbMessage) {
        await syncGmailMessages(user.id, gmailAccount.id, email as string, token as string);
        dbMessage = await prisma.tempGmailMessage.findUnique({
            where: { gmailId: messageId }
        });
    }

    if (!dbMessage) {
        return new NextResponse("Message not found", { status: 404 });
    }

    // Mark as read in DB
    if (!dbMessage.isRead) {
        await prisma.tempGmailMessage.update({
            where: { id: dbMessage.id },
            data: { isRead: true }
        });
        
        // Also mark as read in Gmail (async)
        markMessageAsRead(token, messageId).catch(err => console.error("Failed to mark as read in Gmail", err));
    }
    
    // Construct response compatible with frontend expectation
    return NextResponse.json({
        id: dbMessage.gmailId,
        threadId: dbMessage.threadId,
        snippet: dbMessage.snippet,
        labelIds: [], // Marked as read
        subject: dbMessage.subject,
        from: dbMessage.from,
        date: dbMessage.date,
        internalDate: dbMessage.internalDate,
        html: dbMessage.html || dbMessage.text || '', // Prefer HTML
        // text: dbMessage.text // Optional
    });

  } catch (error) {
    console.error("Fetch message error:", error);
    return new NextResponse("Failed to fetch message", { status: 500 });
  }
}
