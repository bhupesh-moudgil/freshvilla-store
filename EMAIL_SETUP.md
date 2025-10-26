# Email Service Setup - FreshVilla

## Overview
FreshVilla backend now supports sending emails for:
- **Welcome emails** on customer registration
- **Password reset emails** with secure token links
- **Sign-in notifications** (optional feature)

## SMTP Configuration (Mailgun)

### Settings
- **Host**: `smtp.mailgun.org`
- **Ports**: 25, 587, 2525, or 465 (SSL/TLS)
- **Username**: `info@freshvilla.in`
- **Password**: `[STORED IN RENDER ENV VARS - DO NOT COMMIT]`

### Environment Variables Required

Add these to your `.env` file (local) or Render dashboard (production):

```bash
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=info@freshvilla.in
SMTP_PASSWORD=<your-mailgun-smtp-password>
SMTP_FROM=info@freshvilla.in
FRONTEND_URL=https://freshvilla.in
```

## Render Deployment Setup

### Step 1: Add SMTP_PASSWORD to Render Dashboard
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Select your `freshvilla-backend` service
3. Go to **Environment** tab
4. Add new environment variable:
   - **Key**: `SMTP_PASSWORD`
   - **Value**: `<your-mailgun-smtp-password>`
5. Click **Save Changes**

### Step 2: Verify Deployment
After the service redeploys, check logs for:
```
✅ SMTP server is ready to send emails
```

## API Endpoints

### 1. Customer Registration
**Endpoint**: `POST /api/customer/auth/register`

Automatically sends welcome email after successful registration.

**Request**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepass123",
  "mobile": "+1234567890"
}
```

### 2. Password Reset Request
**Endpoint**: `POST /api/password-reset/request`

Sends password reset email with token link.

**Request**:
```json
{
  "email": "john@example.com"
}
```

### 3. Password Reset Verification
**Endpoint**: `POST /api/password-reset/verify`

Verifies if reset token is valid.

**Request**:
```json
{
  "token": "abc123tokenxyz"
}
```

### 4. Password Reset Completion
**Endpoint**: `POST /api/password-reset/reset`

Resets password using valid token.

**Request**:
```json
{
  "token": "abc123tokenxyz",
  "newPassword": "newSecurePassword123"
}
```

## Email Templates

### Welcome Email
- **Subject**: "Welcome to FreshVilla!"
- **Content**: Branded greeting with call-to-action

### Password Reset Email
- **Subject**: "Password Reset Request - FreshVilla"
- **Content**: Reset button/link with 1-hour expiration
- **Reset URL**: `https://freshvilla.in/reset-password?token={token}`

## Testing Locally

### 1. Install Dependencies
```bash
cd freshvilla-backend
npm install
```

### 2. Update .env File
```bash
# Add SMTP configuration
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=info@freshvilla.in
SMTP_PASSWORD=<your-mailgun-smtp-password>
SMTP_FROM=info@freshvilla.in
```

### 3. Test Email Service
```bash
npm run dev
```

Check console for:
```
✅ SMTP server is ready to send emails
```

### 4. Test Registration
```bash
curl -X POST http://localhost:5000/api/customer/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "test123"
  }'
```

Check inbox for welcome email at `test@example.com`.

## Troubleshooting

### Email Not Sending

1. **Check SMTP credentials**:
   - Verify `SMTP_USER` and `SMTP_PASSWORD` are correct
   - Test credentials using Mailgun dashboard

2. **Check Mailgun domain status**:
   - Ensure `freshvilla.in` is verified in Mailgun
   - Check DNS records (SPF, DKIM, MX)

3. **Check server logs**:
   ```bash
   # On Render dashboard, view logs for errors
   SMTP connection error: ...
   ```

4. **Test SMTP connection**:
   ```bash
   telnet smtp.mailgun.org 587
   ```

### Token Expiration Issues

Password reset tokens expire after 1 hour. If users report expired tokens:
- Increase expiration time in `passwordReset.js` (line 46)
- Or implement database-backed token storage

### Emails Going to Spam

If emails land in spam:
1. Verify SPF record: `v=spf1 include:mailgun.org ~all`
2. Verify DKIM signing in Mailgun
3. Add DMARC record
4. Use authenticated domain

## Production Checklist

- [x] Add SMTP_PASSWORD to Render environment variables
- [x] Update FRONTEND_URL to production domain
- [x] Verify Mailgun domain and DNS settings
- [x] Test registration email flow
- [x] Test password reset email flow
- [ ] Monitor email delivery rates in Mailgun dashboard
- [ ] Set up email sending limits/throttling if needed

## Security Notes

⚠️ **Never commit SMTP_PASSWORD to Git**
- Use environment variables only
- Store securely in Render dashboard
- Rotate password periodically

## Support

For Mailgun support:
- Dashboard: https://app.mailgun.com
- Documentation: https://documentation.mailgun.com
- Support: https://www.mailgun.com/support
