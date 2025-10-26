# 🚀 Render Deployment Checklist - OTP Implementation

**Status**: Code pushed to GitHub, ready for Render deployment  
**Date**: 2025-10-26

---

## ✅ What Was Pushed to GitHub:

1. ✅ Backend OTP implementation (all endpoints)
2. ✅ Frontend OTP modal and integration
3. ✅ Database schema changes (auto-migrates on deploy)
4. ✅ Email templates
5. ✅ Documentation (3 files)

**Commit**: `77eb2d8` - "feat: Add email OTP verification for login and checkout security"

---

## 📋 Render Backend Deployment Steps

### Step 1: Trigger Manual Deploy

1. Go to your Render dashboard: https://dashboard.render.com/
2. Select your **freshvilla-backend** service
3. Click **"Manual Deploy"** → **"Deploy latest commit"**
4. Wait for build to complete (~3-5 minutes)

### Step 2: Add SMTP Environment Variables

**CRITICAL**: Add these to Render Environment Variables:

Go to: **Service Settings** → **Environment** → **Add Environment Variable**

Add these **5 new variables**:

```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=2525
SMTP_USER=info@freshvilla.in
SMTP_PASSWORD=your_actual_mailgun_smtp_password
SMTP_FROM=info@freshvilla.in
```

**⚠️ IMPORTANT**: 
- Replace `your_actual_mailgun_smtp_password` with your real Mailgun SMTP password
- You can find it in your Mailgun dashboard under "Sending" → "Domain settings" → "SMTP credentials"

### Step 3: Verify Deployment

After deploy completes, check logs:

**Expected to see**:
- ✅ `🚀 FreshVilla Backend Server running on port...`
- ✅ `✅ Supabase PostgreSQL Connected Successfully`
- ✅ `📊 Database synced` (with new OTP columns)
- ✅ `✅ SMTP server is ready to send emails`

**If you see**:
- ⚠️ `SMTP connection error: Invalid login` → Check SMTP password
- ⚠️ `SMTP connection error: ECONNREFUSED` → Check SMTP host/port

### Step 4: Test OTP Endpoints

**Test Suspicious Login Flow:**

```bash
# Replace YOUR_RENDER_URL with your actual Render backend URL
BACKEND_URL="https://your-app.onrender.com"

# 1. Register test user (or use existing)
curl -X POST $BACKEND_URL/api/customer/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "bhupeshmoudgil@gmail.com",
    "password": "Test123!@#",
    "mobile": "1234567890"
  }'

# 2. Try 3 wrong passwords
for i in 1 2 3; do
  curl -X POST $BACKEND_URL/api/customer/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email": "bhupeshmoudgil@gmail.com", "password": "wrongpass"}'
done

# 3. Login with correct password (should trigger OTP)
curl -X POST $BACKEND_URL/api/customer/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "bhupeshmoudgil@gmail.com", "password": "Test123!@#"}'
```

**Expected Response**:
```json
{
  "success": true,
  "requiresOTP": true,
  "message": "Suspicious login detected. Please verify with OTP sent to your email.",
  "data": {
    "customerId": "uuid",
    "email": "bhupeshmoudgil@gmail.com"
  }
}
```

**Check Email**: `bhupeshmoudgil@gmail.com` should receive OTP email within 30 seconds!

---

## 📱 Frontend Deployment (GitHub Pages)

### Step 1: Update API URL

Edit `freshvilla-customer-web/.env.production`:

```env
REACT_APP_API_URL=https://your-backend-app.onrender.com/api
```

### Step 2: Build and Deploy

```bash
cd /Users/maropost/Documents/freshvilla/Project-files/freshvilla-customer-web

# Build production bundle
npm run build

# Deploy to GitHub Pages
npm run deploy
```

### Step 3: Test Frontend OTP Flow

1. Go to your live site (e.g., `https://yourusername.github.io/freshvilla`)
2. Create new account or login
3. Try 3 wrong passwords, then correct password
4. **Expected**: OTP modal appears
5. Check email for 6-digit OTP
6. Enter OTP in modal
7. **Expected**: Login successful!

---

## 🔍 Troubleshooting

### Issue 1: "SMTP connection error" in Render logs

**Cause**: SMTP credentials incorrect or not set

**Solution**:
1. Go to Mailgun dashboard: https://app.mailgun.com/
2. Navigate to **Sending** → **Domain settings** → **SMTP credentials**
3. Copy the SMTP password
4. Update `SMTP_PASSWORD` in Render environment variables
5. Manually deploy again

### Issue 2: "Invalid login: 535 Authentication failed"

**Cause**: Wrong SMTP username or password

**Solution**:
- Verify `SMTP_USER=info@freshvilla.in` (should match your Mailgun domain)
- Verify `SMTP_PASSWORD` is correct
- Check Mailgun domain is verified
- Try resetting SMTP password in Mailgun

### Issue 3: OTP email not received

**Possible causes**:
1. Email in spam folder → **Check spam/junk**
2. Mailgun domain not verified → **Verify in Mailgun dashboard**
3. Mailgun free tier limit reached → **Check Mailgun usage**
4. Wrong recipient email → **Check customer email in database**

**Debug**:
- Check Render logs for "Email sent successfully" or errors
- Check Mailgun logs: https://app.mailgun.com/app/logs
- Look for email delivery status

### Issue 4: Database columns not created

**Cause**: Sequelize sync failed

**Solution**:
- Check Render logs for migration errors
- Database should auto-sync on deploy
- If needed, can manually sync via Render shell

