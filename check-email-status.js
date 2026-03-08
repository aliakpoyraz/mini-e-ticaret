const { Resend } = require('resend');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const apiKey = process.env.RESEND_API_KEY;
const emailId = '1f43bda4-1583-4dab-a648-47f0184981c1'; // User's latest ID

async function checkStatus() {
    console.log('--- Resend Status Check ---');
    console.log('API Key:', apiKey ? 're_***' + apiKey.slice(-4) : 'YOK');
    console.log('Checking ID:', emailId);

    if (!apiKey) {
        console.error('Hata: RESEND_API_KEY bulunamadı!');
        return;
    }

    const resend = new Resend(apiKey);

    try {
        const result = await resend.emails.get(emailId);

        if (result.error) {
            console.error('Resend API Hatası (Get):', JSON.stringify(result.error, null, 2));
        } else {
            console.log('Email Verisi:', JSON.stringify(result.data, null, 2));
        }
    } catch (err) {
        console.error('Beklenmedik Hata:', err.message);
    }
}

checkStatus();
