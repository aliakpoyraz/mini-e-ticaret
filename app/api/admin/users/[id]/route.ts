import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/app/lib/auth';

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    try {
        const bcrypt = require('bcryptjs');

        // Eski şifreyi kontrol etmek için mevcut kullanıcıyı getir
        const currentUser = await prisma.user.findUnique({
            where: { id: Number(id) }
        });

        if (!currentUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const data: any = {
            firstName: body.firstName,
            lastName: body.lastName,
            phone: body.phone,
            email: body.email,
        };

        // Şifre değiştirilmeye çalışılıyorsa, önce eski şifreyi doğrula
        if (body.password) {
            if (!body.oldPassword) {
                return NextResponse.json({ error: 'Eski şifre zorunludur' }, { status: 400 });
            }

            const isOldPasswordCorrect = await bcrypt.compare(body.oldPassword, currentUser.password);
            if (!isOldPasswordCorrect) {
                return NextResponse.json({ error: 'Eski şifre hatalı' }, { status: 400 });
            }

            data.password = await bcrypt.hash(body.password, 10);
        }

        // Rol veya yasaklama durumunu değiştirmeye sadece adminlerin yetkisi var
        if (session.role === 'ADMIN') {
            if (body.role) data.role = body.role;
            if (body.isBanned !== undefined) data.isBanned = body.isBanned;
        }

        const user = await prisma.user.update({
            where: { id: Number(id) },
            data
        });

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role
            }
        });
    } catch (error) {
        console.error('User update error:', error);
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }
}
