const brandColor = '#000000';
const secondaryColor = '#64748b';
const backgroundColor = '#f8fafc';

const layout = (content: string) => `
<div style="background-color: ${backgroundColor}; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
    <div style="padding: 40px;">
      <div style="margin-bottom: 32px; text-align: center;">
        <span style="font-size: 24px; font-weight: 800; letter-spacing: -0.025em; color: ${brandColor};">YZL321 <span style="font-weight: 300; color: ${secondaryColor};">STORE</span></span>
      </div>
      ${content}
      <div style="margin-top: 40px; padding-top: 32px; border-top: 1px solid #f1f5f9; text-align: center;">
        <p style="font-size: 12px; color: ${secondaryColor}; margin: 0;">
          © ${new Date().getFullYear()} YZL321 Store. Tüm hakları saklıdır.
        </p>
        <p style="font-size: 12px; color: ${secondaryColor}; margin: 8px 0 0 0;">
          Bu e-posta size YZL321 Store üzerinden yapılan bir işlem nedeniyle gönderilmiştir.
        </p>
      </div>
    </div>
  </div>
</div>
`;

export const getWelcomeEmailHtml = (name: string, verificationUrl: string) => layout(`
  <h1 style="font-size: 24px; font-weight: 700; color: #0f172a; margin: 0 0 16px 0; text-align: center;">
    Maceraya hazır mısın, ${name}?
  </h1>
  <p style="font-size: 16px; line-height: 24px; color: #475569; margin: 0 0 32px 0; text-align: center;">
    YZL321 Store ailesine hoş geldin! Seni aramızda gördüğümüz için çok mutluyuz. Hesabını aktive etmek ve özel koleksiyonlarımıza göz atmak için sabırsızlandığını biliyoruz.
  </p>
  <div style="text-align: center;">
    <a href="${verificationUrl}" style="display: inline-block; background-color: ${brandColor}; color: #ffffff; padding: 16px 32px; border-radius: 100px; text-decoration: none; font-weight: 600; font-size: 15px; transition: all 0.2s;">
      Hesabımı Doğrula
    </a>
  </div>
  <p style="font-size: 14px; color: #94a3b8; margin: 32px 0 0 0; text-align: center;">
    Link çalışmıyorsa bu adresi tarayıcına yapıştırabilirsin:<br>
    <span style="color: #3b82f6; word-break: break-all;">${verificationUrl}</span>
  </p>
`);

export const getForgotPasswordEmailHtml = (resetUrl: string) => layout(`
  <h1 style="font-size: 24px; font-weight: 700; color: #0f172a; margin: 0 0 16px 0; text-align: center;">
    Şifreni mi unuttun?
  </h1>
  <p style="font-size: 16px; line-height: 24px; color: #475569; margin: 0 0 32px 0; text-align: center;">
    Endişelenme, hepimizin başına gelir. Aşağıdaki butona tıklayarak güvenli bir şekilde yeni şifreni belirleyebilirsin.
  </p>
  <div style="text-align: center;">
    <a href="${resetUrl}" style="display: inline-block; background-color: ${brandColor}; color: #ffffff; padding: 16px 32px; border-radius: 100px; text-decoration: none; font-weight: 600; font-size: 15px;">
      Şifremi Sıfırla
    </a>
  </div>
  <p style="font-size: 14px; color: #94a3b8; margin: 32px 0 0 0; text-align: center;">
    Bu isteği sen yapmadıysanız bu e-postayı güvenle silebilirsin. Şifren değişmeyecektir.
  </p>
`);

export const getOrderConfirmationEmailHtml = (orderId: number, total: string, customerName: string) => layout(`
  <h1 style="font-size: 24px; font-weight: 700; color: #0f172a; margin: 0 0 16px 0; text-align: center;">
    Siparişiniz Alındı!
  </h1>
  <p style="font-size: 16px; line-height: 24px; color: #475569; margin: 0 0 32px 0; text-align: center;">
    Harika bir seçim, ${customerName}! Siparişini aldık ve ekibimiz hazırlıklara başladı. Stilini tamamlamak için sabırsızlandığını biliyoruz.
  </p>
  <div style="background-color: #f8fafc; border: 1px solid #f1f5f9; padding: 24px; border-radius: 16px; margin: 0 0 32px 0;">
    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
      <span style="color: #64748b; font-size: 14px;">Sipariş Numarası:</span>
      <span style="color: #0f172a; font-size: 14px; font-weight: 600;">#${orderId}</span>
    </div>
    <div style="display: flex; justify-content: space-between;">
      <span style="color: #64748b; font-size: 14px;">Toplam Tutar:</span>
      <span style="color: #0f172a; font-size: 14px; font-weight: 600;">${total} ₺</span>
    </div>
  </div>
  <p style="font-size: 16px; line-height: 24px; color: #475569; margin: 0; text-align: center;">
    Sipariş gelişimini hesabım üzerinden her an takip edebilirsin.
  </p>
`);

export const getOrderStatusUpdateEmailHtml = (orderId: number, statusLabel: string, customerName: string) => layout(`
  <h1 style="font-size: 24px; font-weight: 700; color: #0f172a; margin: 0 0 16px 0; text-align: center;">
    Siparişinde Güncelleme Var!
  </h1>
  <p style="font-size: 16px; line-height: 24px; color: #475569; margin: 0 0 32px 0; text-align: center;">
    Merhaba ${customerName}, #${orderId} numaralı siparişin için son durum bilgisini aşağıda bulabilirsin:
  </p>
  <div style="background-color: #f0f9ff; border: 1px solid #e0f2fe; padding: 24px; border-radius: 16px; text-align: center; margin: 0 0 32px 0;">
    <span style="color: #0369a1; font-weight: 700; font-size: 18px; text-transform: uppercase; letter-spacing: 0.05em;">${statusLabel}</span>
  </div>
  <p style="font-size: 16px; line-height: 24px; color: #475569; margin: 0; text-align: center;">
    Bizi tercih ettiğin için teşekkürler. Yeni stilinle parlamaya hazır ol!
  </p>
`);
