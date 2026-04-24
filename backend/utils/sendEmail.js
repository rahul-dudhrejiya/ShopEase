// WHAT: Sends emails using Gmail SMTP
// WHY: Order confirmation, welcome email — professional touch
// HOW: Nodemailer connects to Gmail and sends emails

import nodemailer from 'nodemailer';

const sendEmail = async ({ to, subject, html }) => {
    try {
        // Create transporter — like setting up email client
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
                // WHY app password? Gmail requires app-specific
                // password for 3rd party apps, not your real password
            },
        });

        await transporter.sendMail({
            from: `"ShopEase 🛒" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        });

        console.log(`✅ Email sent to ${to}`);

    } catch (error) {
        console.error('❌ Email failed:', error.message);
        // WHY not throw? Email failure shouldn't break order flow
        // Order is placed successfully, email is just a bonus
    }
};

export default sendEmail;