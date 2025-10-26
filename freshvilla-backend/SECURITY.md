# FreshVilla Backend Security

## ✅ Security Measures Implemented

### 1. **Helmet.js** - HTTP Headers Security
- Content Security Policy configured
- Cross-Origin protections
- XSS protection headers
- DNS prefetch control

### 2. **CORS - Cross-Origin Resource Sharing**
- Whitelist of allowed origins only
- Credentials support enabled securely
- Development mode exception for testing

**Allowed Origins:**
- `http://localhost:3000` (development)
- `https://freshvilla.in` (production)
- `https://www.freshvilla.in`
- `https://bhupesh-moudgil.github.io`

### 3. **Rate Limiting**
- **General API**: 100 requests per 15 minutes
- **Authentication**: 5 attempts per 15 minutes
- **Password Reset**: 3 requests per hour
- IP-based tracking
- Automatic blocking

### 4. **Cookie Security**
- Signed cookies with secret key
- HTTP-only (no JavaScript access)
- Secure flag in production (HTTPS only)
- SameSite: strict (CSRF protection)
- 24-hour expiration with rolling renewal

### 5. **Session Security**
- Unique session IDs
- Secure session storage
- Domain-scoped cookies
- Rolling expiration
- CSRF protection via SameSite

### 6. **Input Sanitization** (Custom Middleware)
Our custom `sanitizeInput` middleware provides:
- **XSS Prevention**: Strips HTML tags and scripts
- **SQL Injection Protection**: Blocks SQL patterns
- **NoSQL Injection Protection**: Detects MongoDB operators
- **Command Injection Protection**: Blocks shell commands
- **Path Traversal Protection**: Sanitizes file paths
- **Email Validation**: RFC-compliant
- **Dangerous Pattern Detection**: Blocks suspicious inputs

**Sanitizes:**
- Request body (`req.body`)
- Note: Query params handled by routes individually

### 7. **JWT Authentication**
- Secure token generation
- 7-day expiration
- Password hashing with bcrypt
- Token verification middleware
- Role-based access control

### 8. **Database Security (PostgreSQL)**
- Parameterized queries (Sequelize ORM)
- UUID primary keys
- Connection pooling
- Encrypted credentials
- No SQL injection vulnerability

### 9. **Password Security**
- Bcrypt hashing (10 rounds)
- Passwords never stored in plaintext
- Hashed before database save
- Excluded from API responses by default

### 10. **File Upload Security** (For Image Uploads)
- File type validation
- Size limits (500KB for products)
- MIME type verification
- Filename sanitization
- Content validation with Sharp
- Dimension limits

### 11. **Error Handling**
- Centralized error handler
- No stack traces in production
- Sanitized error messages
- Security event logging

## 🛡️ Security Practices

### What We DO:
✅ Validate all inputs
✅ Sanitize user data  
✅ Use HTTPS in production
✅ Rate limit all endpoints
✅ Hash passwords with bcrypt
✅ Use JWT for stateless auth
✅ Implement CORS properly
✅ Secure cookies and sessions
✅ Parameterized database queries
✅ Role-based access control

### What We DON'T Store:
❌ Plain-text passwords
❌ Sensitive data in logs
❌ API keys in code
❌ Unencrypted credentials

## 📋 Removed Packages (Compatibility Issues)

### express-mongo-sanitize
- **Reason**: Causes readonly property errors in Express 4.19+
- **Replacement**: Custom sanitization in `sanitizeInput` middleware
- **Coverage**: NoSQL injection patterns detected and blocked

### hpp (HTTP Parameter Pollution)
- **Reason**: Incompatible with Express 4.19+ readonly properties
- **Replacement**: Parameter validation in routes
- **Coverage**: Handled by input sanitization

## 🔒 Production Recommendations

### Environment Variables (Must Set):
```env
JWT_SECRET=<strong-random-secret-min-32-chars>
SESSION_SECRET=<different-strong-secret>
COOKIE_SECRET=<another-strong-secret>
NODE_ENV=production
DB_PASSWORD=<strong-database-password>
```

### Generate Secrets:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### SSL/TLS:
- Use HTTPS only in production
- Redirect HTTP to HTTPS
- Use SSL certificates (Let's Encrypt recommended)

### Database:
- Enable SSL connections
- Use connection pooling
- Regular backups
- Rotate credentials periodically

### Monitoring:
- Log security events
- Monitor rate limit violations
- Track failed login attempts
- Alert on suspicious patterns

## 🚨 Security Incident Response

If you detect a security issue:

1. **Immediate**: Rotate all secrets (JWT, SESSION, DB passwords)
2. **Investigate**: Check logs for unauthorized access
3. **Patch**: Update vulnerable dependencies
4. **Notify**: Inform affected users if data compromised
5. **Document**: Record incident and response

## 📊 Security Audit Checklist

- [x] Input validation on all endpoints
- [x] Rate limiting enabled
- [x] CORS configured properly
- [x] Passwords hashed with bcrypt
- [x] JWT tokens expire
- [x] HTTPS enforced in production
- [x] Secrets in environment variables
- [x] Error messages sanitized
- [x] File uploads validated
- [x] SQL injection protected (ORM)
- [x] XSS protection enabled
- [x] CSRF protection via SameSite cookies

## 🔐 Secure by Design

Our security approach:
1. **Defense in Depth**: Multiple layers of security
2. **Principle of Least Privilege**: Minimal permissions
3. **Fail Securely**: Errors don't expose data
4. **Security by Default**: Secure settings out of the box

---

**Last Updated**: November 2024  
**Security Version**: 1.0
**Status**: ✅ Production Ready with Proper Security
