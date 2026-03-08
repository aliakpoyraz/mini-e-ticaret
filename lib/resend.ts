import { Resend } from 'resend';

interface SendEmailParams {
    to: string | string[];
    subject: string;
    html: string;
}

const getResendClient = () => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        console.error('RESEND_API_KEY is missing from environment variables!');
        return null;
    }
    // Debug için anahtarın başlangıcını logla (güvenli bir şekilde)
    console.log(`[Resend] API Key yüklendi (Format: ${apiKey.slice(0, 7)}...)`);
    return new Resend(apiKey);
};

export const sendEmail = async ({ to, subject, html }: SendEmailParams) => {
    console.log(`[Resend] E-posta gönderme isteği alındı. Konu: ${subject}`);
    const resendClient = getResendClient();

    if (!resendClient) {
        console.error(`[Resend] KRİTİK HATA: Resend istemcisi oluşturulamadı! (API_KEY eksik olabilir)`);
        if (process.env.NODE_ENV === 'development') {
            console.log('--- EMAIL MOCK (Dev Mode) ---');
            console.log('To:', to);
            console.log('Subject:', subject);
            return { success: true, mock: true };
        }
        return { success: false, error: 'RESEND_API_KEY missing' };
    }

    try {
        const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
        console.log(`[Resend] Paket Hazırlanıyor:`);
        console.log(` - Kimden: ${fromEmail}`);
        console.log(` - Kime: ${JSON.stringify(to)}`);
        console.log(` - Konu: ${subject}`);
        console.log(` - HTML Uzunluğu: ${html.length} karakter`);

        const { data, error } = await resendClient.emails.send({
            from: fromEmail,
            to: Array.isArray(to) ? to : [to],
            subject,
            html,
        });

        if (error) {
            console.error('[Resend] API HATASI:', JSON.stringify(error, null, 2));
            return { success: false, error };
        }

        console.log('[Resend] BAŞARI: E-posta sıraya alındı. ID:', data?.id);
        return { success: true, data };
    } catch (error: any) {
        console.error('[Resend] BEKLENMEDİK HATA:', error.message || error);
        if (error.stack) console.error(error.stack);
        return { success: false, error: error.message || error };
    }
};
