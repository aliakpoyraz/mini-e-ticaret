import { NextResponse } from 'next/server';

export async function GET() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/google/callback`;
    const scope = 'openid email profile';

    if (!clientId || !process.env.NEXT_PUBLIC_BASE_URL) {
        return NextResponse.json({ error: 'Missing Google Auth Configuration' }, { status: 500 });
    }

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent`;

    return NextResponse.redirect(googleAuthUrl);
}
