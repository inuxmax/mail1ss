import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const commentId = params.id;

  const existingLike = await prisma.commentLike.findUnique({
    where: {
      userId_commentId: {
        userId: user.id,
        commentId
      }
    }
  });

  if (existingLike) {
    await prisma.commentLike.delete({
      where: { id: existingLike.id }
    });
    return NextResponse.json({ liked: false });
  } else {
    await prisma.commentLike.create({
      data: {
        userId: user.id,
        commentId
      }
    });
    return NextResponse.json({ liked: true });
  }
}
