const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const rows = await prisma.systemConfig.findMany({
    orderBy: [{ key: "asc" }, { updatedAt: "desc" }, { createdAt: "desc" }],
    select: { id: true, key: true },
  });

  const seen = new Set();
  const duplicateIds = [];

  for (const row of rows) {
    if (seen.has(row.key)) {
      duplicateIds.push(row.id);
    } else {
      seen.add(row.key);
    }
  }

  if (duplicateIds.length === 0) {
    console.log("No duplicates found in system_configs.key");
    return;
  }

  console.log(`Found ${duplicateIds.length} duplicate rows. Deleting...`);

  const CHUNK_SIZE = 500;
  for (let i = 0; i < duplicateIds.length; i += CHUNK_SIZE) {
    const chunk = duplicateIds.slice(i, i + CHUNK_SIZE);
    await prisma.systemConfig.deleteMany({
      where: { id: { in: chunk } },
    });
  }

  console.log("Done. You can re-run: npx prisma db push");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

