const { Resend } = require('resend');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const apiKey = process.env.RESEND_API_KEY;

async function listEmails() {
    console.log('--- Resend Recent Emails List ---');
    if (!apiKey) {
        console.error('Hata: RESEND_API_KEY bulunamadı!');
        return;
    }

    const resend = new Resend(apiKey);

    try {
        const result = await resend.emails.list();

        if (result.error) {
            console.error('Resend API Hatası (List):', JSON.stringify(result.error, null, 2));
        } else {
            console.log('Son Mailler:');
            result.data.data.forEach(m => {
                console.log(`- [${m.created_at}] ID: ${m.id} | To: ${m.to} | Subject: ${m.subject}`);
            });
        }
    } catch (err) {
        console.error('Beklenmedik Hata:', err.message);
    }
}

listEmails();
