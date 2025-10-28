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
  
  // Store KYC (Shop/Establishment License)
  storeKYC: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Store/shop establishment license, trade license, FSSAI, etc.',
  },
  storeVerificationStatus: {
    type: DataTypes.ENUM('pending', 'verified', 'rejected'),
    defaultValue: 'pending',
  },
  storeVerifiedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'Admin ID who verified store KYC',
  },
  storeVerifiedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  storeVerificationNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
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

// Instance method to check if distributor is approved and active
Distributor.prototype.canSell = function() {
  return this.approvalFlag && this.isActive && !this.isDelete;
};

module.exports = Distributor;
