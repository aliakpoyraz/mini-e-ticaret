import { NextResponse } from 'next/server';
import { getSession } from '@/app/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: Number(session.userId) },
            select: { id: true, firstName: true, lastName: true, email: true, role: true, isBanned: true }
        });
        if (!user || user.isBanned) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        return NextResponse.json({ user });
    } catch {
        // Fallback to session data if DB lookup fails
        return NextResponse.json({ user: session });
    }
}
