import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const skip = (page - 1) * limit;

  const [posts, total] = await prisma.$transaction([
    prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        user: {
          select: { name: true, image: true }
        },
        _count: {
          select: { likes: true, comments: true }
        },
        likes: {
          where: { userId: user.id },
          select: { id: true }
        }
      }
    }),
    prisma.post.count()
  ]);

  const formattedPosts = posts.map(post => ({
    id: post.id,
    content: post.content,
    image: post.image,
    createdAt: post.createdAt,
    user: post.user,
    isLiked: post.likes.length > 0,
    likeCount: post._count.likes,
    commentCount: post._count.comments
  }));

  return NextResponse.json({
    data: formattedPosts,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
  });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return new NextResponse("Unauthorized", { status: 403 });

  const body = await req.json();
  const { content, image } = body;

  if (!content) return new NextResponse("Content required", { status: 400 });

  const post = await prisma.post.create({
    data: {
      content,
      image,
      userId: user.id
    }
  });

  return NextResponse.json(post);
}
