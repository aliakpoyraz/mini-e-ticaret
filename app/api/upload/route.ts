import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // public/uploads klasörüne kaydet
        const uploadDir = join(process.cwd(), 'public/uploads');

        // Basit dosya adı oluşturma
        const filename = `${Date.now()}-${file.name.replace(/\s/g, '-')}`;
        const path = join(uploadDir, filename);

        await writeFile(path, buffer);

        return NextResponse.json({ url: `/uploads/${filename}` });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}
