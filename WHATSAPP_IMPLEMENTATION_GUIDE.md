# WhatsApp Mobile Verification System - Implementation Guide

**Status**: ✅ Foundation Complete | ⏳ In Progress  
**Date**: 2025-10-26  
**Estimated Time**: 2-3 weeks

---

## ✅ What's Been Built (Phase 1)

### **Backend:**
1. ✅ Customer model updated with mobile verification fields
2. ✅ WhatsApp service layer created (`src/services/whatsappService.js`)
3. ✅ Rate limiting implemented (10/hour, 100/day for verification)
4. ✅ Message templates with randomization
5. ✅ Anti-spam measures (30-90 second delays)

---

## 🚀 Next Steps to Complete

### **Phase 2: Mobile Verification API Endpoints** (2-3 hours)

Create `/Users/maropost/Documents/freshvilla/Project-files/freshvilla-backend/src/routes/mobileVerification.js`:

```javascript
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Customer = require('../models/Customer');
const { sendMobileVerification } = require('../services/whatsappService');
const rateLimit = require('express-rate-limit');

// Rate limiter for verification requests
const verificationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // max 3 requests per hour per IP
  message: 'Too many verification requests. Please try again later.'
});

// @route   POST /api/mobile-verification/send
// @desc    Send mobile verification link via WhatsApp
// @access  Private (requires customer authentication)
router.post('/send', verificationLimiter, async (req, res) => {
  try {
    const { customerId, mobile } = req.body;

    if (!mobile || !/^[0-9]{10}$/.test(mobile)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit mobile number'
      });
    }

    const customer = await Customer.findByPk(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Check if already verified
    if (customer.mobileVerified && customer.mobile === mobile) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number already verified'
      });
    }

    // Check daily attempt limit (max 3 per day)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    if (customer.mobileVerificationSentAt > oneDayAgo && customer.mobileVerificationAttempts >= 3) {
      return res.status(429).json({
        success: false,
        message: 'Maximum verification attempts reached. Please try again tomorrow.'
      });
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(verificationToken).digest('hex');

    // Update customer
    customer.mobile = mobile;
    customer.mobileVerificationToken = tokenHash;
    customer.mobileVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    customer.mobileVerificationSentAt = new Date();
    customer.mobileVerificationAttempts = (customer.mobileVerificationAttempts || 0) + 1;
    await customer.save();

    // Send WhatsApp message (async - will take 30-90 seconds due to anti-spam delay)
    sendMobileVerification(customer.name, mobile, verificationToken)
      .then(result => {
        if (!result.success) {
          console.error('Failed to send verification:', result.error);
        }
      })
      .catch(err => {
        console.error('Error sending verification:', err);
      });

    res.json({
      success: true,
      message: 'Verification link will be sent to your WhatsApp within 2 minutes. Please check your messages.',
      data: {
        mobile: mobile,
        expiresIn: '24 hours'
      }
    });
  } catch (error) {
    console.error('Mobile verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send verification. Please try again.'
    });
  }
});

// @route   GET /api/mobile-verification/verify
// @desc    Verify mobile number via token (when user clicks link)
// @access  Public
router.get('/verify', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required'
      });
    }

    // Hash the token to match stored hash
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const customer = await Customer.findOne({
      where: { mobileVerificationToken: tokenHash }
    });

    if (!customer) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    // Check if token expired
    if (customer.mobileVerificationExpires < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Verification link has expired. Please request a new one.'
      });
    }

    // Verify mobile
    customer.mobileVerified = true;
    customer.mobileVerificationToken = null;
    customer.mobileVerificationExpires = null;
    customer.mobileVerificationAttempts = 0; // Reset attempts after successful verification
    await customer.save();

    // Redirect to success page or return JSON
    res.json({
      success: true,
      message: 'Mobile number verified successfully! You will now receive order updates on WhatsApp.',
      data: {
        mobile: customer.mobile,
        verified: true
      }
    });
  } catch (error) {
    console.error('Mobile verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Verification failed. Please try again.'
    });
  }
});

module.exports = router;
```

**Add to `server.js`:**
```javascript
const mobileVerificationRoutes = require('./src/routes/mobileVerification');
app.use('/api/mobile-verification', mobileVerificationRoutes);
```

---

### **Phase 3: wppconnect-server Setup** (1-2 hours)

**Step 1: Install wppconnect-server**

```bash
cd /Users/maropost/Documents/freshvilla/Project-files
git clone https://github.com/wppconnect-team/wppconnect-server.git
cd wppconnect-server
npm install
```

**Step 2: Configure `src/config.ts`**

