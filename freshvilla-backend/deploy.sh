#!/bin/bash

###############################################################################
# FreshVilla Backend - GitHub & Render Deployment Script
# Usage: ./deploy.sh [message]
# Example: ./deploy.sh "Add order printing feature"
###############################################################################

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 FreshVilla Backend Deployment${NC}"
echo "=================================="
echo ""

# Get commit message from argument or use default
COMMIT_MSG="${1:-Update backend with new features}"

# Check if we're in the backend directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Run this script from the backend directory.${NC}"
    exit 1
fi

echo -e "${YELLOW}📦 Step 1: Checking package dependencies...${NC}"
if ! npm list pdfkit node-thermal-printer > /dev/null 2>&1; then
    echo -e "${YELLOW}Installing missing packages...${NC}"
    npm install
fi
echo -e "${GREEN}✓ Dependencies checked${NC}"
echo ""

echo -e "${YELLOW}📝 Step 2: Staging changes...${NC}"
git add .
echo -e "${GREEN}✓ Changes staged${NC}"
echo ""

echo -e "${YELLOW}📋 Step 3: Files to be committed:${NC}"
git status --short
echo ""

echo -e "${YELLOW}💾 Step 4: Committing changes...${NC}"
git commit -m "$COMMIT_MSG" || {
    echo -e "${YELLOW}⚠️  No changes to commit${NC}"
}
echo ""

echo -e "${YELLOW}🔍 Step 5: Checking remote...${NC}"
REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "")
if [ -z "$REMOTE_URL" ]; then
    echo -e "${RED}❌ Error: No git remote configured${NC}"
    echo "Configure remote with: git remote add origin <your-repo-url>"
    exit 1
fi
echo -e "${GREEN}✓ Remote: $REMOTE_URL${NC}"
echo ""

echo -e "${YELLOW}⬆️  Step 6: Pushing to GitHub...${NC}"
BRANCH=$(git branch --show-current)
git push origin "$BRANCH" || {
    echo -e "${RED}❌ Push failed. Check your GitHub credentials.${NC}"
    exit 1
}
echo -e "${GREEN}✓ Pushed to GitHub ($BRANCH)${NC}"
echo ""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Deployment Pushed Successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}📊 Next Steps:${NC}"
echo "1. Render will auto-deploy if connected to this branch"
echo "2. Check Render dashboard: https://dashboard.render.com"
echo "3. Monitor deploy logs for any errors"
echo "4. Test your endpoints after deployment"
echo ""
echo -e "${BLUE}🧪 Test Commands:${NC}"
echo "curl https://your-app.onrender.com/api/health"
echo "curl https://your-app.onrender.com/api/store-users/roles"
echo ""
echo -e "${GREEN}🎉 Done!${NC}"
