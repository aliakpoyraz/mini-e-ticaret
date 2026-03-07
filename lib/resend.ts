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
    return new Resend(apiKey);
};

export const sendEmail = async ({ to, subject, html }: SendEmailParams) => {
    const resendClient = getResendClient();

    if (!resendClient) {
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
        console.log(`[Resend] E-posta paketi hazırlanıyor...`);
        console.log(`[Resend] Kimden: ${fromEmail}`);
        console.log(`[Resend] Kime: ${to}`);
        console.log(`[Resend] Konu: ${subject}`);

        const { data, error } = await resendClient.emails.send({
            from: fromEmail,
            to: Array.isArray(to) ? to : [to],
            subject,
            html,
        });

        if (error) {
            console.error('[Resend] API Hatası Yanıtı:', JSON.stringify(error, null, 2));
            return { success: false, error };
        }

        console.log('[Resend] E-posta başarıyla sıraya alındı. ID:', data?.id);
        return { success: true, data };
    } catch (error) {
        console.error('[Resend] Beklenmedik Hata:', error);
        return { success: false, error };
    }
};
