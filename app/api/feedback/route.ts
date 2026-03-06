import { NextRequest } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const rateLimit = new Map<string, { count: number; ts: number }>();

function checkRateLimit(ip: string, maxPerMinute: number) {
  const now = Date.now();
  const windowMs = 60_000;
  const entry = rateLimit.get(ip);
  if (!entry || now - entry.ts > windowMs) {
    rateLimit.set(ip, { count: 1, ts: now });
    return true;
  }
  if (entry.count >= maxPerMinute) return false;
  entry.count += 1;
  return true;
}

const createSchema = z.object({
  name: z.string().trim().min(2).max(32),
  email: z
    .string()
    .trim()
    .max(100)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined))
    .refine((v) => !v || z.string().email().safeParse(v).success, {
      message: "Invalid email",
    }),
  message: z.string().trim().min(1).max(500),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limitRaw = Number(searchParams.get("limit") ?? 20);
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 50) : 20;

  const items = await prisma.feedback.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      name: true,
      message: true,
      createdAt: true,
    },
  });

  return new Response(JSON.stringify({ items }), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

export async function POST(req: NextRequest) {
  const ip = req.ip || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
  if (!checkRateLimit(ip, 5)) {
    return new Response(JSON.stringify({ error: "Too many requests" }), {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": "60",
      },
    });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(
      JSON.stringify({
        error: parsed.error.issues[0]?.message || "Invalid input",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const userAgent = req.headers.get("user-agent") || undefined;

  const created = await prisma.feedback.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      message: parsed.data.message,
      ip,
      userAgent,
    },
    select: {
      id: true,
      name: true,
      message: true,
      createdAt: true,
    },
  });

  return new Response(JSON.stringify({ item: created }), {
    status: 201,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

