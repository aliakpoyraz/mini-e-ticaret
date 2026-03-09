import { OAuth2Client } from 'google-auth-library';
import { prisma } from '@/lib/prisma';
import { signToken, setAuthCookie } from '@/app/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || '').replace(/\/$/, '');
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${baseUrl}/api/auth/google/callback`;

    const client = new OAuth2Client(
        clientId,
        clientSecret,
        redirectUri
    );

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code || !baseUrl) {
        console.error('Google Auth Callback: Missing code or baseUrl', { hasCode: !!code, baseUrl });
        return NextResponse.redirect(`${baseUrl || ''}/giris-yap?error=google_auth_failed`);
    }

    try {
        const { tokens } = await client.getToken(code);
        const ticket = await client.verifyIdToken({
            idToken: tokens.id_token!,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();

        if (!payload || !payload.email) {
            throw new Error('Google payload missing');
        }

        // Önce Google ID ile kullanıcıyı ara
        let user = await (prisma as any).user.findUnique({
            where: { googleId: payload.sub }
        });

        if (!user) {
            // Google ID ile bulunamadıysa e-posta ile kontrol et
            user = await (prisma as any).user.findUnique({
                where: { email: payload.email }
            });

            if (user) {
                // E-posta ile bulundu, mevcut hesaba Google ID ekle (hesap birleştirme)
                user = await (prisma as any).user.update({
                    where: { id: user.id },
                    data: { googleId: payload.sub, isVerified: true }
                });
            } else {
                // Hiçbir şekilde bulunamadı, yeni kullanıcı oluştur
                user = await (prisma as any).user.create({
                    data: {
                        email: payload.email,
                        firstName: payload.given_name,
                        lastName: payload.family_name,
                        googleId: payload.sub,
                        isVerified: true,
                        role: 'USER'
                    }
                });
            }
        }

        const token = await signToken({
            userId: user.id,
            email: user.email,
            role: user.role
        });

        await setAuthCookie(token);

        return NextResponse.redirect(`${baseUrl}/`);
    } catch (error: any) {
        console.error('Google Auth Callback Detailed Error:', {
            message: error.message,
            stack: error.stack,
            clientId: process.env.GOOGLE_CLIENT_ID ? 'Configured' : 'Missing',
            hasPayload: error.message === 'Google payload missing'
        });
        return NextResponse.redirect(`${baseUrl}/giris-yap?error=google_auth_failed`);
    }
}
