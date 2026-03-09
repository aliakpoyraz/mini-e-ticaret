import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/slug';

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
        const { name, description, price, imageUrls, variants, slug: manualSlug, isNew } = body;

        const mainImageUrl = imageUrls && imageUrls.length > 0 ? imageUrls[0] : null;

        const imagesData = imageUrls && imageUrls.length > 0
            ? imageUrls.map((url: string, index: number) => ({ url, order: index }))
            : [];

        // Benzersiz slug oluştur ve doğrula
        let slug = manualSlug ? slugify(manualSlug) : slugify(name);
        let finalSlug = slug;
        let counter = 0;
        let isUnique = false;

        while (!isUnique) {
            const existing = await prisma.product.findUnique({
                where: { slug: finalSlug }
            });
            if (!existing) {
                isUnique = true;
            } else {
                counter++;
                finalSlug = `${slug}-${counter}`;
            }
        }

        const product = await prisma.product.create({
            data: {
                name,
                slug: finalSlug,
                description,
                price,
                isNew: isNew ?? false,
                imageUrl: mainImageUrl, // Geriye dönük uyumluluk
                images: {
                    create: imagesData
                },
                variants: {
                    create: variants.map((v: any, index: number) => ({
                        name: v.name,
                        sku: v.sku,
                        stock: v.stock,
                        order: v.order ?? index
                    }))
                }
            },
            include: { variants: true, images: true }
        });
        return NextResponse.json(product);
    } catch (error: any) {
        console.error("Error creating product:", error);

        if (error.code === 'P2002') {
            const target = error.meta?.target as string[];
            if (target?.includes('sku')) {
                return NextResponse.json(
                    { error: 'A variant with this SKU already exists. Please use unique SKUs.' },
                    { status: 409 }
                );
            }
            if (target?.includes('slug')) {
                return NextResponse.json(
                    { error: 'This slug is already in use.' },
                    { status: 409 }
                );
            }
        }

        return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }
}
