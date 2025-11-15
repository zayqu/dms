// dms/server/src/utils/mailer.js
// Minimal mailer wrapper — works even if SMTP is not configured.
// If SMTP env vars are provided, it will try to send emails via nodemailer.
// For development, when SMTP is absent it logs the token to console.

const nodemailer = require('nodemailer');

const {
  SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM_NAME, SMTP_FROM_EMAIL, APP_URL
} = process.env;

function isConfigured() {
  return SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS;
}

let transporter = null;
if (isConfigured()) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS }
  });
}

function welcomeHtml({ name, email, tempPassword, appUrl }) {
  const brand = '#17C0C8';
  return `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#0f1720">
      <div style="padding:20px;border-radius:8px">
        <h2 style="color:${brand}">Welcome to DMS</h2>
        <p>Hello ${name || email},</p>
        <p>Your account was created. Use the credentials below to sign in:</p>
        <ul>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Password:</strong> ${tempPassword}</li>
        </ul>
        <p>Sign in: <a href="${appUrl}">${appUrl}</a></p>
      </div>
    </div>
  `;
}

function resetHtml({ name, link }) {
  const brand = '#17C0C8';
  return `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#0f1720">
      <div style="padding:20px;border-radius:8px">
        <h2 style="color:${brand}">Password reset</h2>
        <p>Hello ${name || 'user'},</p>
        <p>Click the button below to reset your password (link expires in 1 hour):</p>
        <p><a href="${link}" style="background:${brand};color:#fff;padding:10px 14px;border-radius:6px;text-decoration:none">Reset password</a></p>
      </div>
    </div>
  `;
}

async function sendMail({ to, subject, html }) {
  if (!transporter) {
    console.warn('SMTP not configured — skipping sendMail. To enable set SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS in .env');
    console.log('Mail preview ->', { to, subject });
    return null;
  }
  const fromName = SMTP_FROM_NAME || 'DMS';
  const fromEmail = SMTP_FROM_EMAIL || SMTP_USER;
  const info = await transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject,
    html
  });
  return info;
}

async function sendWelcomeEmail({ to, name, tempPassword, appUrl }) {
  const html = welcomeHtml({ name, email: to, tempPassword, appUrl: appUrl || APP_URL || 'http://localhost:3000' });
  return sendMail({ to, subject: 'Welcome to DMS', html });
}

async function sendPasswordResetEmail({ to, name, token }) {
  const appUrl = APP_URL || 'http://localhost:3000';
  const link = `${appUrl.replace(/\/$/, '')}/reset?token=${encodeURIComponent(token)}`;
  const html = resetHtml({ name, link });
  // In dev if no SMTP is configured we still log the link so you can test.
  if (!transporter) {
    console.log('Password reset link (dev):', link);
  }
  return sendMail({ to, subject: 'DMS Password reset', html });
}

module.exports = { isConfigured, sendWelcomeEmail, sendPasswordResetEmail, sendMail };