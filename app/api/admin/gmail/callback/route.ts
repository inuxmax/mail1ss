import { getOAuth2Client, getGmailProfile } from "@/lib/gmail";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return new NextResponse("Code not found", { status: 400 });
  }

  try {
    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);
    const accessToken = tokens.access_token;
    const refreshToken = tokens.refresh_token;

    if (!accessToken || !refreshToken) {
      console.warn("Missing tokens", tokens);
      return new NextResponse("Failed to get tokens", { status: 500 });
    }

    const profile = await getGmailProfile(accessToken, refreshToken);
    const email = profile.emailAddress;

    if (!email) {
      return new NextResponse("Failed to get email", { status: 500 });
    }

    await prisma.gmailAccount.upsert({
      where: { email },
      update: { refreshToken, isActive: true },
      create: { email, refreshToken, isActive: true },
    });

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/admin/system`);
  } catch (error) {
    console.error("Error connecting gmail:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
