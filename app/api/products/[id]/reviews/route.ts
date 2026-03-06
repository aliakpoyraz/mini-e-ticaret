import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/app/lib/auth';
import { filterProfanity } from '@/lib/profanity-filter';

// Fetch all approved reviews for a product
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const productId = parseInt(id);
        const reviews = await (prisma as any).review.findMany({
            where: {
                productId,
                status: 'APPROVED'
            },
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ reviews });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// Post a new review
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const productId = parseInt(id);
        const body = await req.json();
        const { rating, comment } = body;

        if (!rating || rating < 1 || rating > 5) {
            return NextResponse.json({ error: 'Valid rating is required (1-5)' }, { status: 400 });
        }

        // Re-verify eligibility on server side
        const purchase = await (prisma as any).order.findFirst({
            where: {
                userId: session.userId,
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
            return NextResponse.json({ error: 'You must purchase this product to review it.' }, { status: 403 });
        }

        // Profanity Check
        let finalComment = comment;
        let finalStatus = 'APPROVED';

        if (comment) {
            const { censoredText, hasHeavyProfanity } = filterProfanity(comment);
            finalComment = censoredText;
            if (hasHeavyProfanity) {
                finalStatus = 'PENDING';
            }
        }

        const review = await (prisma as any).review.upsert({
            where: {
                userId_productId: {
                    userId: session.userId,
                    productId: productId
                }
            },
            update: {
                rating,
                comment: finalComment,
                status: finalStatus,
                updatedAt: new Date()
            },
            create: {
                userId: session.userId,
                productId,
                rating,
                comment: finalComment,
                status: finalStatus
            }
        });

        return NextResponse.json({
            success: true,
            review,
            message: finalStatus === 'PENDING' ? 'Yorumunuz ağır küfür içerdiği için admin onayına düştü.' : undefined
        });
    } catch (error) {
        console.error('Post review error:', error);
        return NextResponse.json({ error: 'Failed to post review' }, { status: 500 });
    }
}
