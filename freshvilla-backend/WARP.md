# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Commands

### Development
```bash
npm run dev          # Start server with nodemon (auto-restart)
npm start            # Start server in production mode
npm run seed         # Seed database with sample products and admin user
```

### Database Setup
The backend connects to PostgreSQL (Supabase or YugabyteDB) via Sequelize ORM. Database tables are auto-created on first run via `sequelize.sync()`.

## Architecture

### Database Configuration (Multi-Environment)
The system uses **environment-based database switching** via `DEPLOY_ENV`:
- `prod-github`: Supabase PostgreSQL (for testing/GitHub deployments)
- `prod-gcp`: YugabyteDB (for Google Cloud VM production)

Configuration is in `src/config/database.js` which selects the appropriate database based on `process.env.DEPLOY_ENV`.

### Models (Sequelize ORM)
All models use **UUID primary keys** and are defined with Sequelize in `src/models/`:
- **Product**: Uses ENUM for categories, ARRAY for multiple images, JSONB-compatible fields
- **Admin**: Password hashing via bcrypt in beforeCreate/beforeUpdate hooks, scopes to exclude password by default
- **Order**: Auto-generates orderNumber in beforeValidate hook, uses JSONB for items array
- **Coupon**: Auto-uppercases code in setter, instance methods `isValid()` and `calculateDiscount()`

### Authentication Flow
JWT-based admin authentication:
1. Admin logs in via `/api/auth/login` 
2. `generateToken()` creates JWT with admin ID
3. `protect` middleware verifies token and attaches `req.admin` to requests
4. Password comparison uses bcrypt via `Admin.comparePassword()` instance method

### API Routes Pattern
Routes in `src/routes/` follow this pattern:
- Public routes (GET products, validate coupon, create order) - no auth
- Protected routes (POST/PUT/DELETE) - use `protect` middleware
- All responses follow `{ success, data/message }` format
- Route files use Mongoose-style queries that need conversion for Sequelize (e.g., `Product.find()` should be `Product.findAll()`)

**Note**: The routes files still contain MongoDB/Mongoose syntax (`.find()`, `.findById()`) but the models are Sequelize. When modifying routes, convert to Sequelize methods (`.findAll()`, `.findByPk()`, etc.).

### Error Handling
Centralized error handler in `src/middleware/errorHandler.js` catches all route errors and formats responses consistently.

### Environment Variables
Required variables in `.env`:
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` - Database credentials
- `DEPLOY_ENV` - Environment selector (`prod-github` or `prod-gcp`)
- `JWT_SECRET`, `JWT_EXPIRE` - Auth configuration
- `ADMIN_EMAIL`, `ADMIN_PASSWORD` - Default admin credentials for seeding
- `FRONTEND_URL` - CORS origin
- `PORT`, `NODE_ENV` - Server configuration

### Default Admin Credentials
After running `npm run seed`:
- Email: `admin@freshvilla.com`
- Password: `Admin@123`
