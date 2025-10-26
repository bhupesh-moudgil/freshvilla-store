# FreshVilla Store - Complete E-commerce Platform

Complete e-commerce platform with backend API, customer web interface, and admin dashboard.

## 📁 Project Structure

```
freshvilla-store/
├── freshvilla-backend/          # Node.js + Express + PostgreSQL API
├── freshvilla-customer-web/     # React customer-facing website
└── Documentation files
```

## 🚀 Quick Start

### Backend Setup
```bash
cd freshvilla-backend
npm install
npm run seed        # Seed database with sample data
npm run dev         # Start development server
```

### Frontend Setup
```bash
cd freshvilla-customer-web
npm install
npm start           # Start development server
```

## 📚 Documentation

- `freshvilla-backend/README.md` - Backend API documentation
- `freshvilla-backend/WARP.md` - Development guidance for backend
- `DEPLOYMENT_GUIDE.md` - Production deployment instructions
- `SETUP_INSTRUCTIONS.md` - Detailed setup guide

## 🔐 Default Admin Credentials

After running `npm run seed` in backend:
- Email: `admin@freshvilla.com`
- Password: `Admin@123`

## 🛠️ Tech Stack

### Backend
- Node.js + Express
- PostgreSQL (Supabase/YugabyteDB)
- Sequelize ORM
- JWT Authentication
- bcrypt for password hashing

### Frontend
- React
- React Router
- Styled Components / CSS

## 📝 Environment Variables

Create `.env` files in respective directories:
- `freshvilla-backend/.env` - Database and JWT configuration
- `freshvilla-customer-web/.env` - API URL configuration

See `.env.example` files in each directory for required variables.
