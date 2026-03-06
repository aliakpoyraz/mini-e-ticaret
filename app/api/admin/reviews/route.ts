import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/app/lib/auth';

// Fetch all reviews for admin
export async function GET(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const reviews = await (prisma as any).review.findMany({
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                },
                product: {
                    select: {
                        name: true,
                        imageUrl: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ reviews });
    } catch (error) {
        console.error('Admin Fetch Reviews Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// Update review status
export async function PATCH(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { reviewId, status } = body;

        if (!['APPROVED', 'REJECTED', 'PENDING'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const review = await (prisma as any).review.update({
            where: { id: reviewId },
            data: { status }
        });

        return NextResponse.json({ success: true, review });
    } catch (error) {
        console.error('Admin Update Review Error:', error);
        return NextResponse.json({ error: 'Failed to update review status' }, { status: 500 });
    }
}
