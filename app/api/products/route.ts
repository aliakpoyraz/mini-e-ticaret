import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    const products = await prisma.product.findMany({
        where: query ? {
            OR: [
                { name: { contains: query } },
                { description: { contains: query } }
            ]
        } : undefined,
        include: { variants: true }
    });

    return NextResponse.json(products);
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, description, price, imageUrl, variants } = body;

        const product = await prisma.product.create({
            data: {
                name,
                description,
                price,
                imageUrl,
                variants: {
                    create: variants // { name, sku, stock } formatında dizi bekler
                }
            },
            include: { variants: true }
        });
        return NextResponse.json(product);
    } catch (error: any) {
        console.error("Error creating product:", error);

        if (error.code === 'P2002') {
            return NextResponse.json(
                { error: 'A variant with this SKU already exists. Please use unique SKUs.' },
                { status: 409 }
            );
        }

        return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }
}
