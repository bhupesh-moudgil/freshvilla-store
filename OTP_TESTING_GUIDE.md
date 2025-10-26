# OTP Implementation - Testing & Deployment Guide

**Status**: ✅ Code Complete | ⚠️ Needs SMTP Setup  
**Date**: 2025-10-26

---

## 🚀 Quick Status

### ✅ What's Complete:
- [x] Backend OTP endpoints
- [x] Database schema with OTP fields
- [x] Email templates
- [x] Frontend OTP modal component
- [x] Login page with OTP flow
- [x] Checkout page with OTP flow
- [x] API integration

### ⚠️ What Needs Setup:
- [ ] SMTP email configuration
- [ ] Test suspicious login flow
- [ ] Test checkout OTP flow
- [ ] Deploy to production

---

## 📧 Step 1: Configure Email (SMTP)

Your emails aren't sending because SMTP isn't configured. You have **3 options**:

### Option A: Gmail SMTP (Free, Easiest) ✅ RECOMMENDED

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Name it "FreshVilla"
   - Copy the 16-character password

3. **Add to `.env` file**:
```bash
cd /Users/maropost/Documents/freshvilla/Project-files/freshvilla-backend
```

Add these lines to your `.env`:
```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your.email@gmail.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx  # Your app password (remove spaces)
SMTP_FROM=your.email@gmail.com
```

### Option B: Mailgun (Free Tier Available)

```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@your-domain.mailgun.org
SMTP_PASSWORD=your_mailgun_password
SMTP_FROM=noreply@freshvilla.com
```

### Option C: SendGrid (Free Tier Available)

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your_sendgrid_api_key
SMTP_FROM=noreply@freshvilla.com
```

---

## 🧪 Step 2: Test Backend API

### Test 1: Start Backend Server

```bash
cd /Users/maropost/Documents/freshvilla/Project-files/freshvilla-backend
npm run dev
```

**Expected**: 
- ✅ Server starts on port 5000
- ✅ "Database synced" message
- ✅ "SMTP server is ready to send emails" (if SMTP configured)
- ⚠️ If you see "SMTP connection error", go back to Step 1

### Test 2: Test Suspicious Login Detection

Use **Postman** or **curl**:

#### 2.1 Create Test Customer (if needed)
```bash
curl -X POST http://localhost:5000/api/customer/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test123!@#",
    "mobile": "1234567890"
  }'
```

#### 2.2 Attempt 3 Failed Logins
```bash
# Attempt 1
curl -X POST http://localhost:5000/api/customer/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "wrongpassword"}'

# Attempt 2
curl -X POST http://localhost:5000/api/customer/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "wrongpassword"}'

# Attempt 3
curl -X POST http://localhost:5000/api/customer/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "wrongpassword"}'
```

#### 2.3 Login with Correct Password (4th Attempt)
```bash
curl -X POST http://localhost:5000/api/customer/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "Test123!@#"}'
```

**Expected Response**:
```json
{
  "success": true,
  "requiresOTP": true,
  "message": "Suspicious login detected. Please verify with OTP sent to your email.",
  "data": {
    "customerId": "uuid-here",
    "email": "test@example.com"
  }
}
```

**Check Email**: You should receive an OTP email with subject "Security Alert: Login Verification Required"

#### 2.4 Verify OTP
```bash
curl -X POST http://localhost:5000/api/customer/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "uuid-from-previous-response",
    "otp": "123456",
    "purpose": "login"
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "message": "OTP verified successfully. Login complete.",
  "data": {
    "customer": { ... },
    "token": "jwt_token_here"
  }
}
```

### Test 3: Test Checkout OTP

#### 3.1 Request Checkout OTP
```bash
curl -X POST http://localhost:5000/api/orders/request-otp \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "your-customer-uuid",
    "orderTotal": 1250.50
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "message": "OTP has been sent to your email",
  "data": {
    "customerId": "uuid",
    "email": "test@example.com"
  }
}
```

**Check Email**: You should receive "Order Verification Code" email

#### 3.2 Verify Checkout OTP
```bash
curl -X POST http://localhost:5000/api/customer/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "your-customer-uuid",
    "otp": "123456",
    "purpose": "checkout"
  }'
