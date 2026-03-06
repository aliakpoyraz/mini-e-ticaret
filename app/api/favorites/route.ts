import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/app/lib/auth';

export async function GET() {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const favorites = await prisma.favorite.findMany({
        where: { userId: session.userId },
        include: {
            product: {
                include: {
                    variants: true,
                    discounts: { where: { active: true } }
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ favorites });
}

export async function POST(request: Request) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { productId } = await request.json();

        const existingFavorite = await prisma.favorite.findUnique({
            where: {
                userId_productId: {
                    userId: session.userId,
                    productId: productId
                }
            }
        });

        if (existingFavorite) {
            await prisma.favorite.delete({
                where: { id: existingFavorite.id }
            });
            return NextResponse.json({ success: true, isFavorite: false });
        } else {
            await prisma.favorite.create({
                data: {
                    userId: session.userId,
                    productId: productId
                }
            });
            return NextResponse.json({ success: true, isFavorite: true });
        }
    } catch (error) {
        console.error('Favorite toggle error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
