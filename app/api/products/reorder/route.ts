import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/app/lib/auth';

export async function PUT(request: Request) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { orderedIds } = body;

        if (!Array.isArray(orderedIds)) {
            return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
        }

        // Update each product's sortOrder in a transaction
        await prisma.$transaction(
            orderedIds.map((id: number, index: number) =>
                prisma.product.update({
                    where: { id },
                    data: { sortOrder: index }
                })
            )
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Reorder Error:", error);
        return NextResponse.json({ error: "Failed to reorder products" }, { status: 500 });
    }
}
