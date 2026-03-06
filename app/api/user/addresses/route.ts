import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/app/lib/auth';

export async function GET() {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });

        const addresses = await prisma.address.findMany({
            where: { userId: Number(session.userId) },
            orderBy: [
                { isDefault: 'desc' },
                { createdAt: 'desc' }
            ]
        });

        return NextResponse.json({ addresses });
    } catch (error: any) {
        console.error('Addresses GET error:', error?.message || error);
        return NextResponse.json({ error: 'Adresler alınırken hata oluştu: ' + (error?.message || '') }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });

        const data = await request.json();
        const { title, address, city, country, zipCode, isDefault } = data;

        if (!title || !address || !city) {
            return NextResponse.json({ error: 'Başlık, adres ve şehir zorunludur' }, { status: 400 });
        }

        // Check if it's the first address to auto-make default
        const existingCount = await prisma.address.count({ where: { userId: Number(session.userId) } });
        const shouldBeDefault = existingCount === 0 ? true : Boolean(isDefault);

        if (shouldBeDefault && existingCount > 0) {
            await prisma.address.updateMany({
                where: { userId: Number(session.userId) },
                data: { isDefault: false }
            });
        }

        const newAddress = await prisma.address.create({
            data: {
                userId: Number(session.userId),
                title,
                address,
                city,
                country: country || 'Türkiye',
                zipCode,
                isDefault: shouldBeDefault
            }
        });

        return NextResponse.json({ success: true, address: newAddress });
    } catch (error) {
        return NextResponse.json({ error: 'Adres eklenirken hata oluştu' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });

        const data = await request.json();
        const { id, title, address, city, country, zipCode, isDefault } = data;

        if (!id) return NextResponse.json({ error: 'Adres ID eksik' }, { status: 400 });

        const existing = await prisma.address.findFirst({ where: { id: Number(id), userId: Number(session.userId) } });
        if (!existing) return NextResponse.json({ error: 'Adres bulunamadı' }, { status: 404 });

        if (isDefault) {
            await prisma.address.updateMany({
                where: { userId: Number(session.userId), id: { not: Number(id) } },
                data: { isDefault: false }
            });
        }

        const updated = await prisma.address.update({
            where: { id },
            data: { title, address, city, country, zipCode, isDefault }
        });

        return NextResponse.json({ success: true, address: updated });
    } catch (error) {
        return NextResponse.json({ error: 'Adres güncellenirken hata oluştu' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });

        const url = new URL(request.url);
        const id = Number(url.searchParams.get('id'));

        if (!id) return NextResponse.json({ error: 'Geçersiz ID' }, { status: 400 });

        await prisma.address.deleteMany({
            where: { id: Number(id), userId: Number(session.userId) }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Adres silinirken hata oluştu' }, { status: 500 });
    }
}
