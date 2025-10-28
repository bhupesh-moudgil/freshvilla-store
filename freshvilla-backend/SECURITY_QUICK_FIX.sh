#!/bin/bash

# ==========================================================================
# FRESHVILLA SECURITY QUICK FIX SCRIPT
# ==========================================================================
# This script helps you quickly fix the most critical security issues
# Run this BEFORE deploying to production!
# ==========================================================================

echo "🔒 FreshVilla Security Quick Fix"
echo "================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ==========================================================================
# 1. GENERATE STRONG JWT SECRET
# ==========================================================================
echo -e "${YELLOW}Step 1: Generating strong JWT_SECRET...${NC}"
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
echo -e "${GREEN}✓ Generated 128-character random JWT secret${NC}"
echo ""
echo "JWT_SECRET=$JWT_SECRET"
echo ""
echo -e "${YELLOW}⚠️  Copy this to your .env file NOW!${NC}"
echo ""
read -p "Press Enter when you've updated .env with new JWT_SECRET..."

# ==========================================================================
# 2. GENERATE STRONG SESSION SECRET
# ==========================================================================
echo ""
echo -e "${YELLOW}Step 2: Generating strong SESSION_SECRET...${NC}"
SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
echo -e "${GREEN}✓ Generated 64-character session secret${NC}"
echo ""
echo "SESSION_SECRET=$SESSION_SECRET"
echo ""
echo -e "${YELLOW}⚠️  Add this to your .env file!${NC}"
echo ""
read -p "Press Enter to continue..."

# ==========================================================================
# 3. GENERATE STRONG ADMIN PASSWORD
# ==========================================================================
echo ""
echo -e "${YELLOW}Step 3: Generating strong admin password...${NC}"
ADMIN_PASSWORD=$(node -e "const chars='ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*'; let pass=''; for(let i=0; i<24; i++) pass+=chars[Math.floor(Math.random()*chars.length)]; console.log(pass);")
echo -e "${GREEN}✓ Generated 24-character strong password${NC}"
echo ""
echo "ADMIN_PASSWORD=$ADMIN_PASSWORD"
echo ""
echo -e "${RED}⚠️  CRITICAL: Save this password in a secure password manager!${NC}"
echo -e "${YELLOW}Update your .env file with this password${NC}"
echo ""
read -p "Press Enter when you've saved the password..."

# ==========================================================================
# 4. CHECK .gitignore
# ==========================================================================
echo ""
echo -e "${YELLOW}Step 4: Verifying .gitignore...${NC}"
if grep -q "^\.env$" .gitignore; then
    echo -e "${GREEN}✓ .env is in .gitignore (GOOD)${NC}"
else
    echo -e "${RED}✗ WARNING: .env is NOT in .gitignore!${NC}"
    echo "Adding .env to .gitignore..."
    echo ".env" >> .gitignore
    echo -e "${GREEN}✓ Added .env to .gitignore${NC}"
fi

# ==========================================================================
# 5. CHECK IF .env IS COMMITTED
# ==========================================================================
echo ""
echo -e "${YELLOW}Step 5: Checking git history for .env...${NC}"
if git log --all --full-history -- .env &>/dev/null; then
    echo -e "${RED}✗ CRITICAL: .env was committed to git history!${NC}"
    echo -e "${YELLOW}You need to remove it from git history:${NC}"
    echo "git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch .env' --prune-empty --tag-name-filter cat -- --all"
    echo "git push origin --force --all"
else
    echo -e "${GREEN}✓ .env not found in git history (GOOD)${NC}"
fi

# ==========================================================================
# 6. RUN NPM AUDIT
# ==========================================================================
echo ""
echo -e "${YELLOW}Step 6: Running npm audit...${NC}"
npm audit
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ No vulnerabilities found${NC}"
else
    echo -e "${YELLOW}⚠️  Vulnerabilities found. Run 'npm audit fix' to fix them${NC}"
