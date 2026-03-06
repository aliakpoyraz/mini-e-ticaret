import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { getSession } from '@/app/lib/auth';

export async function GET() {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.userId },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
        }

        return NextResponse.json({ user });
    } catch (error) {
        console.error('Profile GET error:', error);
        return NextResponse.json({ error: 'Bilgiler alınırken bir hata oluştu' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
        }

        const data = await request.json();
        const { firstName, lastName, email, phone, currentPassword, newPassword } = data;

        const user = await prisma.user.findUnique({ where: { id: session.userId } });
        if (!user) {
            return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
        }

        const updateData: any = { firstName, lastName, email, phone };

        // Password change logic
        if (currentPassword && newPassword) {
            const passwordMatch = await bcrypt.compare(currentPassword, user.password);
            if (!passwordMatch) {
                return NextResponse.json({ error: 'Mevcut şifreniz yanlış' }, { status: 400 });
            }
            if (newPassword.length < 6) {
                return NextResponse.json({ error: 'Yeni şifreniz en az 6 karakter olmalıdır' }, { status: 400 });
            }
            updateData.password = await bcrypt.hash(newPassword, 10);
        }

        // Email duplicates check
        if (email !== user.email) {
            const emailExists = await prisma.user.findUnique({ where: { email } });
            if (emailExists) {
                return NextResponse.json({ error: 'Bu e-posta adresi başka bir hesap tarafından kullanılıyor' }, { status: 400 });
            }
        }

        // Phone duplicates check
        if (phone && phone !== user.phone) {
            const phoneExists = await prisma.user.findFirst({ where: { phone } });
            if (phoneExists) {
                return NextResponse.json({ error: 'Bu telefon numarası başka bir hesaba bağlı' }, { status: 400 });
            }
        }

        const updatedUser = await prisma.user.update({
            where: { id: session.userId },
            data: updateData,
            select: { id: true, firstName: true, lastName: true, email: true, phone: true }
        });

        return NextResponse.json({ success: true, user: updatedUser });
    } catch (error) {
        console.error('Profile PUT error:', error);
        return NextResponse.json({ error: 'Profil güncellenirken bir hata oluştu' }, { status: 500 });
    }
}
