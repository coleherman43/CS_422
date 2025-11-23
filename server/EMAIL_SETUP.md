# Email Service Setup Guide

The Flock Manager application includes a fully functional email service that sends:
- Member confirmation emails when new members register
- Check-in confirmation emails when members check in to events
- Event reminder emails (available for future use)
- Dues reminder emails (available for future use)
- General announcement emails (available for future use)

## Configuration

The email service uses nodemailer and supports any SMTP email provider. It gracefully falls back to console logging if email is not configured.

### Environment Variables

Add the following variables to your `.env` file in the `server/` directory:

```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=UOSW Administration <your-email@gmail.com>
```

### Gmail Setup

1. Enable 2-Step Verification on your Google account
2. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Generate an app password for "Mail"
4. Use this app password (not your regular password) as `EMAIL_PASS`

**Gmail Settings:**
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
```

### Other Email Providers

**Outlook/Hotmail:**
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_SECURE=false
```

**SendGrid:**
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=apikey
EMAIL_PASS=your-sendgrid-api-key
```

**Custom SMTP:**
Use your provider's SMTP settings. For SSL connections, set `EMAIL_SECURE=true` and use port 465.

## Testing

The email service includes a test method. You can test it by calling:

```javascript
const EmailService = require('./utils/emailService');
EmailService.testEmailService();
```

## Fallback Behavior

If email is not configured (missing environment variables), the service will:
- Log emails to the console instead of sending them
- Continue normal operation without errors
- This allows development without email setup

## Email Templates

All emails include both:
- Plain text versions for email clients that don't support HTML
- HTML versions with styled formatting for better presentation

## Integration Points

The email service is currently integrated into:
- **Member Registration** (`memberController.js`): Sends confirmation email when a new member registers
- **Event Check-in** (`eventController.js`): Sends confirmation email when a member checks in to an event

Email sending is non-blocking - if an email fails to send, the main operation (registration/check-in) will still succeed.

