import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { userAgent } from "next/server";

export async function POST(req: Request) {
  try {
    const { path } = await req.json();
    const { browser, device, os } = userAgent(req);
    
    // Extract IP from headers
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    
    // Extract Geo info from headers (Cloudflare/Vercel usually provide these)
    const city = req.headers.get("x-vercel-ip-city") || null;
    const country = req.headers.get("x-vercel-ip-country") || null;
    const region = req.headers.get("x-vercel-ip-country-region") || null;

    await prisma.siteVisit.create({
      data: {
        ip: ip.split(",")[0], // Take first IP if multiple
        city,
        country,
        region,
        browser: browser.name,
        os: os.name,
        device: device.type || "desktop",
        path: path || "/"
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to record visit:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
