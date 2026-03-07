import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/app/lib/auth';
import { sendEmail } from '@/lib/resend';
import { getOrderConfirmationEmailHtml } from '@/lib/email-templates';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { items, customerName, customerAddress, customerEmail, customerPhone, paymentMethod, couponCode } = body;

        // Toplamı hesapla ve stok kontrolü yap
        let total = 0;
        const orderItemsData = [];

        // İşlem bütünlüğü (atomicity) için transaction başlat
        const order = await prisma.$transaction(async (tx) => {
            let calculatedTotal = 0;
            const finalItems = [];

            for (const item of items) {
                const variant = await tx.variant.findUnique({
                    where: { id: item.variantId },
                    include: {
                        product: {
                            include: {
                                discounts: {
                                    where: { active: true }
                                }
                            }
                        }
                    }
                });

                if (!variant || variant.stock < item.quantity) {
                    throw new Error(`Stock issue with variant ${item.variantId}`);
                }

                await tx.variant.update({
                    where: { id: variant.id },
                    data: { stock: variant.stock - item.quantity }
                });

                let price = Number(variant.product.price);
                if (variant.product.discounts && variant.product.discounts.length > 0) {
                    const productDiscount = variant.product.discounts[0];
                    if (productDiscount.type === 'PERCENTAGE') {
                        price = price - (price * Number(productDiscount.value) / 100);
                    } else if (productDiscount.type === 'FIXED') {
                        price = Math.max(0, price - Number(productDiscount.value));
                    }
                }

                calculatedTotal += price * item.quantity;

                finalItems.push({
                    variantId: variant.id,
                    quantity: item.quantity,
                    price: price
                });
            }

            const cartDiscounts = await tx.discount.findMany({
                where: { active: true, productId: null },
                orderBy: { value: 'desc' }
            });

            for (const cartDiscount of cartDiscounts) {
                if (cartDiscount.minCartValue === null || calculatedTotal >= Number(cartDiscount.minCartValue)) {
                    if (cartDiscount.type === 'PERCENTAGE') {
                        calculatedTotal = calculatedTotal - (calculatedTotal * Number(cartDiscount.value) / 100);
                    } else if (cartDiscount.type === 'FIXED') {
                        calculatedTotal = Math.max(0, calculatedTotal - Number(cartDiscount.value));
                    }
                    break;
                }
            }

            // Kupon uygula
            if (couponCode) {
                const coupon = await tx.coupon.findUnique({
                    where: { code: couponCode }
                });

                if (coupon && coupon.active && (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit)) {
                    if (!coupon.minCartValue || calculatedTotal >= Number(coupon.minCartValue)) {
                        if (coupon.type === 'PERCENTAGE') {
                            calculatedTotal = calculatedTotal - (calculatedTotal * Number(coupon.value) / 100);
                        } else if (coupon.type === 'FIXED') {
                            calculatedTotal = Math.max(0, calculatedTotal - Number(coupon.value));
                        }

                        await tx.coupon.update({
                            where: { id: coupon.id },
                            data: { usedCount: { increment: 1 } }
                        });
                    }
                }
            }

            const session = await getSession();

            return await tx.order.create({
                data: {
                    userId: session?.userId ? Number(session.userId) : null,
                    customerName,
                    customerAddress,
                    customerEmail,
                    customerPhone,
                    paymentMethod,
                    couponCode: couponCode || null,
                    total: calculatedTotal,
                    status: 'PAID', // Anında ödemeyi simüle ediyoruz
                    items: {
                        create: finalItems
                    }
                }
            });
        });

        // Send Order Confirmation Email
        await sendEmail({
            to: customerEmail,
            subject: `Siparişiniz Alındı! #${order.id}`,
            html: getOrderConfirmationEmailHtml(order.id, Number(order.total).toFixed(2), customerName)
        });

        return NextResponse.json(order);

    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Transaction failed' }, { status: 400 });
    }
}