```typescript
export default {
  secretKey: 'YOUR_SECURE_SECRET_KEY_HERE', // Change this!
  host: 'http://localhost',
  port: '21465',
  deviceName: 'FreshVilla',
  startAllSession: false, // Don't auto-start
  tokenStoreType: 'file',
  webhook: {
    url: 'http://localhost:5000/api/webhooks/whatsapp', // Your backend webhook
    autoDownload: false,
    uploadS3: false,
    readMessage: false,
    allUnreadOnStart: false,
  },
  log: {
    level: 'info',
    logger: ['console', 'file'],
  }
};
```

**Step 3: Start wppconnect-server**

```bash
npm run dev
```

Server will start on http://localhost:21465

**Step 4: Generate Token**

```bash
curl -X POST http://localhost:21465/api/freshvilla/YOUR_SECRET_KEY/generate-token
```

Save the token - you'll need it!

**Step 5: Add to FreshVilla Backend `.env`:**

```env
# WhatsApp Configuration
WPPCONNECT_URL=http://localhost:21465
WPPCONNECT_SESSION=freshvilla
WPPCONNECT_TOKEN=your_generated_token_here
```

**Step 6: Start WhatsApp Session (scan QR code):**

```bash
curl -X POST http://localhost:21465/api/freshvilla/start-session \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Open http://localhost:21465/api/freshvilla/qrcode-session in browser
Scan QR code with your WhatsApp Business number

---

### **Phase 4: Frontend Integration** (3-4 hours)

**A. Add Mobile Verification Page**

Create `/Users/maropost/Documents/freshvilla/Project-files/freshvilla-customer-web/src/pages/Accounts/VerifyMobile.jsx`:

```jsx
import React, { useState } from 'react';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import axios from 'axios';
import Swal from 'sweetalert2';

