# Email OTP Implementation - FreshVilla

**Status**: ✅ Backend Complete | ⏳ Frontend Pending  
**Date**: 2025-10-26  
**Type**: Zero-Cost Security Enhancement

---

## 📋 Overview

Implemented a **free email-based OTP system** with two security triggers:

1. **Suspicious Login Protection**: After 3 failed login attempts, if the 4th attempt succeeds with correct password, require email OTP verification
2. **Checkout Verification**: Before final order submission, require email OTP verification

---

## 🔐 Security Features

### Feature 1: Suspicious Login Detection
**Trigger**: 3 failed login attempts → successful login (4th attempt)  
**Action**: Send security alert email with 6-digit OTP  
**Expiry**: 10 minutes  
**Purpose**: Prevent unauthorized access after multiple failed attempts

### Feature 2: Checkout OTP
**Trigger**: User clicks "Place Order" button  
**Action**: Send checkout verification email with 6-digit OTP  
**Expiry**: 10 minutes  
**Purpose**: Verify order placement and prevent unauthorized purchases

---

## 🗄️ Database Changes

### Customer Model - New Fields

```javascript
emailOtp: STRING              // Hashed OTP code
emailOtpExpires: DATE         // OTP expiration timestamp
emailOtpVerified: BOOLEAN     // Verification status flag
suspiciousLoginAttempts: INT  // Counter for failed attempts before success
```

**Migration**: These fields will be auto-created by Sequelize on next server start.

---

## 🔌 Backend API Endpoints

### 1. Login with Suspicious Activity Detection

**Endpoint**: `POST /api/customer/auth/login`  
**Existing endpoint - modified behavior**

#### Normal Login Response (no suspicious activity):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "customer": { "id", "name", "email", "mobile" },
    "token": "jwt_token_here"
  }
}
```

#### Suspicious Login Response (requires OTP):
```json
{
  "success": true,
  "requiresOTP": true,
  "message": "Suspicious login detected. Please verify with OTP sent to your email.",
  "data": {
    "customerId": "uuid",
    "email": "user@example.com"
  }
}
```

**Frontend Action**: If `requiresOTP: true`, show OTP input modal.

---

### 2. Verify OTP (Login or Checkout)

**Endpoint**: `POST /api/customer/auth/verify-otp`  
**New endpoint**

#### Request Body:
```json
{
  "customerId": "uuid",
  "otp": "123456",
  "purpose": "login"  // or "checkout"
}
```

#### Response (Login Purpose):
```json
{
  "success": true,
  "message": "OTP verified successfully. Login complete.",
  "data": {
    "customer": { "id", "name", "email", "mobile" },
    "token": "jwt_token_here"
  }
}
```

#### Response (Checkout Purpose):
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "data": {
    "customerId": "uuid",
    "verified": true
  }
}
```

#### Error Responses:
- `400`: Missing fields, no OTP found, or OTP expired
- `401`: Invalid OTP
- `404`: Customer not found

---

### 3. Resend OTP

**Endpoint**: `POST /api/customer/auth/resend-otp`  
**New endpoint**

#### Request Body:
```json
{
  "customerId": "uuid",
  "purpose": "login"  // or "checkout"
}
```

#### Response:
```json
{
  "success": true,
  "message": "OTP has been resent to your email"
}
```

---

### 4. Request Checkout OTP

**Endpoint**: `POST /api/orders/request-otp`  
**New endpoint**

#### Request Body:
```json
{
  "customerId": "uuid",
  "orderTotal": 1250.50
}
```

#### Response:
```json
{
  "success": true,
  "message": "OTP has been sent to your email",
  "data": {
    "customerId": "uuid",
    "email": "user@example.com"
  }
}
```

---

### 5. Submit Order (Modified)

**Endpoint**: `POST /api/orders`  
**Existing endpoint - now requires OTP verification**

#### Request Body:
```json
{
  "customerId": "uuid",
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerMobile": "1234567890",
  "deliveryAddress": {...},
  "items": [...],
  "subtotal": 1000,
  "discount": 100,
  "deliveryCharge": 50,
  "total": 950,
  "paymentMethod": "COD"
}
```

#### Success Response:
```json
{
  "success": true,
  "message": "Order placed successfully",
  "data": { order object }
}
```

#### OTP Not Verified Error:
```json
{
  "success": false,
  "message": "Please verify OTP before placing order",
  "requiresOTP": true
}
```

**Frontend Action**: If `requiresOTP: true`, call `/api/orders/request-otp` then show OTP modal.

---

## 📧 Email Templates

### 1. Suspicious Login OTP Email

**Subject**: Security Alert: Login Verification Required - FreshVilla

