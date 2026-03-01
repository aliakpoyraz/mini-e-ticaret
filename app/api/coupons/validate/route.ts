import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { code, cartTotal } = body;

        if (!code) {
            return NextResponse.json({ error: 'Kupon kodu eksik.' }, { status: 400 });
        }

        const coupon = await prisma.coupon.findUnique({
            where: { code: code.toUpperCase() }
        });

        if (!coupon) {
            return NextResponse.json({ error: 'Geçersiz kupon kodu.' }, { status: 404 });
        }

        if (!coupon.active) {
            return NextResponse.json({ error: 'Bu kupon aktif değil.' }, { status: 400 });
        }

        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
            return NextResponse.json({ error: 'Bu kuponun kullanım sınırı dolmuş.' }, { status: 400 });
        }

        if (coupon.minCartValue && cartTotal < Number(coupon.minCartValue)) {
            return NextResponse.json({ error: `Bu kupon min. ${Number(coupon.minCartValue).toFixed(2)} ₺ tutarında sepetlerde geçerlidir.` }, { status: 400 });
        }

        return NextResponse.json({ coupon });

    } catch (error) {
        console.error('Kupon doğrulama hatası:', error);
        return NextResponse.json({ error: 'Sunucu hatası oluştu.' }, { status: 500 });
    }
}
