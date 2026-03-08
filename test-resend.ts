import { Resend } from 'resend';
import * as dotenv from 'dotenv';
import * as path from 'path';

// .env dosyasını yükle
dotenv.config({ path: path.join(__dirname, '.env') });

const apiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
const toEmail = 'aliakpoyraz@gmail.com'; // User's email for testing

async function testEmail() {
    console.log('--- Resend Test Başlıyor ---');
    console.log('API Key:', apiKey ? '***' + apiKey.slice(-4) : 'YOK');
    console.log('From Email:', fromEmail);
    console.log('To Email:', toEmail);

    if (!apiKey) {
        console.error('Hata: RESEND_API_KEY bulunamadı!');
        return;
    }

    const resend = new Resend(apiKey);

    try {
        console.log('E-posta gönderiliyor...');
        const { data, error } = await resend.emails.send({
            from: fromEmail,
            to: [toEmail],
            subject: 'YZL321 Store | Test E-postası',
            html: '<p>Bu bir test e-postasıdır. Eğer bunu görüyorsanız Resend yapılandırması doğru çalışıyor demektir.</p>'
        });

        if (error) {
            console.error('Resend API Hatası:', JSON.stringify(error, null, 2));
        } else {
            console.log('Başarı! E-posta ID:', data?.id);
        }
    } catch (err) {
        console.error('Beklenmedik Hata:', err);
    }
}

testEmail();