```
⚠️ Security Verification Required

Hi {userName},

We detected multiple failed login attempts followed by a successful 
login to your account.

For your security, please verify this login with the OTP code below:

    ┌─────────────┐
    │   123456    │
    └─────────────┘

This OTP will expire in 10 minutes.

If this wasn't you, please change your password immediately.
```

### 2. Checkout OTP Email

**Subject**: Order Verification Code - FreshVilla

```
🛒 Complete Your Order

Hi {userName},

You're almost done! Please verify your order with the OTP code below:

    ┌─────────────┐
    │   123456    │
    └─────────────┘

Order Amount: ₹1,250.50

This OTP will expire in 10 minutes.
```

---

## 🎨 Frontend Implementation Guide

### Required UI Components

#### 1. OTP Input Modal Component
```jsx
<OTPModal
  isOpen={showOTPModal}
  onClose={() => setShowOTPModal(false)}
  onVerify={handleOTPVerify}
  onResend={handleOTPResend}
  purpose="login" // or "checkout"
  customerId={customerId}
  email={customerEmail}
/>
```

**Features**:
- 6-digit OTP input field
- Timer countdown (10 minutes)
- Resend OTP button (disabled until timer expires or on cooldown)
- Error message display
- Loading state during verification

---

### Implementation Steps

#### Step 1: Login Flow Modification

**File**: `src/pages/Login.js` or `src/components/LoginForm.js`

```javascript
const handleLogin = async (email, password) => {
  try {
    const response = await fetch('/api/customer/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (data.requiresOTP) {
      // Show OTP modal
      setCustomerId(data.data.customerId);
      setCustomerEmail(data.data.email);
      setOTPPurpose('login');
      setShowOTPModal(true);
    } else if (data.success) {
      // Normal login - save token and redirect
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('customer', JSON.stringify(data.data.customer));
      navigate('/');
    } else {
      setError(data.message);
    }
  } catch (error) {
    setError('Login failed. Please try again.');
  }
};

const handleOTPVerify = async (otp) => {
  try {
    const response = await fetch('/api/customer/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId,
        otp,
        purpose: 'login'
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Save token and redirect
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('customer', JSON.stringify(data.data.customer));
      setShowOTPModal(false);
      navigate('/');
    } else {
      setOTPError(data.message);
    }
  } catch (error) {
    setOTPError('Verification failed. Please try again.');
  }
};
```

---

#### Step 2: Checkout Flow Modification

**File**: `src/pages/Checkout.js` or `src/components/CheckoutForm.js`

```javascript
const [otpRequested, setOTPRequested] = useState(false);

const handlePlaceOrder = async () => {
  // First, request OTP
  if (!otpRequested) {
    try {
      const response = await fetch('/api/orders/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: customer.id,
          orderTotal: orderData.total
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setOTPRequested(true);
        setCustomerId(data.data.customerId);
        setCustomerEmail(data.data.email);
        setOTPPurpose('checkout');
        setShowOTPModal(true);
      }
    } catch (error) {
      setError('Failed to send OTP. Please try again.');
    }
    return;
  }
  
  // OTP verified - submit order
  await submitOrder();
};

const handleCheckoutOTPVerify = async (otp) => {
  try {
    const response = await fetch('/api/customer/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId,
        otp,
        purpose: 'checkout'
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      setShowOTPModal(false);
      // Now submit the order
      await submitOrder();
    } else {
      setOTPError(data.message);
    }
  } catch (error) {
    setOTPError('Verification failed. Please try again.');
  }
};

const submitOrder = async () => {
  try {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    
    const data = await response.json();
    
    if (data.requiresOTP) {
      // Shouldn't happen if OTP verified, but handle it
      setShowOTPModal(true);
    } else if (data.success) {
      // Order placed successfully
      navigate('/order-success', { state: { order: data.data } });
    } else {
      setError(data.message);
    }
  } catch (error) {
    setError('Order submission failed. Please try again.');
  }
};
```

---

#### Step 3: OTP Modal Component

**File**: `src/components/OTPModal.js`