fi

# ==========================================================================
# 7. SECURITY CONFIGURATION TEMPLATE
# ==========================================================================
echo ""
echo -e "${YELLOW}Step 7: Creating .env.template for team...${NC}"
cat > .env.template << 'EOF'
# ===========================================
# FRESHVILLA ENTERPRISE - ENVIRONMENT VARIABLES
# ===========================================
# IMPORTANT: Copy this to .env and fill in real values
# NEVER commit .env to git!

# Server Configuration
PORT=5000
NODE_ENV=development
API_VERSION=v1

# ===========================================
# DATABASE (PostgreSQL)
# ===========================================
# IMPORTANT: Use strong passwords!
DB_HOST=your-database-host
DB_PORT=5432
DB_NAME=freshvilla_enterprise
DB_USER=your-db-user
DB_PASSWORD=CHANGE_ME_TO_STRONG_PASSWORD

# ===========================================
# SECURITY SECRETS
# ===========================================
# IMPORTANT: Generate these with:
# node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

JWT_SECRET=GENERATE_NEW_SECRET_HERE
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

SESSION_SECRET=GENERATE_NEW_SECRET_HERE
COOKIE_SECRET=GENERATE_NEW_SECRET_HERE
SETTINGS_ENCRYPTION_KEY=GENERATE_NEW_SECRET_HERE

# ===========================================
# ADMIN CREDENTIALS
# ===========================================
# IMPORTANT: Use strong password (20+ characters)
ADMIN_EMAIL=admin@yourcompany.com
ADMIN_PASSWORD=CHANGE_ME_TO_STRONG_PASSWORD

# ===========================================
# CORS & SECURITY
# ===========================================
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
FRONTEND_URL=https://yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# ===========================================
# EMAIL (SMTP)
# ===========================================
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASSWORD=CHANGE_ME
SMTP_FROM=noreply@yourcompany.com
SMTP_FROM_NAME=Your Company

# ===========================================
# REDIS
# ===========================================
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# ===========================================
# LOGGING & MONITORING
# ===========================================
LOG_LEVEL=info
LOG_DIR=./logs

# Sentry (Optional - for error tracking)
SENTRY_DSN=
SENTRY_ENVIRONMENT=development
SENTRY_TRACES_SAMPLE_RATE=1.0

# ===========================================
# PAYMENT GATEWAYS (Optional)
# ===========================================
STRIPE_PUBLIC_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
EOF

echo -e "${GREEN}✓ Created .env.template${NC}"

# ==========================================================================
# 8. SUMMARY
# ==========================================================================
echo ""
echo "========================================"
echo -e "${GREEN}Security Quick Fix Complete!${NC}"
echo "========================================"
echo ""
echo "✅ Generated strong JWT_SECRET"
echo "✅ Generated strong SESSION_SECRET"
echo "✅ Generated strong ADMIN_PASSWORD"
echo "✅ Verified .gitignore"
echo "✅ Checked git history"
echo "✅ Ran npm audit"
echo "✅ Created .env.template"
echo ""
echo -e "${YELLOW}IMPORTANT NEXT STEPS:${NC}"
echo ""
echo "1. 🔴 Change your database password in Supabase"
echo "2. 🔴 Enable database firewall (whitelist IPs only)"
echo "3. 🔴 Update CORS_ORIGIN with your actual domain"
echo "4. 🟡 Set up SSL/TLS certificates"
echo "5. 🟡 Enable Supabase Row Level Security"
echo "6. 🟡 Implement stricter rate limiting"
echo "7. 🟢 Set up Sentry for error monitoring"
echo "8. 🟢 Implement 2FA for admin accounts"
echo ""
echo -e "${RED}⚠️  DO NOT deploy to production until these are done!${NC}"
echo ""
echo "See SECURITY_AUDIT_CRITICAL.md for complete checklist"
echo ""

# ==========================================================================
# DONE
# ==========================================================================
