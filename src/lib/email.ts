interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendNotificationEmail(options: EmailOptions): Promise<void> {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !options.to) {
    return;
  }

  try {
    const nodemailer = await import("nodemailer");
    const port = Number(process.env.SMTP_PORT) || 587;
    const transporter = nodemailer.default.createTransport({
      host: process.env.SMTP_HOST,
      port,
      // 465는 SSL, 587은 STARTTLS. Nodemailer 권장 패턴.
      secure: port === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"화란 동아리연합회" <${process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
  } catch (err) {
    console.error("[Email] 발송 실패:", err);
  }
}