```jsx
import React, { useState, useEffect } from 'react';

const OTPModal = ({ isOpen, onClose, onVerify, onResend, purpose, customerId, email }) => {
  const [otp, setOTP] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  
  useEffect(() => {
    if (!isOpen) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isOpen]);
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError('Please enter a 6-digit OTP');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await onVerify(otp);
    } catch (err) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };
  
  const handleResend = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/customer/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, purpose })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTimeLeft(600);
        setCanResend(false);
        setOTP('');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>
          {purpose === 'login' ? '⚠️ Security Verification' : '🛒 Verify Your Order'}
        </h2>
        <p>Enter the 6-digit code sent to {email}</p>
        
        <input
          type="text"
          maxLength={6}
          value={otp}
          onChange={(e) => setOTP(e.target.value.replace(/\D/g, ''))}
          placeholder="000000"
          className="otp-input"
          disabled={loading}
        />
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="timer">
          Time remaining: {formatTime(timeLeft)}
        </div>
        
        <div className="modal-actions">
          <button
            onClick={handleVerify}
            disabled={loading || otp.length !== 6}
            className="btn-primary"
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
          
          <button
            onClick={handleResend}
            disabled={!canResend || loading}
            className="btn-secondary"
          >
            Resend OTP
          </button>
          
          <button onClick={onClose} className="btn-cancel">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default OTPModal;
```

---

## 🧪 Testing Guide

### Test Scenario 1: Suspicious Login

1. **Create test customer** or use existing account
2. **Attempt 3 failed logins** with wrong password
3. **Login with correct password** (4th attempt)
4. **Expected**: OTP sent to email, login requires verification
5. **Verify OTP** from email
6. **Expected**: Login successful, token received

### Test Scenario 2: Checkout OTP

1. **Login as customer**
2. **Add items to cart**
3. **Proceed to checkout**
4. **Click "Place Order"**
5. **Expected**: OTP sent to email, order blocked until verification
6. **Verify OTP** from email
7. **Expected**: Order placed successfully

### Test Scenario 3: OTP Expiry

1. **Trigger OTP** (login or checkout)
2. **Wait 10+ minutes**
3. **Try to verify expired OTP**
4. **Expected**: "OTP has expired" error
5. **Click "Resend OTP"**
6. **Expected**: New OTP sent

### Test Scenario 4: Invalid OTP

1. **Trigger OTP**
2. **Enter wrong 6-digit code**
3. **Expected**: "Invalid OTP" error
4. **Try again with correct OTP**
5. **Expected**: Success

---

## 🚀 Deployment Checklist

### Backend (Already Complete ✅)
- [x] Customer model updated with OTP fields
- [x] Email service functions created
- [x] Login route modified for suspicious activity
- [x] OTP verification endpoint added
- [x] OTP resend endpoint added
- [x] Order request OTP endpoint added
- [x] Order submission modified to require OTP

### Frontend (To Do ⏳)
- [ ] Create OTP modal component
- [ ] Modify login page to handle OTP requirement
- [ ] Modify checkout page to request and verify OTP
- [ ] Add OTP input validation
- [ ] Add countdown timer UI
- [ ] Add resend OTP button
- [ ] Test all flows end-to-end

### Environment (Already Set ✅)
- [x] SMTP configured and working
- [x] Email templates ready
- [x] Database can auto-create new fields

---

## 💰 Cost Analysis

**Total Cost**: **₹0 (FREE)** 🎉

- Email sending: Using existing SMTP setup (already paid for or free tier)
- No SMS charges
- No third-party OTP service fees
- No WhatsApp API costs

**Comparison**:
- SMS OTP: ₹0.10-₹0.15 per message = ₹200-300/month for 2000 users
- WhatsApp OTP: ₹0.25-₹0.40 per message = ₹500-800/month for 2000 users
- **Email OTP: ₹0** ✅

---

## 🔒 Security Notes

1. **OTP Storage**: OTPs are hashed with SHA-256 before storing (same as passwords)
2. **Expiry**: All OTPs expire after 10 minutes
3. **Single Use**: OTP is cleared after successful verification
4. **Rate Limiting**: Login endpoint has existing rate limit (5 attempts per 15 minutes)
5. **Account Lockout**: Still active after 5 failed login attempts
6. **Session Security**: JWT tokens used for authenticated sessions

---

## 📝 Notes

- OTP is **6 digits** (100000-999999)
- OTP emails are **non-blocking** (sent asynchronously)
- Failed email sends are **logged but don't block** the flow
- Suspicious login counter **resets** after successful OTP verification
- Checkout OTP flag **resets** after successful order placement

---

## 🆘 Troubleshooting

### Issue: OTP email not received
- Check SMTP settings in `.env`
- Verify email service is running (check logs)
- Check spam/junk folder
- Use resend OTP feature

### Issue: "OTP expired" even though just sent
- Check server timezone configuration
- Verify database timestamps are correct
- Check if system clock is synchronized

### Issue: Order submission blocked without OTP request
- Ensure frontend calls `/api/orders/request-otp` before submitting order
- Check that `customerId` is included in order submission
- Verify OTP verification response is handled correctly

---

**Next Steps**: Implement frontend OTP modal and integrate with login/checkout flows.
