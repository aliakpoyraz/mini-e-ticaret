import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { setAuthCookie, signToken } from '@/app/lib/auth';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'E-posta ve şifre zorunludur' }, { status: 400 });
        }

        let user = await prisma.user.findUnique({ where: { email } });

        // Auto-create admin if it doesn't exist and credentials match MVP default
        if (!user && email === 'admin@store.com' && password === 'admin123') {
            const hashedPassword = await bcrypt.hash(password, 10);
            user = await prisma.user.create({
                data: {
                    email,
                    firstName: 'Admin',
                    password: hashedPassword,
                    role: 'ADMIN'
                }
            });
        }

        if (!user) {
            return NextResponse.json({ error: 'E-posta veya şifre hatalı' }, { status: 401 });
        }

        if (user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Bu alana erişim yetkiniz yok' }, { status: 403 });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return NextResponse.json({ error: 'E-posta veya şifre hatalı' }, { status: 401 });
        }

        const token = await signToken({ userId: user.id, email: user.email, role: user.role });
        await setAuthCookie(token);

        return NextResponse.json({ success: true, user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role } });
    } catch (error) {
        console.error('Admin login error:', error);
        return NextResponse.json({ error: 'Giriş sırasında bir hata oluştu' }, { status: 500 });
    }
}
