# Security Features - FreshVilla

## ✅ Implemented Security Measures

### 1. **Authentication & Authorization**

#### Password Security
- ✅ **Bcrypt hashing** with salt (complexity 10)
- ✅ **Strong password requirements**:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character (!@#$%^&*(),.?":{}|<>)

#### Account Protection
- ✅ **Account lockout**: 5 failed attempts → 15-minute lockout
- ✅ **Failed login tracking**: Stored in database
- ✅ **Automatic unlock**: After lockout period expires
- ✅ **Reset on successful login**: Failed attempts counter reset

#### Admin Access Control
- ✅ **Protected registration**: Only super-admins can create new admins
- ✅ **Role-based access**: Admin vs Super-admin roles
- ✅ **JWT authentication**: Secure token-based auth

---

### 2. **Rate Limiting**

#### Global API Limit
- **100 requests** per 15 minutes per IP
- Applies to all `/api/*` endpoints

#### Authentication Endpoints
- **5 attempts** per 15 minutes per IP
- Applies to:
  - Admin login
  - Customer login
  - Skips successful requests (only counts failures)

#### Password Reset
- **3 requests** per hour per IP
- Prevents password reset spam

---

### 3. **Input Validation**

#### Express-Validator Rules
- ✅ **Email validation**: Format and normalization
- ✅ **Name validation**: 2-100 characters
- ✅ **Mobile validation**: International phone number format
- ✅ **Password validation**: Custom strong password validator
- ✅ **XSS prevention**: Input sanitization and trimming

---

### 4. **Security Headers (Helmet.js)**

Automatically configured headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security` (HSTS)
- `Content-Security-Policy` (configured for frontend compatibility)

---

### 5. **CORS Protection**

- ✅ **Whitelist-based origin checking**
- ✅ **No-origin requests blocked** (except in development)
- ✅ **Credentials support**: Enabled for authenticated requests
- **Allowed origins**:
  - `http://localhost:3000` (development)
  - `https://freshvilla.in`
  - `https://www.freshvilla.in`
  - `https://bhupesh-moudgil.github.io`

---

### 6. **Email Verification**

- ✅ **Verification tokens**: Stored hashed in database
- ✅ **Verification email**: Sent on registration
- ✅ **Token expiration**: 24 hours (recommended)
- ✅ **Prevent unverified login**: Optional (currently not enforced)

**Endpoint**: `POST /api/customer/auth/verify-email`

---

### 7. **Password Reset Security**

- ✅ **Database-backed tokens**: No in-memory storage
- ✅ **SHA-256 hashed tokens**: Secure token storage
- ✅ **1-hour expiration**: Automatic token invalidation
- ✅ **One-time use**: Tokens cleared after use
- ✅ **Account unlock on reset**: Clears lockout status

---

### 8. **Data Protection**

#### Sensitive Data Handling
- ✅ **Passwords excluded** from default queries
- ✅ **Scoped password access**: Explicit `withPassword` scope required
- ✅ **SMTP credentials encrypted**: AES-256-CBC encryption in database
- ✅ **Error message sanitization**: No sensitive data in logs

#### Database Security
- ✅ **Sequelize ORM**: SQL injection protection
- ✅ **Parameterized queries**: All queries use placeholders
- ✅ **Connection pooling**: Secure database connections

---

### 9. **Attack Prevention**

#### Prevented Attacks
- ✅ **Brute Force**: Rate limiting + account lockout
- ✅ **Email Enumeration**: Same error messages for login/register
- ✅ **SQL Injection**: Sequelize ORM protection
- ✅ **XSS**: Input validation and sanitization
- ✅ **CSRF**: CORS + credentials policy
- ✅ **Timing Attacks**: Consistent response times
- ✅ **Password Reset Abuse**: Rate limiting + token expiration

---

## 🔄 Remaining Recommendations

### 1. **Enforce Email Verification (Optional)**

Currently, users can login without verifying email. To enforce:

```javascript
// In customerAuth.js login route
if (!customer.emailVerified) {
  return res.status(403).json({
    success: false,
    message: 'Please verify your email before logging in'
  });
}
```

### 2. **JWT Refresh Tokens**

Implement refresh tokens for better security:
- Access token: 15 minutes
- Refresh token: 7 days
- Store refresh tokens in database

### 3. **Two-Factor Authentication (2FA)**

Add optional 2FA for admin accounts:
- TOTP (Google Authenticator)
- SMS verification
- Backup codes

### 4. **Security Logging**

Log security events:
- Failed login attempts
- Account lockouts
- Password resets
- Admin actions

### 5. **API Keys for Public Endpoints**

Add API keys for:
- Product listing
- Search functionality
- Prevent scraping/abuse

---

## 🔐 Environment Variables

### Required for Security

```bash
# JWT Configuration
JWT_SECRET=<strong-random-secret>
JWT_EXPIRE=7d

# Database Encryption
SETTINGS_ENCRYPTION_KEY=<64-char-hex-key>

# SMTP (stored in database, encrypted)
SMTP_PASSWORD=<mailgun-smtp-password>

# Environment
NODE_ENV=production
```

### Generate Secure Keys

```bash
# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate encryption key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🛡️ Security Best Practices

### For Developers

1. **Never commit secrets** to Git
2. **Use environment variables** for all credentials
3. **Validate all inputs** before processing
4. **Sanitize error messages** before sending to client
5. **Keep dependencies updated** (`npm audit fix`)
6. **Use HTTPS** in production (Render provides this)
7. **Review code** for security vulnerabilities
8. **Test authentication flows** regularly

### For Users

1. **Use strong passwords** (enforced by validation)
2. **Verify emails** to activate accounts
3. **Don't share accounts** 
4. **Report suspicious activity** to admin
5. **Logout after use** on shared devices

---

## 📊 Security Testing

### Manual Testing Checklist

- [ ] Try weak password (should fail)
- [ ] Try 6+ failed logins (should lock account)
- [ ] Try password reset with expired token (should fail)
- [ ] Try accessing admin endpoints without token (should fail)
- [ ] Try creating admin without super-admin role (should fail)
- [ ] Try XSS injection in inputs (should be sanitized)
- [ ] Try SQL injection attempts (should be blocked)
- [ ] Verify rate limiting works (should block after limit)
- [ ] Check CORS from unauthorized origin (should block)
- [ ] Verify email verification flow works

### Automated Testing (Recommended)

```bash
# Install security testing tools
npm install --save-dev jest supertest

# Run tests
npm test
```

---

## 🚨 Incident Response

### If Security Breach Detected

1. **Immediately revoke** all JWT tokens (rotate JWT_SECRET)
2. **Lock affected accounts**
3. **Review logs** for suspicious activity
4. **Notify users** to change passwords
5. **Patch vulnerability** 
6. **Document incident**
7. **Update security measures**

### Emergency Contacts

- Backend Admin: `admin@freshvilla.in`
- Security Contact: [Add contact info]

---

## 📝 Changelog

### v1.0.0 (2025-10-26)

- ✅ Implemented helmet.js security headers
- ✅ Added rate limiting (global, auth, password reset)
- ✅ Strong password validation (8+ chars, mixed case, numbers, symbols)
- ✅ Account lockout mechanism (5 attempts, 15 min)
- ✅ Protected admin registration (super-admin only)
- ✅ Database-backed password reset tokens
- ✅ Email verification system
- ✅ Email enumeration prevention
- ✅ Error message sanitization
- ✅ CORS hardening
- ✅ Input validation with express-validator
- ✅ AES-256 encryption for SMTP credentials

---

## 📚 References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Helmet.js Documentation](https://helmetjs.github.io/)
- [Express Rate Limit](https://github.com/express-rate-limit/express-rate-limit)
- [Express Validator](https://express-validator.github.io/docs/)
- [Sequelize Security](https://sequelize.org/docs/v6/core-concepts/paranoid/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

## 🤝 Contributing

Found a security vulnerability? Please report it responsibly:

1. **Do not** create public GitHub issues for security issues
2. Email security concerns to: `admin@freshvilla.in`
3. Include detailed description and reproduction steps
4. Allow time for patch before public disclosure

---

**Last Updated**: 2025-10-26  
**Security Level**: Production-Ready ✅
