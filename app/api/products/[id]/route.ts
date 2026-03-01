import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    const productId = parseInt(id);

    if (isNaN(productId)) {
        return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
        where: { id: productId },
        include: { variants: true }
    });

    if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
}

// Ürünü güncelle
export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    const productId = parseInt(id);

    try {
        const body = await request.json();
        const { name, description, price, imageUrl, variants } = body;

        // Ürün ve varyantları güncellemek için transaction başla
        const updatedProduct = await prisma.$transaction(async (tx) => {
            const product = await tx.product.update({
                where: { id: productId },
                data: {
                    name,
                    description,
                    price,
                    imageUrl
                }
            });

            // Varyant stoklarını güncelle
            for (const v of variants) {
                await tx.variant.update({
                    where: { id: v.id },
                    data: { stock: v.stock }
                });
            }

            return product;
        });

        return NextResponse.json(updatedProduct);
    } catch (error) {
        return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
}
