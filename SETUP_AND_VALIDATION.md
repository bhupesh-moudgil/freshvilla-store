# 🚀 FreshVilla Setup & Validation Guide

## 📦 **Required NPM Packages**

### Backend Dependencies
```bash
cd freshvilla-backend

# Core packages (likely already installed)
npm install express sequelize pg pg-hstore bcryptjs jsonwebtoken dotenv cors helmet express-rate-limit

# New packages for advanced features
npm install pdfkit node-thermal-printer

# Dev dependencies
npm install --save-dev nodemon
```

### Frontend Dependencies
```bash
cd freshvilla-customer-web

# Chart.js for Store ERP dashboards
npm install react-chartjs-2 chart.js

# Printing support
npm install react-to-print

# Already should have: react react-dom react-router-dom bootstrap axios
```

---

## 🗄️ **Database Setup**

### 1. **Update Environment Variables**

Edit `freshvilla-backend/.env`:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/freshvilla_db
DB_HOST=localhost
DB_PORT=5432
DB_NAME=freshvilla_db
DB_USER=your_username
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production

# Server
PORT=5000
NODE_ENV=development

# SMTP (for email notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### 2. **Create Database Tables**

The Sequelize models will auto-create tables on first run with `{ sync: force: false }`.

To manually sync:

```javascript
// In src/config/database.js or create a migration script
const sequelize = require('./config/database');
const models = require('./models');

sequelize.sync({ alter: true }) // Use alter to update existing tables
  .then(() => console.log('Database synced'))
  .catch(err => console.error('Sync error:', err));
```

---

## ✅ **Validation Checklist**

### **Phase 1: Backend API Validation**

#### 1. **Test Store User Authentication**
```bash
# Start server
npm run dev

# Login as store user
curl -X POST http://localhost:5000/api/store-users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@store.com",
    "password": "password123"
  }'

# Should return JWT token with type: 'store_user'
```

#### 2. **Test Super Admin Store Management**
```bash
# Login as super-admin
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@freshvilla.in",
    "password": "admin_password"
  }'

# Get all stores
curl -X GET http://localhost:5000/api/admin/store-users/stores \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Create store owner
curl -X POST http://localhost:5000/api/admin/store-users/stores/STORE_ID/create-owner \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@newstore.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+919876543210",
    "password": "securepass123"
  }'
```

#### 3. **Test Store ERP Endpoints**
```bash
# Get dashboard (requires store user auth)
curl -X GET http://localhost:5000/api/store-erp/STORE_ID/dashboard \
  -H "Authorization: Bearer YOUR_STORE_USER_TOKEN"

# Get inventory
curl -X GET http://localhost:5000/api/store-erp/STORE_ID/inventory \
  -H "Authorization: Bearer YOUR_STORE_USER_TOKEN"

# Adjust inventory
curl -X POST http://localhost:5000/api/store-erp/STORE_ID/inventory/adjust \
  -H "Authorization: Bearer YOUR_STORE_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "PRODUCT_UUID",
    "quantity": 10,
    "movementType": "purchase",
    "notes": "Restocked from supplier"
  }'
```

#### 4. **Test Order Printing**
```bash
# Get print data
curl -X GET http://localhost:5000/api/orders/ORDER_ID/print/data \
  -H "Authorization: Bearer YOUR_STORE_USER_TOKEN"

# Generate PDF invoice (downloads PDF)
curl -X GET http://localhost:5000/api/orders/ORDER_ID/print/invoice \
  -H "Authorization: Bearer YOUR_STORE_USER_TOKEN" \
  --output invoice.pdf

# Generate shipping label
curl -X GET http://localhost:5000/api/orders/ORDER_ID/print/label \
  -H "Authorization: Bearer YOUR_STORE_USER_TOKEN" \
  --output label.pdf
```

---

### **Phase 2: Database Validation**

#### Check Models are Created:
```sql
-- Connect to PostgreSQL
psql -U username -d freshvilla_db

-- List all tables
\dt

-- Should see:
-- admins
-- customers
-- orders
-- products
-- coupons
-- stores
-- store_users
-- store_transactions
-- inventory_ledger
-- store_revenue_summaries
-- product_commissions
-- store_integrations
-- product_sync_mappings
-- banners

-- Check store_users table structure
\d store_users

-- Check relationships
SELECT * FROM store_users WHERE role = 'owner';
```

---

### **Phase 3: Integration Testing**

#### Test Complete Flow:

1. **Super Admin creates store owner**
   ```bash
   POST /api/admin/store-users/stores/:storeId/create-owner
   ```

2. **Store owner logs in**
   ```bash
   POST /api/store-users/login
   ```

3. **Store owner invites admin user**
   ```bash
   POST /api/store-users/:storeId/users/invite
   ```

4. **Admin user logs in**
   ```bash
   POST /api/store-users/login
   ```

5. **Admin creates product**
   ```bash
   POST /api/products (with store context)
   ```

6. **Admin adjusts inventory**
   ```bash
   POST /api/store-erp/:storeId/inventory/adjust
   ```

7. **Customer places order**
   ```bash
   POST /api/orders
   ```

8. **Agent prints order**
   ```bash
   GET /api/orders/:orderId/print/thermal
   ```

---

## 🔧 **Configuration**

### Thermal Printer Configuration

