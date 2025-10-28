module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('distributors', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      distributorPrefixId: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      customerId: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      
      // Company Information
      companyName: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      companyDescription: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      companyLogo: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      companyLogoPath: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      companyCoverImage: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      companyCoverImagePath: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      
      // Contact Person
      contactPersonName: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      designation: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      
      // Company Address
      companyAddress1: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      companyAddress2: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      companyCity: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      companyCityCode: {
        type: Sequelize.STRING(10),
        allowNull: true,
      },
      companyState: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      companyStateCode: {
        type: Sequelize.STRING(10),
        allowNull: false,
      },
      companyPincode: {
        type: Sequelize.STRING(10),
        allowNull: false,
      },
      companyCountry: {
        type: Sequelize.STRING(100),
        defaultValue: 'India',
      },
      
      // Contact Details
      companyPhone: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      companyEmail: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      companyWebsite: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      
      // Legal/Tax Information
      companyGST: {
        type: Sequelize.STRING(15),
        allowNull: false,
        unique: true,
      },
      companyPAN: {
        type: Sequelize.STRING(10),
        allowNull: false,
        unique: true,
      },
      
      // Bank Account Details
      bankAccountDetails: {
        type: Sequelize.JSONB,
        defaultValue: {},
      },
      
      // Business Settings
      commission: {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 15.00,
      },
      
      // Verification Status
      verificationStatus: {
        type: Sequelize.ENUM('pending', 'in-review', 'verified', 'rejected'),
        defaultValue: 'pending',
        allowNull: false,
      },
      verificationComments: {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      
      // Approval
      approvalFlag: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      approvedBy: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      approvedDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      
      // Status
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      isDelete: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      
      // Storefront
      distributorSlug: {
        type: Sequelize.STRING(200),
        allowNull: false,
        unique: true,
      },
      storefrontSettings: {
        type: Sequelize.JSONB,
        defaultValue: {},
      },
      
      // Store KYC
      storeKYC: {
        type: Sequelize.JSONB,
        defaultValue: {},
      },
      storeVerificationStatus: {
        type: Sequelize.ENUM('pending', 'verified', 'rejected'),
        defaultValue: 'pending',
      },
      storeVerifiedBy: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      storeVerifiedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      storeVerificationNotes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      
      // Metadata
      lastLoginDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // Add indexes
    await queryInterface.addIndex('distributors', ['distributorPrefixId'], { unique: true });
    await queryInterface.addIndex('distributors', ['customerId']);
    await queryInterface.addIndex('distributors', ['companyGST'], { unique: true });
    await queryInterface.addIndex('distributors', ['companyPAN'], { unique: true });
    await queryInterface.addIndex('distributors', ['verificationStatus']);
    await queryInterface.addIndex('distributors', ['approvalFlag']);
    await queryInterface.addIndex('distributors', ['isActive']);
    await queryInterface.addIndex('distributors', ['distributorSlug'], { unique: true });
    await queryInterface.addIndex('distributors', ['storeVerificationStatus']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('distributors');
  },
};
