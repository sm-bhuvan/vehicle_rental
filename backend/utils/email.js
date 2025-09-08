// utils/email.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendEmail = async ({ to, subject, template, data }) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to,
            subject,
            html: `
                <h1>${subject}</h1>
                <p>Hello ${data.customerName},</p>
                <p>This is a custom email template. You can replace this with your own HTML content for different email types.</p>
                <pre>${JSON.stringify(data, null, 2)}</pre>
            `, // A real-world app would use a template engine here
        };

        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully!');
    } catch (error) {
        console.error('Email sending failed:', error);
        throw new Error('Email sending failed');
    }
};

module.exports = { sendEmail };