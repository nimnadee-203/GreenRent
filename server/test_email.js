import 'dotenv/config';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 10000, // 10 seconds
    debug: true,
    logger: true
});

const testMail = async () => {
    try {
        console.log('Verifying transporter...');
        await transporter.verify();
        console.log('Transporter is ready to take our messages');

        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: process.env.SENDER_EMAIL, // Send to self for testing
            subject: 'Test Email from Green Rent',
            text: 'This is a test email to verify SMTP configuration.'
        };

        console.log('Sending test email to:', process.env.SENDER_EMAIL);
        const info = await transporter.sendMail(mailOption);
        console.log('Email sent: %s', info.messageId);
        process.exit(0);
    } catch (error) {
        console.error('SMTP Error:', error);
        process.exit(1);
    }
};

testMail();
