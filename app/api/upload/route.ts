import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';

import { getSession } from '@/app/lib/auth';

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Vercel Blob'a yükle (public)
        const filename = `${Date.now()}-${file.name.replace(/\s/g, '-')}`;
        const blob = await put(filename, buffer, {
            access: 'public',
            contentType: file.type || 'image/jpeg'
        });

        // Blob URL'sini geri döndür
        return NextResponse.json({ url: blob.url });
    } catch (error) {
        console.error("Vercel Blob Upload error:", error);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}
