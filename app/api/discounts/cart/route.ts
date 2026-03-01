import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const discounts = await prisma.discount.findMany({
            where: {
                active: true,
                productId: null
            },
            orderBy: { value: 'desc' }
        });
        return NextResponse.json(discounts);
    } catch (e) {
        return NextResponse.json([], { status: 500 });
    }
}
