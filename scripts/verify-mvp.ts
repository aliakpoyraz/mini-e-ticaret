
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Starting MVP Verification (Prisma 5) ---');

    // 1. Clean up
    try {
        await prisma.orderItem.deleteMany();
        await prisma.order.deleteMany();
        await prisma.variant.deleteMany();
        await prisma.product.deleteMany();
        console.log('✔ Cleaned up database');
    } catch (e) {
        console.log('DB clean up failed, continuing...', e);
    }

    // 2. Create Product
    const product = await prisma.product.create({
        data: {
            name: 'Test T-Shirt',
            price: 100,
            variants: {
                create: [
                    { name: 'Small', sku: 'TS-S', stock: 10 },
                    { name: 'Large', sku: 'TS-L', stock: 5 }
                ]
            }
        },
        include: { variants: true }
    });
    console.log('✔ Created product with stock: Small=10, Large=5');

    const smallVariant = product.variants.find(v => v.name === 'Small')!;

    // 3. Create Order (Success)
    const orderQuantity = 3;

    await prisma.$transaction(async (tx) => {
        const v = await tx.variant.findUnique({ where: { id: smallVariant.id } });
        if (!v || v.stock < orderQuantity) throw new Error('Stock error');

        await tx.variant.update({
            where: { id: v.id },
            data: { stock: v.stock - orderQuantity }
        });

        await tx.order.create({
            data: {
                total: 300,
                customerName: 'Test User',
                customerAddress: 'Test Addr',
                customerEmail: 'test@test.com',
                status: 'PAID',
                items: {
                    create: [{ variantId: v.id, quantity: orderQuantity, price: 100 }]
                }
            }
        });
    });
    console.log(`✔ Created order for ${orderQuantity} items`);

    // 4. Verify Stock
    const updatedVariant = await prisma.variant.findUnique({ where: { id: smallVariant.id } });
    if (updatedVariant?.stock === 7) {
        console.log('✔ Stock correctly reduced to 7');
    } else {
        console.error(`❌ Stock validation failed! Expected 7, got ${updatedVariant?.stock}`);
        process.exit(1);
    }

    // 5. Create Oversized Order (Fail)
    try {
        const tooMany = 8; // Only 7 left
        await prisma.$transaction(async (tx) => {
            const v = await tx.variant.findUnique({ where: { id: smallVariant.id } });
            if (!v || v.stock < tooMany) throw new Error('Insufficient stock');
            // ... rest of logic
        });
        console.error('❌ Failed: Should have thrown Insufficient stock error');
        process.exit(1);
    } catch (e: any) {
        if (e.message.includes('Insufficient stock')) {
            console.log('✔ Correctly rejected order exceeding stock');
        } else {
            console.error('❌ Failed with unexpected error:', e);
            process.exit(1);
        }
    }

    console.log('--- Verification Successful ---');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
