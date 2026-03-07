import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getOAuth2Client } from "@/lib/gmail";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const secretQuery = searchParams.get("secret");
    const secretHeader = req.headers.get("cron-secret");
    const secret = secretQuery || secretHeader;

    const isCron = req.headers.get("x-vercel-cron");
    const host = req.headers.get("host") || "";
    const isLocal =
      host.includes("localhost") ||
      host.includes("127.0.0.1") ||
      host.includes("::1");
    
    // Allow if local, or Vercel Cron, or public enabled, or secret matches env
    const authorized =
      isLocal ||
      isCron ||
      process.env.CRON_PUBLIC === "true" ||
      (secret && secret === process.env.CRON_SECRET);

    if (!authorized) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const oauth2Client = getOAuth2Client();
    const now = Date.now();
    const threshold = now + 15 * 60 * 1000; // refresh if expiring within 15 minutes

    const accounts = await prisma.gmailAccount.findMany({
      where: { isActive: true },
      select: { id: true, refreshToken: true, expiresAt: true },
    });

    let refreshed = 0;
    for (const acc of accounts) {
      const expMs =
        acc.expiresAt !== null && acc.expiresAt !== undefined
          ? Number(acc.expiresAt)
          : 0;
      if (!acc.refreshToken) continue;
      if (expMs === 0 || expMs < threshold) {
        try {
          oauth2Client.setCredentials({ refresh_token: acc.refreshToken });
          const { credentials } = await oauth2Client.refreshAccessToken();
          if (credentials.access_token) {
            await prisma.gmailAccount.update({
              where: { id: acc.id },
              data: {
                accessToken: credentials.access_token,
                expiresAt: BigInt(credentials.expiry_date || now + 3600 * 1000),
                isActive: true,
              },
            });
            refreshed++;
          } else {
            await prisma.gmailAccount.update({
              where: { id: acc.id },
              data: { isActive: false },
            });
          }
        } catch (err: any) {
          // If unauthorized_client, mark inactive so admin can reconnect
          const message = (err?.message || "").toLowerCase();
          if (message.includes("unauthorized_client") || err?.code === 401) {
            await prisma.gmailAccount.update({
              where: { id: acc.id },
              data: { isActive: false },
            });
          }
          console.error("Cron refresh account error:", acc.id, err);
        }
      }
    }

    return NextResponse.json({ ok: true, refreshed });
  } catch (error) {
    console.error("Cron gmail refresh error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
