import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log("Migrating products...");
  
  // Update all products in the database to have isDeleted: false natively
  const result = await prisma.product.updateMany({
    data: {
      isDeleted: false
    }
  });

  console.log(`Updated ${result.count} products to have isDeleted: false`);

  const active = await prisma.product.count({ where: { isDeleted: false } });
  console.log(`Active products now: ${active}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
