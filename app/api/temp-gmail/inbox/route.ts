import { getOAuth2Client } from "@/lib/gmail";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { NextResponse } from "next/server";
import { syncGmailMessages } from "@/lib/sync-gmail";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return new NextResponse("Unauthorized", { status: 403 });

  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (!email) return new NextResponse("Email required", { status: 400 });

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

    // Check if we have a valid access token in DB
    let accessToken = gmailAccount.accessToken;
    let expiresAt = Number(gmailAccount.expiresAt || 0);
    const now = Date.now();

    // Refresh if expired or about to expire (within 30 mins) or no token
    if (!accessToken || expiresAt - now < 30 * 60 * 1000) {
        oauth2Client.setCredentials({ refresh_token: gmailAccount.refreshToken });
        const { credentials } = await oauth2Client.refreshAccessToken();
        
        accessToken = credentials.access_token || null;
        expiresAt = credentials.expiry_date || (Date.now() + 3600 * 1000);

        if (accessToken) {
            // Update DB
            await prisma.gmailAccount.update({
                where: { id: gmailAccount.id },
                data: {
                    accessToken,
                    expiresAt: BigInt(expiresAt)
                }
            });
        }
    }

    if (!accessToken) {
      return new NextResponse("Failed to refresh token", { status: 500 });
    }

    // Sync messages from Gmail to DB
    await syncGmailMessages(user.id, gmailAccount.id, email, accessToken);

    // Fetch messages from DB
    const messages = await prisma.tempGmailMessage.findMany({
        where: { tempGmailId: userTempGmail.id },
        orderBy: { internalDate: 'desc' },
        take: 50
    });

    // Map to frontend format
    const formattedMessages = messages.map(msg => ({
        id: msg.gmailId, // Use gmailId for frontend compatibility or msg.id? Frontend uses msg.id for detail view.
        // Wait, frontend uses `id` to fetch details. If we use `gmailId` here, the detail endpoint must accept `gmailId`.
        // The current detail endpoint accepts `id` which was `gmailId`.
        // So we should return `gmailId` as `id`.
        threadId: msg.threadId,
        snippet: msg.snippet,
        labelIds: msg.isRead ? [] : ['UNREAD'], // Synthesize labelIds from isRead
        subject: msg.subject,
        from: msg.from,
        date: msg.date?.toISOString(),
        internalDate: msg.internalDate
    }));

    return NextResponse.json(formattedMessages);
  } catch (error) {
    console.error("Gmail API error:", error);
    return new NextResponse("Failed to fetch emails", { status: 500 });
  }
}
