import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    console.log('--- RESET PASSWORD API START ---');
    try {
        const body = await request.json();
        console.log('Gelen istek gövdesi anahtarları:', Object.keys(body));
        const { token, password } = body;

        if (!token || !password) {
            console.warn('Eksik bilgi: token veya password bulunamadı.');
            return NextResponse.json({ error: 'Token ve yeni şifre gereklidir.' }, { status: 400 });
        }

        if (password.length < 6) {
            return NextResponse.json({ error: 'Şifreniz en az 6 karakter olmalıdır.' }, { status: 400 });
        }

        console.log('[ResetPassword] Token kontrol ediliyor:', token);
        const user = await prisma.user.findFirst({
            where: {
                resetToken: token,
                resetTokenExpiry: {
                    gt: new Date()
                }
            }
        });

        if (!user) {
            console.warn('[ResetPassword] Geçersiz veya süresi dolmuş token.');
            return NextResponse.json({ error: 'Geçersiz veya süresi dolmuş bağlantı.' }, { status: 400 });
        }

        console.log('[ResetPassword] Kullanıcı bulundu:', user.email);
        const hashedPassword = await bcrypt.hash(password, 10);

        console.log('[ResetPassword] Şifre güncelleniyor...');
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null
            }
        });

        console.log('[ResetPassword] Şifre başarıyla güncellendi.');
        return NextResponse.json({ success: true, message: 'Şifreniz başarıyla güncellenmiştir.' });
    } catch (error) {
        console.error('[ResetPassword] Hata detayı:', error);
        return NextResponse.json({
            error: 'İşlem sırasında bir hata oluştu.',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
