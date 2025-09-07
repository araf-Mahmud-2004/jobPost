import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendVerificationEmail = async (to: string, token: string) => {
  const url = `${process.env.FRONTEND_URL}/api/verify-email?token=${token}`;
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: "Verify your email",
    html: `<p>Please verify your email by clicking <a href="${url}">here</a></p>`,
  });
};

export const sendResetPasswordEmail = async (to: string, token: string) => {
  const url = `${process.env.FRONTEND_URL}/reset-password/${token}`;
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: "Reset your password",
    html: `<p>You can reset your password by clicking <a href="${url}">here</a></p>`,
  });
};

// Send announcement email to multiple users
export const sendAnnouncementEmail = async (recipients: string[], title: string, message: string) => {
  try {
    console.log('Attempting to send emails to:', recipients);
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h1 style="color: #333; margin: 0; font-size: 24px;">${title}</h1>
        </div>
        <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #e9ecef;">
          <div style="color: #666; line-height: 1.6;">
            ${message.replace(/\n/g, '<br>')}
          </div>
          <hr style="border: none; border-top: 1px solid #e9ecef; margin: 20px 0;">
          <p style="color: #999; font-size: 12px; margin: 0;">
            This is an automated announcement from Job Portal. Please do not reply to this email.
          </p>
        </div>
      </div>
    `;

    // Send individual emails instead of BCC to avoid spam filters
    const emailPromises = recipients.map(async (recipient) => {
      try {
        const result = await transporter.sendMail({
          from: `"${process.env.EMAIL_FROM_NAME || 'Job Portal Admin'}" <${process.env.EMAIL_USER}>`,
          to: recipient,
          subject: `📢 ${title}`,
          html,
        });
        console.log(`Email sent successfully to ${recipient}:`, result.messageId);
        return { email: recipient, success: true, messageId: result.messageId };
      } catch (error) {
        console.error(`Failed to send email to ${recipient}:`, error);
        return { email: recipient, success: false, error: (error as Error).message };
      }
    });

    const results = await Promise.allSettled(emailPromises);
    const successful = results.filter(result => result.status === 'fulfilled' && result.value.success).length;
    const failed = results.length - successful;

    console.log(`Email sending complete: ${successful} successful, ${failed} failed`);
    
    if (successful === 0) {
      throw new Error('Failed to send emails to any recipients');
    }

    return { success: true, recipientCount: successful, failedCount: failed };
  } catch (error) {
    console.error('Error sending announcement email:', error);
    throw error;
  }
};