---

## 📊 Verify Everything Works

### Backend Checklist:
- [ ] Render deploy successful
- [ ] SMTP environment variables added
- [ ] Server logs show "SMTP server is ready"
- [ ] No database sync errors
- [ ] Test API returns `requiresOTP: true`
- [ ] OTP email received in inbox

### Frontend Checklist:
- [ ] Production build successful
- [ ] Deployed to GitHub Pages
- [ ] API URL updated to Render backend
- [ ] OTP modal appears on suspicious login
- [ ] OTP modal appears on checkout
- [ ] Can enter and verify OTP
- [ ] Login completes after OTP verification

### Email Checklist:
- [ ] Suspicious login email received
- [ ] Email has 6-digit OTP
- [ ] Email formatted correctly
- [ ] OTP expires after 10 minutes
- [ ] Resend OTP works
- [ ] Checkout OTP email received

---

## 🎯 Production Testing Script

Once deployed, run this complete test:

```bash
#!/bin/bash

# Set your Render backend URL
BACKEND_URL="https://freshvilla-backend.onrender.com"
TEST_EMAIL="bhupeshmoudgil@gmail.com"

echo "🧪 Testing OTP Implementation..."

# 1. Register
echo "1️⃣ Registering test user..."
curl -s -X POST $BACKEND_URL/api/customer/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Bhupesh Test\",
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"Test123!@#\",
    \"mobile\": \"1234567890\"
  }" | jq

# 2. Failed logins
echo "2️⃣ Attempting 3 failed logins..."
for i in 1 2 3; do
  echo "   Attempt $i..."
  curl -s -X POST $BACKEND_URL/api/customer/auth/login \
    -H "Content-Type: application/json" \
    -d "{\"email\": \"$TEST_EMAIL\", \"password\": \"wrong$i\"}" | jq -r '.message'
done

# 3. Successful login (should trigger OTP)
echo "3️⃣ Logging in with correct password..."
RESPONSE=$(curl -s -X POST $BACKEND_URL/api/customer/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$TEST_EMAIL\", \"password\": \"Test123!@#\"}")

echo "$RESPONSE" | jq

REQUIRES_OTP=$(echo "$RESPONSE" | jq -r '.requiresOTP')

if [ "$REQUIRES_OTP" = "true" ]; then
  echo "✅ SUCCESS: OTP required! Check $TEST_EMAIL for OTP code."
  echo "📧 Email should arrive within 30 seconds"
else
  echo "❌ FAILED: OTP not triggered"
fi
```

Save as `test-otp.sh`, make executable, and run:
```bash
chmod +x test-otp.sh
./test-otp.sh
```

---

## 📧 Mailgun Account Check

Before deploying, verify your Mailgun setup:

1. **Login to Mailgun**: https://app.mailgun.com/
2. **Check Domain Status**: 
   - Go to **Sending** → **Domains**
   - Status should be **"Verified"** (green)
3. **Check SMTP Credentials**:
   - Go to domain settings → **SMTP credentials**
   - Username: `info@freshvilla.in` (or your postmaster@...)
   - Password: Click "Show" to reveal
4. **Check Sending Limits**:
   - Free tier: 5,000 emails/month (first 3 months)
   - After: 1,000 emails/month
5. **Check Logs**:
   - Go to **Logs** to see email delivery status

---

## 🚀 Quick Deploy Commands

```bash
# Backend (already pushed to GitHub)
# Just trigger manual deploy on Render dashboard

# Frontend
cd /Users/maropost/Documents/freshvilla/Project-files/freshvilla-customer-web
npm run build
npm run deploy
```

---

## 📝 Environment Variables Summary

**Render Backend Environment Variables** (add these):

| Variable | Value |
|----------|-------|
| `SMTP_HOST` | `smtp.mailgun.org` |
| `SMTP_PORT` | `2525` |
| `SMTP_USER` | `info@freshvilla.in` |
| `SMTP_PASSWORD` | `your_mailgun_password` |
| `SMTP_FROM` | `info@freshvilla.in` |

**Keep existing variables**:
- `PORT`, `NODE_ENV`, `DEPLOY_ENV`
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `JWT_SECRET`, `JWT_EXPIRE`
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`
- `FRONTEND_URL`

---

## ✅ Success Criteria

**Deployment is successful when**:

1. ✅ Render deploy completes without errors
2. ✅ Render logs show "SMTP server is ready to send emails"
3. ✅ Test API call returns `requiresOTP: true`
4. ✅ OTP email arrives at `bhupeshmoudgil@gmail.com` within 30 seconds
5. ✅ Email contains 6-digit OTP code
6. ✅ OTP verification API works
7. ✅ Frontend OTP modal displays correctly
8. ✅ Complete login flow works end-to-end

---

## 📞 Support

If you encounter issues:

1. **Check Render Logs**: Service → Logs tab
2. **Check Mailgun Logs**: https://app.mailgun.com/app/logs
3. **Check Documentation**: `OTP_TESTING_GUIDE.md`
4. **Test with curl**: Use commands above
5. **Verify SMTP**: Run `nc -zv smtp.mailgun.org 2525` from Render shell

---

**Status**: Ready for Render deployment! 🚀

**Next**: 
1. Deploy on Render
2. Add SMTP environment variables
3. Test with `bhupeshmoudgil@gmail.com`
4. Verify OTP email received
5. Deploy frontend

**Estimated Time**: 10-15 minutes total
