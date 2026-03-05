import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkApiKey } from "@/lib/dto/api-key";
import { getPlanQuota } from "@/lib/dto/plan";

// Helper to generate a random dot variant
const generateRandomDot = (baseLocal: string) => {
    if (baseLocal.length <= 1) return baseLocal;
    let result = "";
    // Ensure at least one dot
    let hasDot = false;
    
    while (!hasDot) {
      result = baseLocal[0];
      for (let i = 1; i < baseLocal.length; i++) {
          if (Math.random() > 0.5) {
              result += '.';
              hasDot = true;
          }
          result += baseLocal[i];
      }
    }
    return result;
}

export async function POST(req: NextRequest) {
  const custom_api_key = req.headers.get("wrdo-api-key");
  if (!custom_api_key) {
    return Response.json("Unauthorized", {
      status: 401,
    });
  }

  // Check if the API key is valid
  const user = await checkApiKey(custom_api_key);
  if (!user?.id) {
    return Response.json(
      "Invalid API key. You can get your API key from https://Mail1s.net/dashboard/settings.",
      { status: 401 },
    );
  }
  if (user.active === 0) {
    return Response.json("Forbidden", {
      status: 403,
      statusText: "Forbidden",
    });
  }

  // Check plan limit
  const plan = await getPlanQuota(user.team || "free");
  const limit = plan.tempGmailLimit || 0;

  const currentCount = await prisma.userTempGmail.count({
    where: { userId: user.id }
  });

  if (currentCount >= limit) {
    return NextResponse.json(`Plan limit reached (${limit}). Upgrade to create more temp gmails.`, { status: 403 });
  }

  // Randomly select an active Gmail account
  const activeAccounts = await prisma.gmailAccount.findMany({
    where: { isActive: true }
  });
  
  if (activeAccounts.length === 0) {
    return NextResponse.json("No active Gmail accounts available", { status: 503 });
  }

  const randomIndex = Math.floor(Math.random() * activeAccounts.length);
  const gmailAccount = activeAccounts[randomIndex];

  const baseEmail = gmailAccount.email;
  const [baseLocal, baseDomain] = baseEmail.split('@');
  
  // Generate a random dot variant
  let tempLocal = generateRandomDot(baseLocal);
  let tempEmailAddress = `${tempLocal}@${baseDomain}`;

  // Check if this specific address already exists (highly unlikely but possible)
  let existing = await prisma.userTempGmail.findUnique({
    where: { tempEmailAddress }
  });

  // Retry logic (simple retry once or twice)
  let retries = 3;
  while (existing && retries > 0) {
      tempLocal = generateRandomDot(baseLocal);
      tempEmailAddress = `${tempLocal}@${baseDomain}`;
      existing = await prisma.userTempGmail.findUnique({
        where: { tempEmailAddress }
      });
      retries--;
  }

  if (existing) {
    return NextResponse.json("Generated email address collision, please try again", { status: 409 });
  }

  try {
    const newTemp = await prisma.userTempGmail.create({
      data: {
        userId: user.id,
        gmailAccountId: gmailAccount.id,
        tempEmailAddress
      },
      select: {
        id: true,
        tempEmailAddress: true,
        createdAt: true,
        expiresAt: true
      }
    });
    return NextResponse.json(newTemp, { status: 201 });
  } catch (error: any) {
    console.error("Error creating temp gmail:", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}

export async function GET(req: NextRequest) {
    const custom_api_key = req.headers.get("wrdo-api-key");
    if (!custom_api_key) {
      return Response.json("Unauthorized", {
        status: 401,
      });
    }
  
    // Check if the API key is valid
    const user = await checkApiKey(custom_api_key);
    if (!user?.id) {
      return Response.json(
        "Invalid API key.",
        { status: 401 },
      );
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;
  
    const [list, total] = await prisma.$transaction([
      prisma.userTempGmail.findMany({
        where: { userId: user.id },
        select: {
            id: true,
            tempEmailAddress: true,
            createdAt: true,
            expiresAt: true
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.userTempGmail.count({ where: { userId: user.id } })
    ]);
  
    return NextResponse.json({
      items: list,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
}
