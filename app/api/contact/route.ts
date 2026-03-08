import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/resend';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { firstName, lastName, email, phone, subject, message } = body;

        if (!firstName || !lastName || !email || !phone || !subject || !message) {
            return NextResponse.json(
                { error: 'Tüm alanlar zorunludur.' },
                { status: 400 }
            );
        }

        // Server-side validation
        const nameRegex = /^[a-zA-ZğüşıöçĞÜŞİÖÇ ]+$/;
        const phoneRegex = /^[0-9]{10,15}$/;

        if (!nameRegex.test(firstName)) {
            return NextResponse.json({ error: 'Geçersiz ad formatı. Sadece harf kullanın.' }, { status: 400 });
        }
        if (!nameRegex.test(lastName)) {
            return NextResponse.json({ error: 'Geçersiz soyad formatı. Sadece harf kullanın.' }, { status: 400 });
        }
        if (!phoneRegex.test(phone.replace(/[^0-9]/g, ''))) {
            return NextResponse.json({ error: 'Geçersiz telefon numarası. Sadece rakam kullanın (en az 10 hane).' }, { status: 400 });
        }

        const adminEmail = process.env.RESEND_FROM_EMAIL || 'bilgi@e-ticaret.aliakpoyraz.com';

        const emailHtml = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; border: 1px solid #eee;">
                    <h2 style="color: #1a1a1a; margin-top: 0;">Yeni İletişim Formu Mesajı</h2>
                    <p style="margin-bottom: 20px;">Sitenizden yeni bir iletişim formu gönderildi. Detaylar aşağıdadır:</p>
                    
                    <div style="margin-bottom: 15px;">
                        <strong style="color: #666;">Gönderen:</strong><br/>
                        <span style="font-size: 16px;">${firstName} ${lastName}</span>
                    </div>

                    <div style="margin-bottom: 15px;">
                        <strong style="color: #666;">E-posta:</strong><br/>
                        <span style="font-size: 16px;">${email}</span>
                    </div>

                    <div style="margin-bottom: 15px;">
                        <strong style="color: #666;">Telefon:</strong><br/>
                        <span style="font-size: 16px;">${phone}</span>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <strong style="color: #666;">Konu:</strong><br/>
                        <span style="font-size: 16px;">${subject}</span>
                    </div>
                    
                    <div style="margin-bottom: 25px;">
                        <strong style="color: #666;">Mesaj:</strong><br/>
                        <div style="font-size: 16px; background-color: #fff; padding: 15px; border-radius: 8px; border: 1px solid #eee; white-space: pre-wrap;">${message}</div>
                    </div>
                    
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;"/>
                    <p style="font-size: 12px; color: #999; text-align: center;">Bu e-posta YZL321 Store iletişim formu aracılığıyla gönderilmiştir.</p>
                </div>
            </div>
        `;

        const result = await sendEmail({
            to: adminEmail,
            subject: `[İletişim Formu] ${subject} - ${firstName} ${lastName}`,
            html: emailHtml,
        });

        if (!result.success) {
            console.error('[Contact API] Email sending failed:', result.error);
            return NextResponse.json(
                { error: 'E-posta gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, message: 'Mesajınız başarıyla gönderildi.' });
    } catch (error: any) {
        console.error('[Contact API] Internal Error:', error);
        return NextResponse.json(
            { error: 'Sunucu hatası oluştu.' },
            { status: 500 }
        );
    }
}
