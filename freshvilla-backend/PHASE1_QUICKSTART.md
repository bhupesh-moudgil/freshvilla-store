# Phase 1: Distributor Marketplace - Quick Start Guide

## 🎯 Goal
Implement a complete multi-distributor marketplace system within 4-6 weeks, enabling third-party sellers to list products, manage orders, and receive payments.

---

## 📋 Week 1: Database Models & Core Structure

### Day 1-2: Create Distributor Core Models

#### 1. Create `src/models/distributor/Distributor.js`
```javascript
const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Distributor = sequelize.define('Distributor', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  distributorPrefixId: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    comment: 'Distributor ID e.g., VEN-001, VEN-002',
  },
  
  // Link to Customer (distributor is also a customer)
  customerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'customers',
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  
  // Company Information
  companyName: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  companyDescription: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  companyLogo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  companyLogoPath: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  companyCoverImage: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  companyCoverImagePath: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  
  // Contact Person
  contactPersonName: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  designation: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  
  // Company Address
  companyAddress1: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  companyAddress2: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  companyCity: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  companyCityCode: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  companyState: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  companyStateCode: {
    type: DataTypes.STRING(10),
    allowNull: false,
  },
  companyPincode: {
    type: DataTypes.STRING(10),
    allowNull: false,
  },
  companyCountry: {
    type: DataTypes.STRING(100),
    defaultValue: 'India',
  },
  
  // Contact Details
  companyPhone: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  companyEmail: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      isEmail: true,
    },
  },
  companyWebsite: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  
  // Legal/Tax Information
  companyGST: {
    type: DataTypes.STRING(15),
    allowNull: false,
    unique: true,
    validate: {
      is: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
    },
  },
  companyPAN: {
    type: DataTypes.STRING(10),
    allowNull: false,
    unique: true,
    validate: {
      is: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
    },
  },
  
  // Bank Account Details (JSONB)
  bankAccountDetails: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Account holder, number, IFSC, bank name, branch',
  },
  
  // Business Settings
  commission: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 15.00,
    comment: 'Platform commission percentage for this distributor',
  },
  
  // Verification Status
  verificationStatus: {
    type: DataTypes.ENUM('pending', 'in-review', 'verified', 'rejected'),
    defaultValue: 'pending',
    allowNull: false,
  },
  verificationComments: {
    type: DataTypes.JSONB,
    defaultValue: [],
    comment: 'Array of {date, comment, commentBy}',
  },
  
  // Approval
  approvalFlag: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  approvedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'Admin ID who approved',
  },
  approvedDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  
  // Status
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isDelete: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  
  // Distributor Storefront
  distributorSlug: {
    type: DataTypes.STRING(200),
    allowNull: false,
    unique: true,
    comment: 'URL-friendly slug for distributor store',
  },
  storefrontSettings: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Banner images, theme colors, store policies',
  },
  
  // Metadata
  lastLoginDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  
}, {
  tableName: 'distributors',
  timestamps: true,
  indexes: [
    { fields: ['distributorPrefixId'], unique: true },
    { fields: ['customerId'] },
    { fields: ['companyGST'], unique: true },
    { fields: ['companyPAN'], unique: true },
    { fields: ['verificationStatus'] },
    { fields: ['approvalFlag'] },
    { fields: ['isActive'] },
    { fields: ['distributorSlug'], unique: true },
  ],
});

// Instance method to generate distributor slug
Distributor.prototype.generateSlug = function() {
  return this.companyName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

module.exports = Distributor;
```

#### 2. Create `src/models/distributor/DistributorKYC.js`
```javascript
const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const DistributorKYC = sequelize.define('DistributorKYC', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  distributorId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'distributors',
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  documentType: {
    type: DataTypes.ENUM('gst_certificate', 'pan_card', 'bank_proof', 'address_proof', 'trade_license', 'other'),
    allowNull: false,
  },
  documentNumber: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  documentFile: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'File path/URL',
  },
  verificationStatus: {
    type: DataTypes.ENUM('pending', 'verified', 'rejected'),
    defaultValue: 'pending',
  },
  verifiedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'Admin ID who verified',
  },
  verifiedDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  rejectionReason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'distributor_kyc_documents',
  timestamps: true,
  indexes: [
    { fields: ['distributorId'] },
    { fields: ['verificationStatus'] },
  ],
});

module.exports = DistributorKYC;
```

