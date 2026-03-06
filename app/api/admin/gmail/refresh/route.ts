import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { getOAuth2Client } from "@/lib/gmail";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const refreshAll = searchParams.get("all") === "1";

  try {
    const oauth2Client = getOAuth2Client();

    if (refreshAll) {
      const accounts = await prisma.gmailAccount.findMany({
        where: { isActive: true },
        select: { id: true, refreshToken: true },
      });

      let refreshed = 0;
      for (const acc of accounts) {
        if (!acc.refreshToken) continue;
        oauth2Client.setCredentials({ refresh_token: acc.refreshToken });
        const { credentials } = await oauth2Client.refreshAccessToken();
        if (credentials.access_token) {
          await prisma.gmailAccount.update({
            where: { id: acc.id },
            data: {
              accessToken: credentials.access_token,
              expiresAt: BigInt(credentials.expiry_date || Date.now() + 3600 * 1000),
              isActive: true,
            },
          });
          refreshed++;
        }
      }

      return NextResponse.json({ ok: true, refreshed });
    }

    if (!id) {
      return new NextResponse("ID required", { status: 400 });
    }

    const account = await prisma.gmailAccount.findUnique({
      where: { id },
      select: { id: true, refreshToken: true },
    });
    if (!account || !account.refreshToken) {
      return new NextResponse("Account not found", { status: 404 });
    }

    oauth2Client.setCredentials({ refresh_token: account.refreshToken });
    const { credentials } = await oauth2Client.refreshAccessToken();

    if (!credentials.access_token) {
      return new NextResponse("Failed to refresh token", { status: 500 });
    }

    await prisma.gmailAccount.update({
      where: { id: account.id },
      data: {
        accessToken: credentials.access_token,
        expiresAt: BigInt(credentials.expiry_date || Date.now() + 3600 * 1000),
        isActive: true,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Refresh gmail token error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
