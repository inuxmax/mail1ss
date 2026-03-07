import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  const postId = params.id;
  
  const comments = await prisma.comment.findMany({
    where: { postId, parentId: null }, // Fetch top-level comments only
    orderBy: { createdAt: "desc" }, // Newest first
    include: {
      user: {
        select: { name: true, image: true }
      },
      _count: {
        select: { likes: true, replies: true }
      },
      likes: user ? {
        where: { userId: user.id },
        select: { id: true }
      } : undefined,
      replies: {
        orderBy: { createdAt: "asc" },
        include: {
          user: {
            select: { name: true, image: true }
          },
          _count: {
            select: { likes: true }
          },
          likes: user ? {
            where: { userId: user.id },
            select: { id: true }
          } : undefined,
        }
      }
    }
  });

  const formattedComments = comments.map(comment => ({
    ...comment,
    isLiked: user ? comment.likes.length > 0 : false,
    likeCount: comment._count.likes,
    replies: comment.replies.map(reply => ({
        ...reply,
        isLiked: user ? reply.likes.length > 0 : false,
        likeCount: reply._count.likes
    }))
  }));

  return NextResponse.json(formattedComments);
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const postId = params.id;
  const { content, parentId } = await req.json();

  if (!content) return new NextResponse("Content required", { status: 400 });

  const comment = await prisma.comment.create({
    data: {
      content,
      postId,
      userId: user.id,
      parentId: parentId || null
    },
    include: {
      user: {
        select: { name: true, image: true }
      }
    }
  });

  return NextResponse.json({
      ...comment,
      isLiked: false,
      likeCount: 0,
      replies: []
  });
}
