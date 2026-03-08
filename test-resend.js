const { Resend } = require('resend');
const dotenv = require('dotenv');
const path = require('path');

// .env dosyasını yükle
dotenv.config({ path: path.join(__dirname, '.env') });

const apiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
const toEmail = 'aliakpoyraz@gmail.com';

async function testEmail() {
    console.log('--- Resend Test (JS) Başlıyor ---');
    console.log('API Key:', apiKey ? 're_***' + apiKey.slice(-4) : 'YOK');
    console.log('From Email:', fromEmail);
    console.log('To Email:', toEmail);

    if (!apiKey) {
        console.error('Hata: RESEND_API_KEY bulunamadı!');
        return;
    }

    const resend = new Resend(apiKey);

    try {
        console.log('E-posta gönderiliyor...');
        const result = await resend.emails.send({
            from: fromEmail,
            to: [toEmail],
            subject: 'YZL321 Store | Manuel Test E-postası',
            html: '<p>Bu manuel bir test e-postasıdır.</p>'
        });

        if (result.error) {
            console.error('Resend API Hatası:', JSON.stringify(result.error, null, 2));
        } else {
            console.log('Başarı! Veri:', JSON.stringify(result.data, null, 2));
        }
    } catch (err) {
        console.error('Beklenmedik Hata:', err.message);
    }
}

testEmail();
