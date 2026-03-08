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

        if (!user) {
            console.log('Kullanıcı bulunamadı:', normalizedEmail);
            return NextResponse.json({ error: 'Bu e-posta adresi ile kayıtlı bir kullanıcı bulunamadı.' }, { status: 404 });
        }

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
            subject: 'Şifre Sıfırlama Talebi | YZL321 Store',
            html: getForgotPasswordEmailHtml(resetUrl)
        });

        return NextResponse.json({
            success: true,
            message: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderilmiştir.'
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json({ error: 'İşlem sırasında bir hata oluştu.' }, { status: 500 });
    }
}
