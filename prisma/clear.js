const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Clearing database...');
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.variant.deleteMany();
    await prisma.discount.deleteMany();
    await prisma.product.deleteMany();
    await prisma.coupon.deleteMany();
    console.log("Database cleared successfully! Ready for your presentation. 🎉");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
