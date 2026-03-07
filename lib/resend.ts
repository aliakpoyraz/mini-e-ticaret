import { Resend } from 'resend';

export const resend = process.env.RESEND_API_KEY
    ? new Resend(process.env.RESEND_API_KEY)
    : null;

interface SendEmailParams {
    to: string | string[];
    subject: string;
    html: string;
}

export const sendEmail = async ({ to, subject, html }: SendEmailParams) => {
    if (!resend) {
        if (process.env.NODE_ENV === 'development') {
            console.log('--- EMAIL MOCK ---');
            console.log('To:', to);
            console.log('Subject:', subject);
            console.log('--- END MOCK ---');
            return { success: true, mockSession: true };
        }
        console.warn('RESEND_API_KEY is not set. Email not sent.');
        return { success: false, error: 'API Key missing' };
    }

    try {
        const data = await resend.emails.send({
            from: 'Store <onboarding@resend.dev>',
            to,
            subject,
            html,
        });
        return { success: true, data };
    } catch (error) {
        console.error('Email send error:', error);
        return { success: false, error };
    }
};