```

#### 3.3 Submit Order (Now Allowed)
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "your-customer-uuid",
    "customerName": "Test User",
    "customerEmail": "test@example.com",
    "customerMobile": "1234567890",
    "deliveryAddress": {
      "street": "123 Test St",
      "city": "Test City",
      "pincode": "123456"
    },
    "items": [
      {
        "productId": "product-uuid",
        "name": "Test Product",
        "price": 100,
        "quantity": 2
      }
    ],
    "subtotal": 200,
    "total": 200,
    "paymentMethod": "COD"
  }'
```

---

## 🎨 Step 3: Test Frontend

### Test 1: Start Frontend

```bash
cd /Users/maropost/Documents/freshvilla/Project-files/freshvilla-customer-web
npm start
```

### Test 2: Test Login Flow

1. **Go to**: http://localhost:3000/MyAccountSignIn
2. **Enter valid credentials** (create account first if needed)
3. **Try 3 wrong passwords first** (deliberately fail 3 times)
4. **On 4th attempt, use correct password**
5. **Expected**: OTP modal appears with message about suspicious activity
6. **Check email** for OTP code
7. **Enter OTP** in modal
8. **Expected**: Login successful, redirected to account page

### Test 3: Test Checkout Flow

1. **Add items to cart**
2. **Go to checkout**: http://localhost:3000/Checkout
3. **Fill in delivery details**
4. **Login as customer** (if not already logged in)
5. **Click "Submit Order via WhatsApp"**
6. **Expected**: OTP modal appears asking to verify order
7. **Check email** for checkout OTP with order amount
8. **Enter OTP** in modal
9. **Expected**: OTP verified, order processed

### Test 4: Test OTP Expiry

1. **Trigger OTP** (login or checkout)
2. **Wait 10+ minutes**
3. **Try to verify with expired OTP**
4. **Expected**: Error message "OTP has expired"
5. **Click "Resend OTP"**
6. **Expected**: New OTP sent to email
7. **Verify with new OTP**
8. **Expected**: Success

### Test 5: Test Invalid OTP

1. **Trigger OTP**
2. **Enter wrong 6-digit code** (e.g., 999999)
3. **Expected**: Error message "Invalid OTP"
4. **Enter correct OTP**
5. **Expected**: Success

---

## 🐛 Common Issues & Solutions

### Issue 1: "SMTP connection error"
**Cause**: Email not configured  
**Solution**: Follow Step 1 to configure SMTP

### Issue 2: "OTP email not received"
**Possible causes**:
- Email in spam folder ✅ Check spam
- Wrong email address ✅ Verify customer email
- SMTP not working ✅ Check backend logs
- Email service rate limit ✅ Wait and try again

**Debug**:
```bash
# Check backend logs for email sending
cd /Users/maropost/Documents/freshvilla/Project-files/freshvilla-backend
npm run dev
# Watch console for "Email sent successfully" or errors
```

### Issue 3: "requiresOTP: true" but no OTP modal
**Cause**: Frontend not updated or API response not handled  
**Solution**: 
- Clear browser cache
- Check browser console for errors
- Verify CustomerAuthContext has `verifyOTP` function

### Issue 4: OTP verified but order still blocked
**Cause**: `emailOtpVerified` flag not set properly  
**Solution**: Check database:
```sql
SELECT id, email, "emailOtpVerified" FROM customers WHERE email = 'test@example.com';
```
Should show `emailOtpVerified: true` after verification

### Issue 5: Guest checkout (no login) fails
**Cause**: Guest users don't have OTP requirement  
**Expected behavior**: Guest checkout bypasses OTP (only logged-in users need OTP)

---

## 📦 Step 4: Deploy to Production

### 4.1 Backend Deployment

```bash
cd /Users/maropost/Documents/freshvilla/Project-files/freshvilla-backend

# Ensure .env has production SMTP settings
# Add to production .env (on server):
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-production-email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM=noreply@freshvilla.com

# Push to GitHub
git add .
git commit -m "feat: Add email OTP verification for login and checkout security"
git push origin main
```

