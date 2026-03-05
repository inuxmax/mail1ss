import { prisma } from "@/lib/db";
import { checkUserStatus } from "@/lib/dto/user";
import { getCurrentUser } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const user = checkUserStatus(await getCurrentUser());
    if (user instanceof Response) return user;
    if (user.role !== "ADMIN") {
      return Response.json("Unauthorized", {
        status: 401,
      });
    }

    const { userId, planName } = await req.json();
    if (!userId || !planName) {
      return Response.json("userId and planName are required", { status: 400 });
    }

    const plan = await prisma.plan.findUnique({
      where: { name: planName },
    });
    if (!plan || !plan.isActive) {
      return Response.json("Plan not found or inactive", { status: 404 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        team: plan.name,
      },
      select: {
        id: true,
        team: true,
      },
    });

    return Response.json(updatedUser, { status: 200 });
  } catch (error) {
    return Response.json({ statusText: "Server error" }, { status: 500 });
  }
}
