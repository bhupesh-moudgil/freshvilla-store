# 🚀 Push Code to GitHub

## Backend Repository

Your backend is ready to push. You need to create the repo on GitHub first:

### 1. Create Backend Repo on GitHub

1. Go to: https://github.com/new
2. Repository name: `freshvilla-backend`
3. Description: "FreshVilla Backend API with Supabase"
4. **Keep it Private** (has database credentials)
5. **DO NOT** initialize with README
6. Click **"Create repository"**

### 2. Push Backend Code

```bash
cd /Users/maropost/Documents/freshvilla/Project-files/freshvilla-backend

# If you have SSH set up (recommended):
git remote set-url origin git@github.com:bhupesh-moudgil/freshvilla-backend.git
git push -u origin main

# OR if using HTTPS (will ask for username/password):
git push -u origin main
```

**Important:** GitHub now requires Personal Access Token instead of password.

### Get Personal Access Token:
1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token (classic)"**
3. Select scopes: `repo` (all)
4. Generate and **copy the token**
5. Use this token as your password when pushing

---

## Update Frontend Code

The frontend has new admin components. Let's push them:

```bash
cd /Users/maropost/Documents/freshvilla/Project-files/freshvilla-customer-web

# Check status
git status

# Add new files
git add .

# Commit
git commit -m "Add admin dashboard components: ProductsList, ProductCreate, DashboardHome"

# Push
git push origin main
```

---

## Quick Alternative: Use GitHub CLI

If you have `gh` CLI installed:

```bash
# Login
gh auth login

# Push backend
cd /Users/maropost/Documents/freshvilla/Project-files/freshvilla-backend
gh repo create freshvilla-backend --private --source=. --remote=origin --push

# Push frontend updates
cd /Users/maropost/Documents/freshvilla/Project-files/freshvilla-customer-web
git add .
git commit -m "Add admin components"
git push
```

---

## After Code is on GitHub

### Deploy Backend on Render.com:

1. Go to https://dashboard.render.com
2. New Web Service
3. Connect repository: `freshvilla-backend`
4. Add environment variables (see LIVE_STATUS.md)
5. Deploy!

You'll get: `https://freshvilla-backend.onrender.com`

### Update Frontend:

```bash
cd /Users/maropost/Documents/freshvilla/Project-files/freshvilla-customer-web

# Create production config
echo "REACT_APP_API_URL=https://freshvilla-backend.onrender.com/api" > .env.production

# Rebuild and deploy
npm run build
npm run deploy
```

---

## 🔒 IMPORTANT: Secure Your .env

The `.gitignore` already excludes `.env` files, but double-check:

```bash
# Backend - should NOT be in git:
cat /Users/maropost/Documents/freshvilla/Project-files/freshvilla-backend/.gitignore | grep .env
```

Should show:
```
.env
.env.local
.env.production
```

✅ This means your database password won't be pushed to GitHub!

---

## Need Help Authenticating?

**Option 1: SSH Key (Recommended)**
```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your-email@example.com"

# Add to ssh-agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# Copy public key
cat ~/.ssh/id_ed25519.pub

# Add to GitHub: https://github.com/settings/keys
```

**Option 2: Personal Access Token**
- Go to: https://github.com/settings/tokens
- Generate token with `repo` access
- Use as password when pushing

---

**Once code is on GitHub, let me know and I'll help you deploy to Render.com!**
