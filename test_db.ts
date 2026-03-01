import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const v = await prisma.variant.findFirst();
  console.log(v);
}
main().catch(console.error).finally(() => prisma.$disconnect());