#### 3. Create `src/models/distributor/DistributorProduct.js`
```javascript
const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const DistributorProduct = sequelize.define('DistributorProduct', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  distributorId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'distributors',
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  distributorSKU: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Distributor-specific SKU',
  },
  distributorPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Distributor selling price',
  },
  distributorMRP: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Maximum Retail Price',
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  lowStockThreshold: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  approvalStatus: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
  },
  approvedBy: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  approvedDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  rejectionReason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  commissionType: {
    type: DataTypes.ENUM('percentage', 'fixed'),
    defaultValue: 'percentage',
  },
  commissionValue: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Override commission for this specific product',
  },
}, {
  tableName: 'distributor_products',
  timestamps: true,
  indexes: [
    { fields: ['distributorId'] },
    { fields: ['productId'] },
    { fields: ['approvalStatus'] },
    { fields: ['isActive'] },
    { fields: ['distributorId', 'productId'], unique: true },
  ],
});

module.exports = DistributorProduct;
```

#### 4. Create remaining distributor models (DistributorOrder, DistributorPayment, DistributorSettings)
See full implementations in the roadmap document.

---

### Day 3-4: Create Distributor Controllers

#### 1. Create `src/controllers/distributor/distributorRegistrationController.js`
```javascript
const Distributor = require('../../models/distributor/Distributor');
const Customer = require('../../models/Customer');
const DistributorKYC = require('../../models/distributor/DistributorKYC');
const { sendEmail } = require('../../utils/emailService');

// @desc    Register new distributor
// @route   POST /api/distributor/register
// @access  Public (authenticated customer)
exports.registerDistributor = async (req, res) => {
  try {
    const { customerId } = req.user; // From JWT
    const {
      companyName,
      companyDescription,
      contactPersonName,
      designation,
      companyAddress1,
      companyAddress2,
      companyCity,
      companyState,
      companyPincode,
      companyPhone,
      companyEmail,
      companyGST,
      companyPAN,
      bankAccountDetails,
    } = req.body;
    
    // Check if customer is already a distributor
    const existingDistributor = await Distributor.findOne({ where: { customerId } });
    if (existingDistributor) {
      return res.status(400).json({
        success: false,
        message: 'You already have a distributor application',
      });
    }
    
    // Generate distributor prefix ID
    const distributorCount = await Distributor.count();
    const distributorPrefixId = `VEN-${String(distributorCount + 1).padStart(4, '0')}`;
    
    // Generate distributor slug
    const baseSlug = companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    let distributorSlug = baseSlug;
    let counter = 1;
    while (await Distributor.findOne({ where: { distributorSlug } })) {
      distributorSlug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    // Create distributor
    const distributor = await Distributor.create({
      customerId,
      distributorPrefixId,
      companyName,
      companyDescription,
      contactPersonName,
      designation,
      companyAddress1,
      companyAddress2,
      companyCity,
      companyState,
      companyPincode,
      companyPhone,
      companyEmail,
      companyGST,
      companyPAN,
      bankAccountDetails,
      distributorSlug,
      verificationStatus: 'pending',
      approvalFlag: false,
    });
    
    // Send notification email to admin
    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: 'New Distributor Registration',
      template: 'distributor-registration-admin',
      data: {
        distributorName: companyName,
        distributorId: distributorPrefixId,
        contactPerson: contactPersonName,
      },
    });
    
    // Send confirmation email to distributor
    await sendEmail({
      to: companyEmail,
      subject: 'Distributor Registration Received',
      template: 'distributor-registration-confirmation',
      data: {
        companyName,
        distributorId: distributorPrefixId,
      },
    });
    
    res.status(201).json({
      success: true,
      message: 'Distributor registration submitted successfully. Our team will review and get back to you.',
      data: {
        distributorId: distributor.id,
        distributorPrefixId: distributor.distributorPrefixId,
        verificationStatus: distributor.verificationStatus,
      },
    });
    
  } catch (error) {
    console.error('Distributor registration error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Upload KYC documents
// @route   POST /api/distributor/kyc-upload
// @access  Private (Distributor)
exports.uploadKYCDocument = async (req, res) => {
  try {
    const { distributorId } = req.distributor; // From distributor auth middleware
    const { documentType, documentNumber } = req.body;
    const documentFile = req.file ? req.file.path : null;
    
    if (!documentFile) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a document file',
      });
    }
    
    const kycDoc = await DistributorKYC.create({
      distributorId,
      documentType,
      documentNumber,
      documentFile,
      verificationStatus: 'pending',
    });
    
    res.status(201).json({
      success: true,
      message: 'KYC document uploaded successfully',
      data: kycDoc,
    });
    
  } catch (error) {
    console.error('KYC upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get distributor application status
// @route   GET /api/distributor/status
// @access  Private (Distributor)
exports.getDistributorStatus = async (req, res) => {
  try {
    const { distributorId } = req.distributor;
    
    const distributor = await Distributor.findByPk(distributorId, {
      include: [
        {
          model: DistributorKYC,
          as: 'kycDocuments',
        },
      ],
    });
    
    if (!distributor) {
      return res.status(404).json({
        success: false,
        message: 'Distributor not found',
      });
    }
    
    res.json({
      success: true,
      data: {
        distributorPrefixId: distributor.distributorPrefixId,
        companyName: distributor.companyName,
        verificationStatus: distributor.verificationStatus,
        approvalFlag: distributor.approvalFlag,
        isActive: distributor.isActive,
        kycStatus: distributor.kycDocuments.map(doc => ({
          documentType: doc.documentType,
          verificationStatus: doc.verificationStatus,
          rejectionReason: doc.rejectionReason,
        })),
        verificationComments: distributor.verificationComments,
      },
    });
    
  } catch (error) {
    console.error('Get distributor status error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = exports;
```

