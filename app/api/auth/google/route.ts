import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    let baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || '').replace(/\/$/, '');
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = `${baseUrl}/api/auth/google/callback`;
    const scope = 'openid email profile';

    if (!clientId || !baseUrl) {
        console.error('Google Auth Configuration Missing:', {
            hasClientId: !!clientId,
            hasBaseUrl: !!baseUrl,
            baseUrlValue: baseUrl,
            envKeys: Object.keys(process.env).filter(k => k.includes('URL') || k.includes('GOOGLE'))
        });
        return NextResponse.json({ error: 'Missing Google Auth Configuration' }, { status: 500 });
    }

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent`;

    return NextResponse.redirect(googleAuthUrl);
}
