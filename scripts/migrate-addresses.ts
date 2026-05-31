import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log("Migrating addresses...");
  
  // Find all addresses that have old fields (in MongoDB, we can just fetch all addresses and loop)
  const addresses = await prisma.address.findMany({
    include: { user: true }
  });

  let migratedCount = 0;

  for (const address of addresses) {
    // We access raw old fields via typing it to any because Prisma Client now expects the new schema
    const legacyAddr = address as any;
    
    // Check if it needs migration (if fullName is missing)
    if (!legacyAddr.fullName) {
      await prisma.address.update({
        where: { id: address.id },
        data: {
          fullName: legacyAddr.user?.name || legacyAddr.user?.firstName || 'Unknown',
          mobileNumber: legacyAddr.user?.phone || '0000000000',
          houseNumber: 'N/A', // Cannot deduce house number from raw string reliably
          area: legacyAddr.streetAddress || 'N/A',
          pincode: legacyAddr.zipCode || '000000',
          addressType: legacyAddr.label || 'HOME',
        }
      });
      migratedCount++;
    }
  }

  console.log(`Successfully migrated ${migratedCount} addresses to the new schema.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
