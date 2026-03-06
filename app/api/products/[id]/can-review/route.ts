import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/app/lib/auth';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ canReview: false, reason: 'NOT_LOGGED_IN' });
        }

        const productId = parseInt(id);
        console.log(`Checking review eligibility for User: ${session.userId}, Product: ${productId}`);

        // Check if user already reviewed
        const existingReview = await prisma.review.findUnique({
            where: {
                userId_productId: {
                    userId: Number(session.userId),
                    productId: productId
                }
            }
        });

        if (existingReview) {
            return NextResponse.json({
                canReview: false,
                reason: 'ALREADY_REVIEWED',
                review: existingReview
            });
        }

        // Check if user purchased the product
        // An order that includes a variant of this product
        const purchase = await prisma.order.findFirst({
            where: {
                userId: Number(session.userId),
                // Status could be anything that implies a successful intent/delivery
                // For MVP, if they ordered it, they can review it.
                items: {
                    some: {
                        variant: {
                            productId: productId
                        }
                    }
                }
            }
        });

        if (!purchase) {
            return NextResponse.json({ canReview: false, reason: 'NOT_PURCHASED' });
        }

        return NextResponse.json({ canReview: true });
    } catch (error) {
        console.error('Check eligibility error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