---

### Day 5-7: Create Admin Distributor Management

#### Create `src/controllers/admin/adminDistributorController.js`
```javascript
const Distributor = require('../../models/distributor/Distributor');
const DistributorKYC = require('../../models/distributor/DistributorKYC');
const { sendEmail } = require('../../utils/emailService');

// @desc    Get all distributor applications
// @route   GET /api/admin/distributors
// @access  Private (Admin)
exports.getAllDistributors = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    const where = {};
    if (status) where.verificationStatus = status;
    if (search) {
      where[Op.or] = [
        { companyName: { [Op.iLike]: `%${search}%` } },
        { distributorPrefixId: { [Op.iLike]: `%${search}%` } },
        { companyEmail: { [Op.iLike]: `%${search}%` } },
      ];
    }
    
    const distributors = await Distributor.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: DistributorKYC,
          as: 'kycDocuments',
        },
      ],
    });
    
    res.json({
      success: true,
      data: distributors.rows,
      pagination: {
        total: distributors.count,
        page: parseInt(page),
        pages: Math.ceil(distributors.count / limit),
      },
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Approve distributor
// @route   PUT /api/admin/distributors/:id/approve
// @access  Private (Admin)
exports.approveDistributor = async (req, res) => {
  try {
    const { id } = req.params;
    const { comments } = req.body;
    const { adminId } = req.user;
    
    const distributor = await Distributor.findByPk(id);
    if (!distributor) {
      return res.status(404).json({
        success: false,
        message: 'Distributor not found',
      });
    }
    
    // Update distributor
    distributor.verificationStatus = 'verified';
    distributor.approvalFlag = true;
    distributor.approvedBy = adminId;
    distributor.approvedDate = new Date();
    distributor.isActive = true;
    
    // Add approval comment
    const verificationComments = distributor.verificationComments || [];
    verificationComments.push({
      date: new Date(),
      comment: comments || 'Distributor approved',
      commentBy: adminId,
    });
    distributor.verificationComments = verificationComments;
    
    await distributor.save();
    
    // Send approval email
    await sendEmail({
      to: distributor.companyEmail,
      subject: 'Distributor Application Approved!',
      template: 'distributor-approval',
      data: {
        companyName: distributor.companyName,
        distributorId: distributor.distributorPrefixId,
        dashboardUrl: `${process.env.FRONTEND_URL}/distributor/dashboard`,
      },
    });
    
    res.json({
      success: true,
      message: 'Distributor approved successfully',
      data: distributor,
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Reject distributor
// @route   PUT /api/admin/distributors/:id/reject
// @access  Private (Admin)
exports.rejectDistributor = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const { adminId } = req.user;
    
    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required',
      });
    }
    
    const distributor = await Distributor.findByPk(id);
    if (!distributor) {
      return res.status(404).json({
        success: false,
        message: 'Distributor not found',
      });
    }
    
    // Update distributor
    distributor.verificationStatus = 'rejected';
    distributor.approvalFlag = false;
    distributor.isActive = false;
    
    // Add rejection comment
    const verificationComments = distributor.verificationComments || [];
    verificationComments.push({
      date: new Date(),
      comment: reason,
      commentBy: adminId,
    });
    distributor.verificationComments = verificationComments;
    
    await distributor.save();
    
    // Send rejection email
    await sendEmail({
      to: distributor.companyEmail,
      subject: 'Distributor Application Status',
      template: 'distributor-rejection',
      data: {
        companyName: distributor.companyName,
        reason,
      },
    });
    
    res.json({
      success: true,
      message: 'Distributor rejected',
      data: distributor,
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = exports;
```

