import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/slug';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    const productId = parseInt(id);

    if (isNaN(productId)) {
        return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
        where: { id: productId },
        include: {
            variants: {
                orderBy: { order: 'asc' }
            }
        }
    });

    if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    const productId = parseInt(id);

    try {
        const body = await request.json();
        const { name, description, price, imageUrls, variants, slug: manualSlug } = body;

        const mainImageUrl = imageUrls && imageUrls.length > 0 ? imageUrls[0] : null;

        const updatedProduct = await prisma.$transaction(async (tx) => {
            // Get current product to check if slug needs update
            const currentProduct = await tx.product.findUnique({ where: { id: productId } });
            if (!currentProduct) throw new Error("Product not found");

            // Generate and ensure unique slug if it changed or manual is provided
            let finalSlug = currentProduct.slug;
            const newBaseSlug = manualSlug ? slugify(manualSlug) : slugify(name);

            if (newBaseSlug !== currentProduct.slug) {
                let slug = newBaseSlug;
                finalSlug = slug;
                let counter = 0;
                let isUnique = false;

                while (!isUnique) {
                    const existing = await tx.product.findFirst({
                        where: {
                            slug: finalSlug,
                            id: { not: productId }
                        }
                    });
                    if (!existing) {
                        isUnique = true;
                    } else {
                        counter++;
                        finalSlug = `${slug}-${counter}`;
                    }
                }
            }

            // Update base product
            const product = await tx.product.update({
                where: { id: productId },
                data: {
                    name,
                    slug: finalSlug,
                    description,
                    price,
                    imageUrl: mainImageUrl
                }
            });

            // Update images (delete all and recreate)
            await tx.productImage.deleteMany({
                where: { productId }
            });
            if (imageUrls && imageUrls.length > 0) {
                const imagesData = imageUrls.map((url: string, index: number) => ({
                    productId,
                    url,
                    order: index
                }));
                await tx.productImage.createMany({
                    data: imagesData
                });
            }

            // Sync variants: we receive full list. Delete missing, update existing, create new.
            const existingVariants = await tx.variant.findMany({ where: { productId } });
            const existingVariantIds = existingVariants.map(v => v.id);
            const incomingVariantIds = variants.map((v: any) => v.id).filter(Boolean);

            const variantsToDelete = existingVariantIds.filter(id => !incomingVariantIds.includes(id));

            try {
                if (variantsToDelete.length > 0) {
                    await tx.variant.deleteMany({
                        where: { id: { in: variantsToDelete } }
                    });
                }
            } catch (e) { console.error("Could not delete variants heavily tied to orders", e); }

            for (const v of variants) {
                if (v.id) {
                    await tx.variant.update({
                        where: { id: v.id },
                        data: {
                            name: v.name,
                            sku: v.sku,
                            stock: v.stock,
                            order: v.order || 0
                        }
                    });
                } else {
                    await tx.variant.create({
                        data: {
                            name: v.name,
                            sku: v.sku,
                            stock: v.stock,
                            order: v.order || 0,
                            productId
                        }
                    });
                }
            }

            return product;
        });

        return NextResponse.json(updatedProduct);
    } catch (error) {
        console.error("PUT Error:", error);
        return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
}
