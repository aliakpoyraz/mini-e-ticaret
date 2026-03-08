const { Resend } = require('resend');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const apiKey = process.env.RESEND_API_KEY;

async function checkApiKey() {
    console.log('--- Resend API Key Info ---');
    if (!apiKey) {
        console.error('Hata: RESEND_API_KEY bulunamadı!');
        return;
    }

    const resend = new Resend(apiKey);

    try {
        // List API keys associated with this key
        const result = await resend.apiKeys.list();

        if (result.error) {
            console.error('Resend API Hatası (API Keys):', JSON.stringify(result.error, null, 2));
        } else {
            console.log('API Anahtarları:');
            result.data.data.forEach(k => {
                const current = apiKey.endsWith(k.id.slice(-4)) ? ' (MUHTEMELEN BU)' : '';
                console.log(`- Ad: ${k.name} | ID: ${k.id}${current} | Oluşturulma: ${k.created_at}`);
            });
        }

        // Also check domains
        const domainResult = await resend.domains.list();
        if (domainResult.data) {
            console.log('\nOnaylı Domainler:');
            domainResult.data.data.forEach(d => {
                console.log(`- Domain: ${d.name} | Durum: ${d.status} | Bölge: ${d.region}`);
            });
        }

    } catch (err) {
        console.error('Beklenmedik Hata:', err.message);
    }
}

checkApiKey();
