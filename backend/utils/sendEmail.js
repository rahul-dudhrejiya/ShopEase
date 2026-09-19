import nodemailer from 'nodemailer';

const sendEmail = async ({ to, subject, html }) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: `"ShopEase" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        });

        console.log(`Email successfully dispatched to ${to}`);

    } catch (error) {
        console.error('Email dispatch failed:', error.message);
    }
};

export default sendEmail;