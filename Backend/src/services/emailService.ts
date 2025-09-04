import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendVerificationEmail = async (to: string, token: string) => {
  const url = `${process.env.FRONTEND_URL}/verify-email/${token}`;
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
 