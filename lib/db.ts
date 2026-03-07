import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var cachedPrisma: PrismaClient;
}

export let prisma: any;
if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient() as any;
} else {
  if (!global.cachedPrisma) {
    global.cachedPrisma = new PrismaClient();
  }
  prisma = global.cachedPrisma as any;
}
