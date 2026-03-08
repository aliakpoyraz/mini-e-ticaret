import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { setAuthCookie, signToken } from '@/app/lib/auth';
import crypto from 'crypto';
import { sendEmail } from '@/lib/resend';
import { getWelcomeEmailHtml } from '@/lib/email-templates';

export async function POST(request: Request) {
    try {
        const { firstName, lastName, email, password, phone, captchaToken } = await request.json();

        if (!email || !password || !firstName || !lastName || !phone) {
            return NextResponse.json({ error: 'Lütfen tüm zorunlu alanları doldurun.' }, { status: 400 });
        }

        if (password.length < 6) {
            return NextResponse.json({ error: 'Şifreniz en az 6 karakter olmalıdır.' }, { status: 400 });
        }

        const hasLetter = /[a-zA-Z]/.test(password);
        const hasNumber = /\d/.test(password);
        if (!hasLetter || !hasNumber) {
            return NextResponse.json({ error: 'Şifreniz çok basit. Lütfen en az bir harf ve bir rakam kullanın.' }, { status: 400 });
        }

        if (!captchaToken) {
            return NextResponse.json({ error: 'Lütfen robot olmadığınızı doğrulayın' }, { status: 400 });
        }

        // reCAPTCHA jetonunu (token) doğrula
        const verifyResponse = await fetch(`https://www.google.com/recaptcha/api/siteverify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `secret=6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe&response=${captchaToken}`
        });
        const verifyData = await verifyResponse.json();

        if (!verifyData.success) {
            return NextResponse.json({ error: 'Güvenlik doğrulaması başarısız' }, { status: 400 });
        }

        const existingEmail = await prisma.user.findUnique({ where: { email } });
        if (existingEmail) {
            return NextResponse.json({ error: 'Bu e-posta adresi sistemde zaten kayıtlı.' }, { status: 400 });
        }

        const existingPhone = await prisma.user.findFirst({ where: { phone } });
        if (existingPhone) {
            return NextResponse.json({ error: 'Bu telefon numarası başka bir hesaba bağlı.' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = crypto.randomBytes(32).toString('hex');

        const user = await prisma.user.create({
            data: {
                firstName,
                lastName,
                email,
                password: hashedPassword,
                phone,
                role: 'USER',
                verificationToken,
                isVerified: false
            },
        });

        // Hoş Geldin/Doğrulama E-postası Gönder
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://e-ticaret.aliakpoyraz.com';
        const verificationUrl = `${baseUrl}/api/auth/verify-email?token=${verificationToken}`;
        await sendEmail({
            to: email,
            subject: 'Hoş Geldiniz: Hesabınızı Doğrulayın | YZL321 Store',
            html: getWelcomeEmailHtml(firstName, verificationUrl)
        });

        const token = await signToken({ userId: user.id, email: user.email, role: user.role });
        await setAuthCookie(token);

        return NextResponse.json({ success: true, user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role } });
    } catch (error) {
        console.error('Register error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
        // Prisma sekronizasyon hatası olma ihtimaline karşı ipucu ver
        if (errorMessage.includes('Unknown arg')) {
            return NextResponse.json({ error: 'Sunucu hatası: Lütfen terminalden dev serverı (npm run dev) kapatıp baştan başlatın. Veritabanı şeması güncellendiği için eski önbellek kullanılıyor.' }, { status: 500 });
        }
        return NextResponse.json({ error: `Kayıt sırasında bir hata oluştu.` }, { status: 500 });
    }
}
