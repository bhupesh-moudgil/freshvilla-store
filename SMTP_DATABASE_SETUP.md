# SMTP Configuration with Database Storage

## Overview

FreshVilla now stores SMTP credentials **securely in the database** with AES-256 encryption instead of environment variables. This approach:

- ✅ Keeps sensitive credentials out of Git
- ✅ Allows runtime configuration via admin API
- ✅ Encrypts passwords using AES-256-CBC
- ✅ Falls back to environment variables if database settings don't exist

## Features

### Email Functionality
- **Welcome emails** on customer registration
- **Password reset** emails with secure token links
- **Admin configurable** via API endpoints

## Initial Setup

### 1. Generate Encryption Key

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and save it securely.

### 2. Configure Environment Variables

Add to your local `.env` file:

```bash
# Required: Encryption key for database settings
SETTINGS_ENCRYPTION_KEY=<paste-your-64-char-hex-key-here>

# Optional: SMTP credentials (for initial setup or fallback)
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=info@freshvilla.in
SMTP_PASSWORD=<your-mailgun-password>
SMTP_FROM=info@freshvilla.in
```

### 3. Store SMTP Settings in Database

Run the setup script:

```bash
npm run setup-smtp
```

This will:
- Create the `settings` table if it doesn't exist
- Read SMTP credentials from environment variables
- Encrypt the password
- Store all settings in the database

**Output:**
```
🔧 Setting up SMTP configuration in database...

✅ Set smtp_host: smtp.mailgun.org
✅ Set smtp_port: 587
✅ Set smtp_user: info@freshvilla.in
✅ Set smtp_password: ***ENCRYPTED***
✅ Set smtp_from: info@freshvilla.in

✅ SMTP settings configured successfully!
```

### 4. Start the Server

```bash
npm start
```

Check for successful SMTP initialization:
```
✅ SMTP server is ready to send emails
   Host: smtp.mailgun.org:587
   User: info@freshvilla.in
```

## Production Deployment (Render)

### Step 1: Add Environment Variables

In Render Dashboard:

1. Go to your `freshvilla-backend` service
2. Navigate to **Environment** tab
3. Add these variables:

```
SETTINGS_ENCRYPTION_KEY=<your-64-char-hex-key>
SMTP_PASSWORD=<your-mailgun-password>
SMTP_USER=info@freshvilla.in
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_FROM=info@freshvilla.in
```

### Step 2: Run Setup Script on Render

Option A: Use Render Shell
```bash
npm run setup-smtp
```

Option B: Use API (see below)

### Step 3: Restart Service

After setup completes, restart the service in Render dashboard.

## Admin API Endpoints

### Configure SMTP (Convenience Endpoint)

**POST** `/api/settings/smtp/configure`

**Headers:**
```
Authorization: Bearer <admin-token>
Content-Type: application/json
```

**Body:**
```json
{
  "host": "smtp.mailgun.org",
  "port": 587,
  "user": "info@freshvilla.in",
  "password": "your-mailgun-password",
  "from": "info@freshvilla.in"
}
```

**Response:**
```json
{
  "success": true,
  "message": "SMTP settings configured successfully. Please restart the server to apply changes."
}
```

### View All Settings

**GET** `/api/settings`

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "key": "smtp_host",
      "value": "smtp.mailgun.org",
      "encrypted": false,
      "description": "SMTP server host",
      "category": "email"
    },
    {
      "key": "smtp_password",
      "value": "***ENCRYPTED***",
      "encrypted": true,
      "description": "SMTP password (encrypted)"
    }
  ]
}
```

### Get Specific Setting

**GET** `/api/settings/:key`

Example: `/api/settings/smtp_host`

### Update Setting

**POST** `/api/settings`

**Body:**
```json
{
  "key": "smtp_host",
  "value": "smtp.mailgun.org",
  "encrypted": false,
  "description": "SMTP server host",
  "category": "email"
}
```

### Delete Setting

**DELETE** `/api/settings/:key`

## Testing Email Functionality

### Test Customer Registration

```bash
curl -X POST https://backend.freshvilla.in/api/customer/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "test123456"
  }'
```

Check inbox for welcome email.

### Test Password Reset

```bash
curl -X POST https://backend.freshvilla.in/api/password-reset/request \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

Check inbox for password reset email.

## Security Features

### Encryption Details

- **Algorithm**: AES-256-CBC
- **Key Source**: `SETTINGS_ENCRYPTION_KEY` environment variable
- **IV**: Random 16-byte initialization vector per value
- **Storage Format**: `<iv_hex>:<encrypted_value_hex>`

### Best Practices

1. **Never commit** `SETTINGS_ENCRYPTION_KEY` to Git
2. **Rotate encryption key** periodically (requires re-encrypting all settings)
3. **Backup database** before key rotation
4. **Use different keys** for dev/staging/production
5. **Restrict API access** to admin users only

## Troubleshooting

### SMTP Connection Errors

**Symptom:**
```
⚠️  SMTP connection error: Invalid login
```

**Solutions:**
1. Verify credentials in database:
   ```bash
   # View settings (password will show as ***ENCRYPTED***)
   curl -H "Authorization: Bearer <token>" \
     https://backend.freshvilla.in/api/settings
   ```

2. Re-configure SMTP:
   ```bash
   npm run setup-smtp
   ```

3. Check Mailgun domain verification

### Emails Not Sending

1. **Check SMTP initialization:**
   - Look for `✅ SMTP server is ready` in server logs
   - If missing, SMTP setup failed

2. **Verify database settings exist:**
   ```sql
   SELECT key, encrypted, category FROM settings WHERE category = 'email';
   ```

3. **Test SMTP credentials manually:**
   ```bash
   telnet smtp.mailgun.org 587
   ```

### Encryption Key Issues

**Symptom:**
```
Decryption error: ...
```

**Solution:**
- Ensure `SETTINGS_ENCRYPTION_KEY` is identical across all environments
- If key is lost, delete encrypted settings and re-run setup

### Database Table Missing

**Symptom:**
```
ERROR: relation "settings" does not exist
```

**Solution:**
```bash
npm run setup-smtp
```

This automatically creates the table.

## Migration from Environment Variables

If you previously used environment variables for SMTP:

1. Run the setup script:
   ```bash
   npm run setup-smtp
   ```

2. Remove SMTP env vars from `.env` (keep `SETTINGS_ENCRYPTION_KEY`)

3. Restart server

4. Verify emails work

5. Update Render dashboard to remove old SMTP env vars (optional)

## Backup & Recovery

### Backup Settings

```bash
# Export settings as JSON
curl -H "Authorization: Bearer <token>" \
  https://backend.freshvilla.in/api/settings > settings_backup.json
```

### Restore Settings

```bash
# For each setting in backup
curl -X POST https://backend.freshvilla.in/api/settings \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"key": "smtp_host", "value": "smtp.mailgun.org"}'
```

## Advanced: Key Rotation

To rotate the encryption key:

1. **Backup all settings** (see above)
2. **Generate new key**
3. **Update `SETTINGS_ENCRYPTION_KEY`**
4. **Delete encrypted settings:**
   ```sql
   DELETE FROM settings WHERE encrypted = true;
   ```
5. **Re-run setup:**
   ```bash
   npm run setup-smtp
   ```
6. **Restart server**

## Support

For issues:
1. Check Render logs
2. Verify database connection
3. Test SMTP credentials in Mailgun dashboard
4. Review API responses for error details
