import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secretKey = process.env.JWT_SECRET || 'secret-key-too-short-for-production-but-ok-for-mvp';
const key = new TextEncoder().encode(secretKey);

export async function middleware(request: NextRequest) {
    const sessionToken = request.cookies.get('session')?.value;
    const { pathname } = request.nextUrl;

    // Protect /admin routes (pages and APIs)
    if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
        if (!sessionToken) {
            if (pathname.startsWith('/api/')) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
            return NextResponse.redirect(new URL('/admin-login', request.url));
        }

        try {
            const { payload } = await jwtVerify(sessionToken, key);

            // If valid JWT but not an admin
            if (payload.role !== 'ADMIN') {
                if (pathname.startsWith('/api/')) {
                    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
                }
                return NextResponse.redirect(new URL('/admin-login', request.url));
            }
        } catch (error) {
            // Invalid token
            if (pathname.startsWith('/api/')) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
            return NextResponse.redirect(new URL('/admin-login', request.url));
        }
    }

    // Protect /api/user routes (General user session check)
    if (pathname.startsWith('/api/user')) {
        if (!sessionToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        try {
            await jwtVerify(sessionToken, key);
        } catch (error) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/api/admin/:path*', '/api/user/:path*'],
};
