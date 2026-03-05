import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { NextResponse } from "next/server";
import { z } from "zod";

const createSchema = z.object({
  gmailAccountId: z.string().optional(),
  tempEmailAddress: z.string().email(),
});

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user || !user.id) {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const skip = (page - 1) * limit;

  const [list, total] = await prisma.$transaction([
    prisma.userTempGmail.findMany({
      where: { userId: user.id },
      include: { gmailAccount: true },
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

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || !user.id) {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  const json = await req.json();
  const body = createSchema.safeParse(json);

  if (!body.success) {
    return new NextResponse(body.error.message, { status: 400 });
  }

  const { gmailAccountId, tempEmailAddress } = body.data;

  // Fetch plan limit
  const plan = await prisma.plan.findUnique({
    where: { name: user.team || "free" }
  });

  const limit = plan?.tempGmailLimit || 0;

  const currentCount = await prisma.userTempGmail.count({
    where: { userId: user.id }
  });

  if (currentCount >= limit) {
    return new NextResponse(`Plan limit reached (${limit}). Upgrade to create more temp gmails.`, { status: 403 });
  }

  let gmailAccount;

  if (gmailAccountId) {
    gmailAccount = await prisma.gmailAccount.findUnique({
      where: { id: gmailAccountId }
    });
  } else {
    // Randomly select an active Gmail account
    const activeAccounts = await prisma.gmailAccount.findMany({
      where: { isActive: true }
    });
    
    if (activeAccounts.length === 0) {
      return new NextResponse("No active Gmail accounts available", { status: 503 });
    }

    const randomIndex = Math.floor(Math.random() * activeAccounts.length);
    gmailAccount = activeAccounts[randomIndex];
  }

  if (!gmailAccount) {
    return new NextResponse("Gmail account not found", { status: 404 });
  }

  const baseEmail = gmailAccount.email;
  const [baseLocal, baseDomain] = baseEmail.split('@');
  const [tempLocal, tempDomain] = tempEmailAddress.split('@');

  if (baseDomain !== tempDomain) {
    return new NextResponse("Invalid domain", { status: 400 });
  }

  const normalizedTempLocal = tempLocal.replace(/\./g, '');
  const normalizedBaseLocal = baseLocal.replace(/\./g, '');

  if (normalizedTempLocal !== normalizedBaseLocal) {
    return new NextResponse("Invalid email variant. Must be a dot variant of base email.", { status: 400 });
  }

  const existing = await prisma.userTempGmail.findUnique({
    where: { tempEmailAddress }
  });

  if (existing) {
    return new NextResponse("Email address already taken", { status: 409 });
  }

  // Ensure userId is valid
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id }
  });

  if (!dbUser) {
    return new NextResponse("User not found in database", { status: 404 });
  }

  try {
    const newTemp = await prisma.userTempGmail.create({
      data: {
        userId: user.id,
        gmailAccountId: gmailAccount.id,
        tempEmailAddress
      },
      include: {
        gmailAccount: true
      }
    });
    return NextResponse.json(newTemp);
  } catch (error: any) {
    console.error("Error creating temp gmail:", error);
    if (error.code === 'P2003') {
        return new NextResponse(`Foreign key constraint violation. User ID: ${user.id}`, { status: 400 });
    }
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(req: Request) {
    const user = await getCurrentUser();
    if (!user || !user.id) return new NextResponse("Unauthorized", { status: 403 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return new NextResponse("ID required", { status: 400 });

    const existing = await prisma.userTempGmail.findUnique({
        where: { id }
    });

    if (!existing || existing.userId !== user.id) {
        return new NextResponse("Not found", { status: 404 });
    }

    await prisma.userTempGmail.delete({
        where: { id }
    });

    return new NextResponse(null, { status: 204 });
}
