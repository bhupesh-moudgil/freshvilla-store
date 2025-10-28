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
    { fields: ['documentType'] },
  ],
});

module.exports = DistributorKYC;
