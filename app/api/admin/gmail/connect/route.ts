import { getAuthUrl } from "@/lib/gmail";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const url = getAuthUrl();
    return NextResponse.redirect(url);
  } catch (error) {
    console.error("Error generating auth url:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
