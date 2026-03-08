import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/app/lib/auth';

// Oturumdan (session) kullanıcı bilgisini almak için yardımcı fonksiyon
async function getUser(): Promise<{ id: number } | null> {
    try {
        const session = await getSession();
        if (!session || !session.userId) return null;
        return { id: Number(session.userId) };
    } catch (e) {
        return null;
    }
}

export async function GET() {
    const user = await getUser();
    if (!user) {
        return NextResponse.json({ items: [] });
    }

    try {
        const cartItems = await prisma.cartItem.findMany({
            where: { userId: user.id },
            include: {
                variant: {
                    include: {
                        product: {
                            include: {
                                discounts: {
                                    where: { active: true }
                                }
                            }
                        }
                    }
                }
            }
        });

        const globalDiscounts = await prisma.discount.findMany({
            where: { active: true, productId: null },
            orderBy: { value: 'desc' },
        });

        const subtotal = cartItems.reduce((acc, item) => {
            return acc + (Number(item.variant.product.price) * item.quantity);
        }, 0);

        const bestGlobalDiscount = globalDiscounts.find(d => !d.minCartValue || subtotal >= Number(d.minCartValue));

        const formattedItems = cartItems.map(item => {
            let finalPrice = Number(item.variant.product.price);
            const originalPrice = finalPrice;
            let activeDiscount = null;

            if (item.variant.product.discounts && item.variant.product.discounts.length > 0) {
                activeDiscount = item.variant.product.discounts[0];
            } else if (bestGlobalDiscount) {
                activeDiscount = bestGlobalDiscount;
            }

            if (activeDiscount) {
                if (activeDiscount.type === 'PERCENTAGE') {
                    finalPrice = finalPrice - (finalPrice * Number(activeDiscount.value) / 100);
                } else if (activeDiscount.type === 'FIXED') {
                    finalPrice = Math.max(0, finalPrice - Number(activeDiscount.value));
                }
            }

            return {
                productId: item.variant.productId,
                variantId: item.variantId,
                name: item.variant.product.name,
                description: item.variant.product.description || '',
                variantName: item.variant.name,
                price: finalPrice,
                originalPrice: originalPrice,
                quantity: item.quantity,
                stock: item.variant.stock,
                imageUrl: item.variant.product.imageUrl || ''
            };
        });

        return NextResponse.json({ items: formattedItems });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const user = await getUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { variantId, quantity, action } = body;

        if (action === 'sync') {
            // Toplu eşitleme (genellikle giriş yapıldığında)
            const items = body.items || [];

            for (const item of items as any[]) {
                await prisma.cartItem.upsert({
                    where: {
                        userId_variantId: {
                            userId: user.id,
                            variantId: item.variantId
                        }
                    },
                    update: { quantity: item.quantity },
                    create: {
                        userId: user.id,
                        variantId: item.variantId,
                        quantity: item.quantity
                    }
                });
            }
            return NextResponse.json({ message: "Cart synced" });
        }

        // Tekil ürün güncelleme
        await prisma.cartItem.upsert({
            where: {
                userId_variantId: {
                    userId: user.id,
                    variantId: variantId
                }
            },
            update: { quantity: quantity },
            create: {
                userId: user.id,
                variantId: variantId,
                quantity: quantity
            }
        });

        return NextResponse.json({ message: "Cart updated" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const user = await getUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const variantId = searchParams.get('variantId');

        if (variantId === 'all') {
            await prisma.cartItem.deleteMany({
                where: { userId: user.id }
            });
        } else if (variantId) {
            await prisma.cartItem.delete({
                where: {
                    userId_variantId: {
                        userId: user.id,
                        variantId: parseInt(variantId)
                    }
                }
            });
        }

        return NextResponse.json({ message: "Item(s) removed" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