---

## 📋 Week 2: Authentication & Routes

### Create Distributor Authentication Middleware
```javascript
// src/middleware/distributorAuth.js
const jwt = require('jsonwebtoken');
const Distributor = require('../models/distributor/Distributor');

exports.protect = async (req, res, next) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const distributor = await Distributor.findByPk(decoded.distributorId);
    
    if (!distributor) {
      return res.status(404).json({
        success: false,
        message: 'Distributor not found',
      });
    }
    
    if (!distributor.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your distributor account is not active',
      });
    }
    
    req.distributor = distributor;
    next();
    
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    });
  }
};
```

### Create Distributor Routes
```javascript
// src/routes/distributor.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth'); // Customer auth
const { protect: distributorProtect } = require('../middleware/distributorAuth');
const upload = require('../middleware/upload');

const {
  registerDistributor,
  uploadKYCDocument,
  getDistributorStatus,
} = require('../controllers/distributor/distributorRegistrationController');

// Registration (requires customer login)
router.post('/register', protect, registerDistributor);

// KYC upload (requires distributor login)
router.post('/kyc-upload', distributorProtect, upload.single('document'), uploadKYCDocument);

// Get status (requires distributor login)
router.get('/status', distributorProtect, getDistributorStatus);

module.exports = router;
```

```javascript
// src/routes/adminDistributor.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

const {
  getAllDistributors,
  approveDistributor,
  rejectDistributor,
} = require('../controllers/admin/adminDistributorController');

// Admin only routes
router.use(protect);
router.use(authorize('admin', 'super_admin'));

router.get('/', getAllDistributors);
router.put('/:id/approve', approveDistributor);
router.put('/:id/reject', rejectDistributor);

module.exports = router;
```

---

## 📋 Week 3-4: Distributor Portal Features

### Distributor Product Management
### Distributor Order Management
### Distributor Dashboard & Analytics

(See full implementation in roadmap)

---

## ✅ **QUICK CHECKLIST**

- [ ] Create distributor models (Distributor, DistributorKYC, DistributorProduct, DistributorOrder, DistributorPayment)
- [ ] Create distributor registration controller
- [ ] Create admin distributor approval controller
- [ ] Create distributor authentication middleware
- [ ] Set up distributor routes
- [ ] Set up admin distributor routes
- [ ] Create email templates (registration, approval, rejection)
- [ ] Add distributor associations to associations.js
- [ ] Run database migrations
- [ ] Test distributor registration flow
- [ ] Test admin approval flow
- [ ] Create distributor dashboard (frontend)
- [ ] Create admin distributor management UI (frontend)

---

## 🧪 **TESTING CHECKLIST**

### Registration Flow
- [ ] Customer can register as distributor
- [ ] Duplicate GST/PAN is rejected
- [ ] Email notifications are sent
- [ ] KYC documents can be uploaded

### Admin Approval Flow
- [ ] Admin can view pending distributors
- [ ] Admin can approve distributor
- [ ] Admin can reject with reason
- [ ] Distributor receives notification emails
- [ ] Approved distributor can login

### Distributor Portal
- [ ] Distributor can login
- [ ] Distributor can view dashboard
- [ ] Distributor can add products
- [ ] Distributor can manage inventory
- [ ] Distributor can view orders
- [ ] Distributor can view payments

---

## 📚 **RESOURCES**

- Full models: See `ENTERPRISE_EVALUATION_AND_ROADMAP.md`
- Spurtcommerce reference: `/tmp/spurtcommerce/src/api/distributor/*`
- Email templates: Create in `views/emails/`
- Database migrations: Create in `migrations/`

---

**Ready to start? Begin with Day 1-2 model creation!**