Edit `orderPrintController.js` line 19:

```javascript
interface: 'tcp://192.168.1.100', // Update with your printer's IP
```

Or use USB:
```javascript
interface: '/dev/usb/lp0', // Linux
// interface: 'COM3', // Windows
```

### PDF Settings

To customize PDF templates, edit:
- `orderPrintController.js` - `generateInvoicePDF()` function
- `orderPrintController.js` - `generateShippingLabel()` function

---

## 🧪 **Testing Permissions**

```javascript
// Test permission system
const user = await StoreUser.findByPk(userId);

console.log('Role:', user.role);
console.log('Permissions:', user.getPermissions());
console.log('Can view products?', user.can('products', 'view'));
console.log('Can print orders?', user.can('orders', 'print'));
console.log('Can manage users?', user.can('users', 'create'));
```

Expected output:
- **Owner**: All permissions true
- **Admin**: Products/inventory/coupons true, users view only
- **Agent**: Orders print/edit true, financials false

---

## 📊 **Performance Optimization**

### Database Indexes (Already in models):
```javascript
// StoreUser indexes
{ fields: ['storeId'] },
{ fields: ['email'] },
{ fields: ['role'] },
{ fields: ['status'] }

// Order indexes
{ fields: ['orderNumber'], unique: true },
{ fields: ['customerEmail'] },
{ fields: ['orderStatus'] }
```

### Caching Strategy (Future):
```javascript
// Redis for session management
// Cache frequently accessed data (products, store info)
// Implement rate limiting on login endpoints
```

---

## 🚨 **Common Issues & Solutions**

### Issue 1: "Invalid token type"
**Solution:** Ensure store users use `/api/store-users/login`, not `/api/auth/login`

### Issue 2: "You do not have permission..."
**Solution:** Check user role and permissions using `user.getPermissions()`

### Issue 3: Printer not connecting
**Solution:** 
- Verify printer IP/port
- Check firewall settings
- Test with: `ping PRINTER_IP`

### Issue 4: PDF generation fails
**Solution:** 
- Install pdfkit: `npm install pdfkit`
- Check order data is complete

### Issue 5: Database sync errors
**Solution:**
```bash
# Drop and recreate tables (CAUTION: destroys data)
sequelize.sync({ force: true })

# Or use migrations for production
npx sequelize-cli init
npx sequelize-cli migration:generate --name init-models
```

---

## 📝 **API Endpoints Summary**

### Super Admin (requires super-admin auth):
- `GET /api/admin/store-users/stores` - List all stores
- `GET /api/admin/store-users/stores/:storeId/users` - Get store users
- `POST /api/admin/store-users/stores/:storeId/create-owner` - Create store owner
- `POST /api/admin/store-users/stores/:storeId/invite-user` - Invite user to store
- `PUT /api/admin/store-users/stores/:storeId/users/:userId` - Update user
- `DELETE /api/admin/store-users/stores/:storeId/users/:userId` - Delete user
- `POST /api/admin/store-users/stores/:storeId/transfer-ownership/:userId` - Transfer ownership
- `GET /api/admin/store-users/stats` - Get stats

### Store Users (requires store user auth):
- `POST /api/store-users/login` - Login
- `GET /api/store-users/:storeId/users` - List users (owners/admins only)
- `POST /api/store-users/:storeId/users/invite` - Invite user (owners/admins only)
- `POST /api/store-users/:storeId/users/:userId/change-password` - Change password

### Store ERP (requires store user auth + permissions):
- `GET /api/store-erp/:storeId/dashboard` - Dashboard data
- `GET /api/store-erp/:storeId/transactions` - Financial transactions
- `GET /api/store-erp/:storeId/revenue-summary` - Revenue summary
- `GET /api/store-erp/:storeId/profit-loss` - P&L statement
- `GET /api/store-erp/:storeId/sales-analytics` - Sales analytics
- `GET /api/store-erp/:storeId/inventory` - Inventory list
- `GET /api/store-erp/:storeId/inventory/ledger` - Inventory history
- `POST /api/store-erp/:storeId/inventory/adjust` - Adjust inventory
- `GET /api/store-erp/:storeId/commissions` - Product commissions
- `PUT /api/store-erp/:storeId/commissions/:productId` - Update commission

### Order Printing (requires store user auth + print permission):
- `GET /api/orders/:orderId/print/data` - Get print data
- `GET /api/orders/:orderId/print/thermal` - Thermal receipt
- `GET /api/orders/:orderId/print/invoice` - PDF invoice
- `GET /api/orders/:orderId/print/label` - Shipping label

---

## ✅ **Production Deployment Checklist**

- [ ] Update `.env` with production values
- [ ] Change `JWT_SECRET` to strong random string
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS
- [ ] Set up database backups
- [ ] Configure email SMTP
- [ ] Set up error logging (Sentry)
- [ ] Enable rate limiting
- [ ] Add API documentation (Swagger)
- [ ] Set up monitoring (PM2, DataDog)
- [ ] Configure CDN for images
- [ ] Set up Redis for sessions
- [ ] Enable database connection pooling
- [ ] Add CORS whitelist
- [ ] Set up firewall rules
- [ ] Configure printer IPs

---

**Built by:** FreshVilla Development Team  
**Version:** 2.0  
**Last Updated:** January 2025