### 4.2 Frontend Deployment

```bash
cd /Users/maropost/Documents/freshvilla/Project-files/freshvilla-customer-web

# Build for production
npm run build

# Deploy to GitHub Pages (if using gh-pages)
npm run deploy
```

### 4.3 Environment Variables Checklist

**Backend Production `.env`**:
```env
# Required for OTP to work
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM=noreply@freshvilla.com
FRONTEND_URL=https://yourdomain.com

# Existing vars
JWT_SECRET=your_jwt_secret
DB_HOST=your_db_host
DB_PORT=5432
DB_NAME=your_db_name
DB_USER=your_db_user
DB_PASSWORD=your_db_password
```

**Frontend Production `.env`**:
```env
REACT_APP_API_URL=https://your-backend-url.com/api
```

---

## ✅ Final Checklist

### Before Going Live:

- [ ] SMTP configured and tested (emails sending)
- [ ] All 3 failed login attempts trigger OTP on 4th success
- [ ] OTP emails received within 30 seconds
- [ ] OTP modal appears correctly
- [ ] OTP verification works
- [ ] OTP expiry works (10 minutes)
- [ ] Resend OTP works
- [ ] Checkout OTP flow works for logged-in users
- [ ] Guest checkout works without OTP
- [ ] Production SMTP credentials in backend `.env`
- [ ] Production API URL in frontend `.env`
- [ ] Backend deployed and running
- [ ] Frontend deployed and accessible

### Security Verification:

- [ ] OTPs are hashed in database (not plain text)
- [ ] OTP expires after 10 minutes
- [ ] OTP is single-use (cleared after verification)
- [ ] Failed login lockout still works (5 attempts = 15 min lock)
- [ ] Rate limiting active on login endpoint
- [ ] Suspicious login counter resets after OTP verification

---

## 📊 Monitoring After Launch

### What to Watch:

1. **Email Delivery Rate**
   - Check how many OTPs are sent vs delivered
   - Monitor spam rate

2. **OTP Verification Success Rate**
   - Track how many users successfully verify OTP
   - High failure rate = UX issue or email problems

3. **Suspicious Login Triggers**
   - Monitor how often OTP is triggered
   - Too many triggers = possible attack or users forgetting passwords

4. **User Complaints**
   - "Didn't receive OTP" = email issue
   - "OTP already expired" = users taking too long (consider extending to 15 min)

### Backend Logs to Monitor:

```bash
# Watch for these in production logs:
"Email sent successfully"       # ✅ Good
"Failed to send OTP"            # ⚠️ Email issue
"SMTP connection error"         # 🚨 SMTP down
"OTP has expired"               # ℹ️ User took >10 min
"Invalid OTP"                   # ⚠️ User entered wrong code (or attack)
```

---

## 🎯 Success Metrics

After 1 week, check:

- **Email Delivery**: >95% delivery rate
- **OTP Verification**: >80% users complete OTP verification
- **False Positives**: <5% legitimate users blocked by suspicious login
- **Security**: 0 unauthorized access attempts succeeding

---

## 🆘 Emergency Rollback

If OTP causes issues:

### Quick Disable (Frontend Only):
Comment out OTP checks in:
- `src/contexts/CustomerAuthContext.js` (line 39-46)
- `src/pages/Shop/EnhancedCheckout.jsx` (line 89-114)

### Full Rollback:
```bash
git revert HEAD
git push origin main
```

---

## 📞 Support & Resources

- **Email Service Docs**: 
  - Gmail: https://support.google.com/accounts/answer/185833
  - Mailgun: https://documentation.mailgun.com/
  - SendGrid: https://docs.sendgrid.com/

- **Test Email Tools**:
  - https://www.mail-tester.com/ (Check spam score)
  - https://mxtoolbox.com/ (DNS/MX records)

- **OTP Best Practices**:
  - Never share OTP in plain text over insecure channels
  - Use HTTPS for all OTP transmission
  - Log OTP requests for security auditing

---

**Last Updated**: 2025-10-26  
**Next Review**: After 1 week of production use
