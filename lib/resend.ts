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
        console.log(`Email gönderiliyor: ${to}, Konu: ${subject}`);
        const { data, error } = await resendClient.emails.send({
            from: 'onboarding@resend.dev',
            to: Array.isArray(to) ? to : [to],
            subject,
            html,
        });

        if (error) {
            console.error('Resend API Hatası:', error);
            return { success: false, error };
        }

        console.log('Email başarıyla gönderildi ID:', data?.id);
        return { success: true, data };
    } catch (error) {
        console.error('Email gönderimi sırasında beklenmedik hata:', error);
        return { success: false, error };
    }
};
