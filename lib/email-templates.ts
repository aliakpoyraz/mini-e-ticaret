export const getWelcomeEmailHtml = (name: string, verificationUrl: string) => `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; rounded: 12px;">
  <h1 style="color: #111827; font-size: 24px; font-weight: bold; margin-bottom: 16px;">Hoş Geldiniz, ${name}!</h1>
  <p style="color: #4b5563; font-size: 16px; line-height: 24px; margin-bottom: 24px;">
    Hesabınızı doğrulamak ve alışverişe başlamak için lütfen aşağıdaki butona tıklayın.
  </p>
  <a href="${verificationUrl}" style="display: inline-block; background-color: #000; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
    E-postamı Doğrula
  </a>
  <p style="color: #9ca3af; font-size: 12px; margin-top: 32px;">
    Eğer bu hesabı siz oluşturmadıysanız, bu e-postayı görmezden gelebilirsiniz.
  </p>
</div>
`;

export const getForgotPasswordEmailHtml = (resetUrl: string) => `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; rounded: 12px;">
  <h1 style="color: #111827; font-size: 24px; font-weight: bold; margin-bottom: 16px;">Şifre Sıfırlama İstediği</h1>
  <p style="color: #4b5563; font-size: 16px; line-height: 24px; margin-bottom: 24px;">
    Şifrenizi sıfırlamak için bir istekte bulundunuz. Aşağıdaki butona tıklayarak yeni bir şifre belirleyebilirsiniz.
  </p>
  <a href="${resetUrl}" style="display: inline-block; background-color: #000; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
    Şifremi Sıfırla
  </a>
  <p style="color: #9ca3af; font-size: 12px; margin-top: 32px;">
    Bu isteği siz yapmadıysanız, şifreniz güvendedir ve hiçbir işlem yapmanıza gerek yoktur.
  </p>
</div>
`;

export const getOrderConfirmationEmailHtml = (orderId: number, total: string, customerName: string) => `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; rounded: 12px;">
  <h1 style="color: #111827; font-size: 24px; font-weight: bold; margin-bottom: 16px;">Siparişiniz Alındı!</h1>
  <p style="color: #4b5563; font-size: 16px; line-height: 24px; margin-bottom: 24px;">
    Sayın ${customerName}, siparişiniz başarıyla alındı ve hazırlıklara başladık.
  </p>
  <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
    <p style="margin: 0; color: #374151; font-size: 14px;"><strong>Sipariş No:</strong> #${orderId}</p>
    <p style="margin: 4px 0 0 0; color: #374151; font-size: 14px;"><strong>Toplam Tutar:</strong> ${total} ₺</p>
  </div>
  <p style="color: #4b5563; font-size: 16px; line-height: 24px;">
    Siparişinizin durumunu "Sipariş Takibi" sayfasından takip edebilirsiniz.
  </p>
</div>
`;

export const getOrderStatusUpdateEmailHtml = (orderId: number, statusLabel: string, customerName: string) => `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; rounded: 12px;">
  <h1 style="color: #111827; font-size: 24px; font-weight: bold; margin-bottom: 16px;">Sipariş Durumu Güncellendi</h1>
  <p style="color: #4b5563; font-size: 16px; line-height: 24px; margin-bottom: 24px;">
    Sayın ${customerName}, #${orderId} numaralı siparişinizin durumu güncellendi:
  </p>
  <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px; border-radius: 8px; margin-bottom: 24px; text-align: center;">
    <span style="color: #166534; font-weight: bold; font-size: 18px;">${statusLabel}</span>
  </div>
  <p style="color: #4b5563; font-size: 16px; line-height: 24px;">
    Bizi tercih ettiğiniz için teşekkür ederiz.
  </p>
</div>
`;
