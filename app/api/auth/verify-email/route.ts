import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://e-ticaret.aliakpoyraz.com';

    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get('token');

        if (!token) {
            return NextResponse.redirect(`${baseUrl}/giris-yap?error=${encodeURIComponent('Doğrulama kodu gereklidir.')}`);
        }

        const user = await prisma.user.findFirst({
            where: {
                verificationToken: token
            }
        });

        if (!user) {
            return NextResponse.redirect(`${baseUrl}/giris-yap?error=${encodeURIComponent('Geçersiz, süresi dolmuş veya daha önce kullanılmış doğrulama kodu.')}`);
        }

        await prisma.user.update({
            where: { id: user.id },
            data: {
                isVerified: true,
                verificationToken: null
            }
        });

        return NextResponse.redirect(`${baseUrl}/giris-yap?verified=true`);

    } catch (error) {
        console.error('Email verification error:', error);
        return NextResponse.redirect(`${baseUrl}/giris-yap?error=${encodeURIComponent('İşlem sırasında bir hata oluştu.')}`);
    }
}
