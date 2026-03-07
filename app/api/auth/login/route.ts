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

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return NextResponse.json({ error: 'E-posta veya şifre hatalı' }, { status: 401 });
        }

        if (user.isBanned) {
            return NextResponse.json({ error: 'Hesabınız yasaklanmıştır. Lütfen yönetici ile iletişime geçin.' }, { status: 403 });
        }

        if (!user.isVerified) {
            return NextResponse.json({ error: 'Lütfen e-posta adresinizi doğrulayın.' }, { status: 403 });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return NextResponse.json({ error: 'E-posta veya şifre hatalı' }, { status: 401 });
        }

        const token = await signToken({ userId: user.id, email: user.email, role: user.role });
        await setAuthCookie(token);

        return NextResponse.json({ success: true, user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role } });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Giriş sırasında bir hata oluştu' }, { status: 500 });
    }
}
