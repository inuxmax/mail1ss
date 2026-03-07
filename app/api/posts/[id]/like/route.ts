import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const postId = params.id;

  const existingLike = await prisma.like.findUnique({
    where: {
      userId_postId: {
        userId: user.id,
        postId
      }
    }
  });

  if (existingLike) {
    await prisma.like.delete({
      where: { id: existingLike.id }
    });
    return NextResponse.json({ liked: false });
  } else {
    await prisma.like.create({
      data: {
        userId: user.id,
        postId
      }
    });
    return NextResponse.json({ liked: true });
  }
}
