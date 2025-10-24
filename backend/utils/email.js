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
        let htmlContent = '';
        
        if (template === 'booking-confirmation') {
            htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <title>Booking Confirmation - ${data.rentalCompany?.rental_name || 'Vehicle Rental'}</title>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                        .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
                        .detail-label { font-weight: bold; color: #555; }
                        .detail-value { color: #333; }
                        .highlight { background: #e8f4fd; padding: 15px; border-left: 4px solid #2196F3; margin: 20px 0; }
                        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
                        .btn { display: inline-block; background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
                        .rental-info { background: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🚗 ${data.rentalCompany?.rental_name || 'Vehicle Rental'}</h1>
                            <h2>Booking Confirmation</h2>
                        </div>
                        <div class="content">
                            <p>Dear ${data.customerName},</p>
                            <p>Thank you for choosing ${data.rentalCompany?.rental_name || 'our rental service'}! Your vehicle booking has been confirmed successfully.</p>
                            
                            <div class="highlight">
                                <h3>📋 Booking Details</h3>
                                <div class="detail-row">
                                    <span class="detail-label">Transaction ID:</span>
                                    <span class="detail-value">${data.transactionId}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Vehicle:</span>
                                    <span class="detail-value">${data.vehicleName}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Pickup Date & Time:</span>
                                    <span class="detail-value">${data.pickupDate} at ${data.pickupTime}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Return Date & Time:</span>
                                    <span class="detail-value">${data.returnDate} at ${data.returnTime}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Total Amount:</span>
                                    <span class="detail-value">₹${data.totalAmount}</span>
                                </div>
                            </div>
                            
                            <div class="rental-info">
                                <h3>🏢 Rental Company Information</h3>
                                <p><strong>Company:</strong> ${data.rentalCompany?.rental_name || 'N/A'}</p>
                                <p><strong>Location:</strong> ${data.rentalCompany?.location || 'N/A'}, ${data.rentalCompany?.region || 'N/A'}</p>
                                <p><strong>Address:</strong> ${data.rentalCompany?.address?.street || 'N/A'}, ${data.rentalCompany?.address?.city || 'N/A'}, ${data.rentalCompany?.address?.state || 'N/A'} - ${data.rentalCompany?.address?.pincode || 'N/A'}</p>
                                <p><strong>Contact Phone:</strong> ${data.rentalCompany?.contact?.phone || 'N/A'}</p>
                                <p><strong>Contact Email:</strong> ${data.rentalCompany?.contact?.email || 'N/A'}</p>
                            </div>
                            
                            <div class="highlight">
                                <h3>⚠️ Important Notes</h3>
                                <ul>
                                    <li>Please arrive 15 minutes before your scheduled pickup time</li>
                                    <li>Bring a valid driver's license and the credit card used for booking</li>
                                    <li>Inspect the vehicle thoroughly before taking possession</li>
                                    <li>Report any damages immediately to avoid additional charges</li>
                                    <li>Keep this confirmation email with you during the rental period</li>
                                </ul>
                            </div>
                            
                            <p>If you have any questions or need to make changes to your booking, please contact us immediately using the information provided above.</p>
                            
                            <p>We look forward to serving you!</p>
                            <p><strong>The ${data.rentalCompany?.rental_name || 'Vehicle Rental'} Team</strong></p>
                        </div>
                        <div class="footer">
                            <p>This is an automated message. Please do not reply to this email.</p>
                            <p>© 2024 ${data.rentalCompany?.rental_name || 'Vehicle Rental'}. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `;
        } else {
            // Default template for other email types
            htmlContent = `
                <h1>${subject}</h1>
                <p>Hello ${data.customerName || 'Valued Customer'},</p>
                <p>This is a custom email template. You can replace this with your own HTML content for different email types.</p>
                <pre>${JSON.stringify(data, null, 2)}</pre>
            `;
        }

        const mailOptions = {
            from: data.rentalCompany?.contact?.email || process.env.EMAIL_USER || 'bars@gmail.com',
            to,
            subject,
            html: htmlContent,
        };

        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully!');
    } catch (error) {
        console.error('Email sending failed:', error);
        throw new Error('Email sending failed');
    }
};

module.exports = { sendEmail };