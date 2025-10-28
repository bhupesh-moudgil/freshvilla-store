module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('distributor_kyc', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      distributorId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'distributors',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      documentType: {
        type: Sequelize.ENUM('aadhaar', 'pan', 'gst_certificate', 'bank_statement', 'address_proof', 'other'),
        allowNull: false,
      },
      documentNumber: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      filePath: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      fileUrl: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      verificationStatus: {
        type: Sequelize.ENUM('pending', 'verified', 'rejected'),
        defaultValue: 'pending',
      },
      verifiedBy: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'employees',
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      verifiedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      verificationNotes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      metadata: {
        type: Sequelize.JSONB,
        defaultValue: {},
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

    await queryInterface.addIndex('distributor_kyc', ['distributorId']);
    await queryInterface.addIndex('distributor_kyc', ['verificationStatus']);
    await queryInterface.addIndex('distributor_kyc', ['documentType']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('distributor_kyc');
  },
};
