import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { sendEmail } from '@/lib/resend';
import { getWelcomeEmailHtml } from '@/lib/email-templates';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'E-posta adresi gereklidir.' }, { status: 400 });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

        if (!user) {
            // Güvenlik için kullanıcı bulunmasa bile başarılıymış gibi davranabiliriz 
            // ama burada 'Yeniden Gönder' butonu tıklandığı için kullanıcı varlığı muhtemelen biliniyor.
            return NextResponse.json({ success: true, message: 'Eğer hesap mevcutsa doğrulama e-postası gönderilmiştir.' });
        }

        if (user.isVerified) {
            return NextResponse.json({ error: 'Bu hesap zaten doğrulanmış.' }, { status: 400 });
        }

        // Yeni bir token oluştur veya mevcut olanı kullan
        const verificationToken = crypto.randomBytes(32).toString('hex');

        await prisma.user.update({
            where: { id: user.id },
            data: { verificationToken }
        });

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const verificationUrl = `${baseUrl}/api/auth/verify-email?token=${verificationToken}`;

        const { success, error } = await sendEmail({
            to: user.email,
            subject: 'Hesabınızı Doğrulayın (Yeni Bağlantı)',
            html: getWelcomeEmailHtml(user.firstName, verificationUrl)
        });

        if (!success) {
            return NextResponse.json({ error: 'E-posta gönderilemedi. Lütfen daha sonra tekrar deneyin.' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Doğrulama e-postası yeniden gönderildi.' });
    } catch (error) {
        console.error('Resend verification error:', error);
        return NextResponse.json({ error: 'İşlem sırasında bir hata oluştu.' }, { status: 500 });
    }
}
