import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { sendEmail } from '@/lib/resend';
import { getForgotPasswordEmailHtml } from '@/lib/email-templates';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'E-posta adresi gereklidir.' }, { status: 400 });
        }

        const normalizedEmail = email.toLowerCase().trim();
        console.log('Şifre sıfırlama isteği e-posta:', normalizedEmail);
        const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

        if (user) {
            console.log('Kullanıcı bulundu, token oluşturuluyor...');
            const token = crypto.randomBytes(32).toString('hex');
            const expiry = new Date(Date.now() + 3600000); // 1 hour

            await prisma.user.update({
                where: { id: user.id },
                data: {
                    resetToken: token,
                    resetTokenExpiry: expiry
                }
            });

            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://e-ticaret.aliakpoyraz.com';
            const resetUrl = `${baseUrl}/sifre-sifirla?token=${token}`;

            await sendEmail({
                to: email,
                subject: 'Şifre Sıfırlama İstediği',
                html: getForgotPasswordEmailHtml(resetUrl)
            });
        }

        // Güvenlik nedeniyle kullanıcı bulunmasa bile başarılı mesajı dönüyoruz
        return NextResponse.json({
            success: true,
            message: 'Eğer bu e-posta adresi sistemde kayıtlıysa, şifre sıfırlama bağlantısı gönderilmiştir.'
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json({ error: 'İşlem sırasında bir hata oluştu.' }, { status: 500 });
    }
}
