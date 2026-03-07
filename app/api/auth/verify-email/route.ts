import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get('token');

        if (!token) {
            return NextResponse.json({ error: 'Doğrulama kodu gereklidir.' }, { status: 400 });
        }

        const user = await prisma.user.findFirst({
            where: {
                verificationToken: token
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'Geçersiz doğrulama kodu.' }, { status: 400 });
        }

        await prisma.user.update({
            where: { id: user.id },
            data: {
                isVerified: true,
                verificationToken: null
            }
        });

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        return NextResponse.redirect(`${baseUrl}/giris-yap?verified=true`);

    } catch (error) {
        console.error('Email verification error:', error);
        return NextResponse.json({ error: 'İşlem sırasında bir hata oluştu.' }, { status: 500 });
    }
}