const VerifyMobile = () => {
  const { customer } = useCustomerAuth();
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendVerification = async (e) => {
    e.preventDefault();
    
    if (!/^[0-9]{10}$/.test(mobile)) {
      Swal.fire('Error', 'Please enter a valid 10-digit mobile number', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/mobile-verification/send`,
        { customerId: customer.id, mobile }
      );

      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Verification Sent!',
          html: `
            <p>Check your WhatsApp for verification link</p>
            <p class="text-muted">Message will arrive within 2 minutes</p>
          `,
          confirmButtonColor: '#0aad0a'
        });
      }
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Failed to send verification', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!customer) {
    return <div>Please login first</div>;
  }

  if (customer.mobileVerified) {
    return (
      <div className="container my-5">
        <div className="alert alert-success">
          ✅ Mobile number verified: {customer.mobile}
        </div>
      </div>
    );
  }

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-success text-white">
              <h4 className="mb-0">📱 Verify Mobile Number</h4>
            </div>
            <div className="card-body">
              <p>Verify your mobile to receive order updates on WhatsApp</p>
              
              <form onSubmit={handleSendVerification}>
                <div className="mb-3">
                  <label className="form-label">Mobile Number</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="10-digit mobile number"
                    maxLength="10"
                    required
                  />
                  <small className="text-muted">You'll receive a verification link on WhatsApp</small>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-success w-100"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Sending...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-whatsapp me-2"></i>
                      Send Verification via WhatsApp
                    </>
                  )}
                </button>
              </form>

              <div className="alert alert-info mt-3 mb-0">
                <small>
                  <strong>Note:</strong> You can send max 3 verification requests per day
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyMobile;
```

**B. Add Verification Success Page**

Create `/Users/maropost/Documents/freshvilla/Project-files/freshvilla-customer-web/src/pages/MobileVerificationSuccess.jsx`:

```jsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';

const MobileVerificationSuccess = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link');
      return;
    }

    // Verify token
    axios.get(`${process.env.REACT_APP_API_URL}/api/mobile-verification/verify?token=${token}`)
      .then(response => {
        if (response.data.success) {
          setStatus('success');
          setMessage(response.data.message);
        } else {
          setStatus('error');
          setMessage(response.data.message);
        }
      })
      .catch(error => {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Verification failed');
      });
  }, [searchParams]);

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          {status === 'loading' && (
            <div className="text-center">
              <div className="spinner-border text-success" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Verifying your mobile number...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="card border-success">
              <div className="card-body text-center">
                <div className="mb-3">
                  <i className="bi bi-check-circle-fill text-success" style={{fontSize: '4rem'}}></i>
                </div>
                <h3 className="text-success">Mobile Verified!</h3>
                <p>{message}</p>
                <Link to="/MyAccountOrder" className="btn btn-success">
                  Go to My Account
                </Link>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="card border-danger">
              <div className="card-body text-center">
                <div className="mb-3">
                  <i className="bi bi-x-circle-fill text-danger" style={{fontSize: '4rem'}}></i>
                </div>
                <h3 className="text-danger">Verification Failed</h3>
                <p>{message}</p>
                <Link to="/verify-mobile" className="btn btn-primary">
                  Try Again
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileVerificationSuccess;
```

**C. Add Routes**

In `App.js`:
```jsx
import VerifyMobile from './pages/Accounts/VerifyMobile';
import MobileVerificationSuccess from './pages/MobileVerificationSuccess';

// Add routes
<Route path="/verify-mobile-page" element={<VerifyMobile />} />
<Route path="/verify-mobile" element={<MobileVerificationSuccess />} />
```

---

### **Phase 5: Testing** (1-2 hours)

**Test Checklist:**

```bash
# 1. Start wppconnect-server
cd /path/to/wppconnect-server
npm run dev

# 2. Scan QR code with WhatsApp Business number
# Open http://localhost:21465/api-docs in browser

# 3. Start backend
cd /path/to/freshvilla-backend
npm run dev

# 4. Test verification flow
# - Login as customer
# - Go to /verify-mobile-page
# - Enter mobile number
# - Click "Send Verification"
# - Wait 30-90 seconds
# - Check WhatsApp for message
# - Click link in WhatsApp
# - Should redirect to success page
```

---

## 📊 Safety Monitoring

### **Daily Checks:**

1. **Rate Limit Status:**
```bash
# Add endpoint to check limits
GET /api/whatsapp/rate-limits
# Returns: { verification: {hourly, daily}, notifications: {hourly, daily} }
```

2. **Session Health:**
```bash
GET /api/whatsapp/session-status
# Returns: { connected: true/false, status: "CONNECTED" }
```

3. **Message Success Rate:**
- Track delivery success
- If <80% success, pause sending
- Alert admin

---

## ⚠️ Warning Signs to Watch For:

```
🚨 STOP IMMEDIATELY IF:
1. Session disconnects frequently (>3 times/day)
2. Messages fail to deliver (>20% failure rate)
3. Numbers start blocking/reporting
4. "Temporarily blocked" message appears

📊 MONITOR DAILY:
- Verification requests sent
- Success rate
- Session uptime
- Rate limit usage
```

---

## 🎯 Production Deployment

**Before going live:**

1. ✅ Test with 10 real numbers
2. ✅ Monitor for 3 days
3. ✅ Adjust delays if needed
4. ✅ Have backup WhatsApp number ready
5. ✅ Set up alerts for failures
6. ✅ Document recovery procedures

---

## 📝 Maintenance Tasks

**Weekly:**
- Check message success rate
- Review rate limit usage
- Test QR code refresh
- Backup session data

**Monthly:**
- Rotate WhatsApp number (if needed)
- Review templates (update if stale)
- Analyze user feedback
- Optimize delays

---

## 🆘 Troubleshooting

### Issue 1: Session Won't Connect
```
Solution:
1. Restart wppconnect-server
2. Clear session: rm -rf userDataDir/
3. Re-scan QR code
```

### Issue 2: Messages Not Sending
```
Check:
1. Session status: GET /api/:session/status-session
2. Rate limits: Are you over limit?
3. Phone format: Must be 919876543210 (country code + number)
4. Backend logs: Check for errors
```

### Issue 3: Number Banned
```
Recovery:
1. Stop sending immediately
2. Switch to backup number
3. Wait 30 days before using banned number
4. Review what triggered ban
5. Adjust rate limits lower
```

---

## 💰 Cost Tracking

```
Estimated Monthly Costs:
- wppconnect server (VPS): ₹500-800
- WhatsApp SIM: ₹100 (if need new number)
- Backup number: ₹100 one-time
Total: ~₹600-1000/month
```

**Messages:** Unlimited (free via WhatsApp Web automation)

---

## ✅ Current Status

**Completed:**
- ✅ Backend mobile verification fields
- ✅ WhatsApp service with rate limiting
- ✅ Anti-spam measures
- ✅ Message templates

**To Do:**
- ⏳ Add mobile verification API routes
- ⏳ Set up wppconnect-server locally
- ⏳ Create frontend verification pages
- ⏳ Test end-to-end flow
- ⏳ Deploy and monitor

---

**Estimated Time Remaining:** 6-8 hours of development + 2-3 days of testing

**Next Step:** Create mobile verification API routes (see Phase 2 above)

