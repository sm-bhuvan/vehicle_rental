# SMTP Integration for Vehicle Rental System

This document explains the SMTP integration implemented for sending booking confirmation emails to customers after successful vehicle bookings.

## 🚀 Features Implemented

### 1. **Rental Company Model**
- Created `RentalCompany` model with complete business information
- Includes contact details, address, and company identification
- Supports multiple rental companies in the system

### 2. **Enhanced Email Templates**
- Professional HTML email templates for booking confirmations
- Includes rental company branding and information
- Responsive design with proper styling
- Comprehensive booking details and contact information

### 3. **SMTP Configuration**
- Configurable SMTP settings via environment variables
- Support for Gmail, Outlook, and other SMTP providers
- Secure authentication with app passwords

### 4. **Database Integration**
- Vehicles are now associated with rental companies
- Proper data population for email templates
- Automatic rental company assignment during booking

## 📁 Files Created/Modified

### New Files:
- `backend/models/RentalCompany.js` - Rental company data model
- `backend/routes/rentalCompanies.js` - API routes for rental companies
- `backend/scripts/seedRentalCompanies.js` - Database seeding script
- `backend/env.example` - Environment variables template

### Modified Files:
- `backend/models/Vehicle.js` - Added rental company reference
- `backend/utils/email.js` - Enhanced email templates with rental company info
- `backend/routes/bookings.js` - Updated to include rental company data in emails
- `backend/server.js` - Added rental companies API route
- `backend/package.json` - Added seeding script command

## 🛠️ Setup Instructions

### 1. Environment Configuration

Create a `.env` file in the `backend` directory with the following variables:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/vehicle_rental

# JWT
JWT_SECRET=your_jwt_secret_key_here

# Email Configuration (SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password_here

# Server
PORT=5000
NODE_ENV=development
```

### 2. Gmail SMTP Setup

For Gmail SMTP configuration:

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
   - Use this password in `EMAIL_PASS`

### 3. Database Setup

Run the following commands to set up rental companies:

```bash
# Navigate to backend directory
cd backend

# Seed the database with rental companies
npm run seed:companies
```

This will:
- Create sample rental companies
- Associate existing vehicles with rental companies
- Set up the complete data structure

## 📧 Email Template Features

The booking confirmation email includes:

### **Header Section**
- Rental company name and branding
- Professional gradient styling

### **Booking Details**
- Transaction ID
- Vehicle information (make, model, year)
- Pickup and return dates with times
- Total rental amount

### **Rental Company Information**
- Company name and location
- Complete address details
- Contact phone and email
- Professional formatting

### **Important Notes**
- Pre-pickup instructions
- Required documentation
- Vehicle inspection guidelines
- Contact information for support

## 🔧 API Endpoints

### Rental Companies Management

```bash
# Get all rental companies
GET /api/rental-companies

# Get specific rental company
GET /api/rental-companies/:id

# Create new rental company
POST /api/rental-companies
Content-Type: application/json

{
  "rental_id": "RENT001",
  "rental_name": "Swift Wheels Rentals",
  "location": "Kochi",
  "region": "Ernakulam",
  "address": {
    "street": "MG Road, Near Marine Drive",
    "city": "Kochi",
    "pincode": "682011",
    "state": "Kerala"
  },
  "contact": {
    "phone": "+919876543210",
    "email": "swiftwheels@example.com"
  }
}

# Update rental company
PUT /api/rental-companies/:id

# Delete rental company (soft delete)
DELETE /api/rental-companies/:id
```

## 🎯 Booking Flow with Email Integration

1. **Customer Books Vehicle**
   - Selects vehicle and dates
   - Provides personal information
   - Proceeds to payment

2. **Payment Confirmation**
   - Payment is processed successfully
   - System creates rental record
   - Associates vehicle with rental company

3. **Email Generation**
   - System populates rental company data
   - Formats dates and times properly
   - Generates professional HTML email

4. **Email Delivery**
   - SMTP service sends confirmation email
   - Customer receives detailed booking information
   - Includes all rental company contact details

## 🔍 Testing the Integration

### 1. Test Email Sending

```bash
# Start the backend server
npm run dev

# Make a test booking request
POST /api/process-booking
```

### 2. Verify Email Content

Check the email for:
- ✅ Rental company branding
- ✅ Complete booking details
- ✅ Pickup/return dates and times
- ✅ Rental company contact information
- ✅ Professional formatting

### 3. Check Logs

Monitor the server logs for:
- Email sending success/failure
- SMTP connection status
- Database population status

## 🚨 Troubleshooting

### Common Issues:

1. **SMTP Authentication Failed**
   - Verify EMAIL_USER and EMAIL_PASS
   - Check if 2FA is enabled and app password is used
   - Confirm SMTP settings match your email provider

2. **Email Not Received**
   - Check spam/junk folder
   - Verify recipient email address
   - Check SMTP logs for errors

3. **Database Population Issues**
   - Ensure MongoDB is running
   - Check database connection string
   - Verify rental company seeding completed

### Debug Commands:

```bash
# Check database connection
npm run seed:companies

# Test email configuration
# Add console.log statements in email.js

# Verify rental companies exist
GET /api/rental-companies
```

## 📈 Future Enhancements

### Potential Improvements:
1. **Email Templates**
   - Multiple template options
   - Custom branding per rental company
   - Multi-language support

2. **Advanced Features**
   - Email scheduling
   - Reminder emails
   - Cancellation notifications

3. **Analytics**
   - Email delivery tracking
   - Open rate monitoring
   - Customer engagement metrics

## 🔒 Security Considerations

1. **Environment Variables**
   - Never commit .env files
   - Use strong app passwords
   - Rotate credentials regularly

2. **Email Security**
   - Validate all email inputs
   - Sanitize HTML content
   - Rate limit email sending

3. **Data Protection**
   - Encrypt sensitive information
   - Follow GDPR compliance
   - Secure SMTP connections (TLS/SSL)

---

## 📞 Support

For issues or questions regarding the SMTP integration:

1. Check the troubleshooting section above
2. Review server logs for error messages
3. Verify environment configuration
4. Test with a simple email sending script

The integration is now ready for production use with proper SMTP configuration!

