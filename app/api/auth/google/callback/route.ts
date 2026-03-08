import { OAuth2Client } from 'google-auth-library';
import { prisma } from '@/lib/prisma';
import { signToken, setAuthCookie } from '@/app/lib/auth';
import { NextResponse } from 'next/server';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL;

const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${baseUrl}/api/auth/google/callback`
);

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
        return NextResponse.redirect(`${baseUrl}/giris-yap?error=google_auth_failed`);
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

        let user = await (prisma as any).user.findUnique({
            where: { email: payload.email }
        });

        if (!user) {
            // Create user
            user = await (prisma as any).user.create({
                data: {
                    email: payload.email,
                    firstName: payload.given_name,
                    lastName: payload.family_name,
                    googleId: payload.sub,
                    isVerified: true,
                }
            });
        } else if (!user.googleId) {
            // Link existing user to Google
            user = await (prisma as any).user.update({
                where: { email: payload.email },
                data: { googleId: payload.sub, isVerified: true }
            });
        }

        const token = await signToken({
            userId: user.id,
            email: user.email,
            role: user.role
        });

        await setAuthCookie(token);

        return NextResponse.redirect(`${baseUrl}/`);
    } catch (error) {
        console.error('Google Auth Callback Error:', error);
        return NextResponse.redirect(`${baseUrl}/giris-yap?error=google_auth_failed`);
    }
}
