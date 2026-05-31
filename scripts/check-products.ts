import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const total = await prisma.product.count();
  const deleted = await prisma.product.count({ where: { isDeleted: true } });
  const active = await prisma.product.count({ where: { isDeleted: false } });
  console.log(`Total: ${total}, Deleted: ${deleted}, Active (isDeleted=false): ${active}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
