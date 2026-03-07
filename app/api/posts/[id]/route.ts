import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { NextResponse } from "next/server";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return new NextResponse("Unauthorized", { status: 403 });

  await prisma.post.delete({
    where: { id: params.id }
  });

  return NextResponse.json({ success: true });
}
