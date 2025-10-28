module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('conversations', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      conversationId: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      customerId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'customers',
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      channelType: {
        type: Sequelize.ENUM('chat', 'email', 'whatsapp', 'phone'),
        allowNull: false,
        defaultValue: 'chat',
      },
      inboxId: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      assignedAgentId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'employees',
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      assignedTeamId: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('open', 'pending', 'resolved', 'closed'),
        defaultValue: 'open',
        allowNull: false,
      },
      priority: {
        type: Sequelize.ENUM('low', 'medium', 'high', 'urgent'),
        defaultValue: 'medium',
      },
      tags: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: [],
      },
      category: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      customAttributes: {
        type: Sequelize.JSONB,
        defaultValue: {},
      },
      firstResponseTime: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      resolutionTime: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      slaBreached: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      lastActivityAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      lastMessageAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      externalId: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      contactName: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      contactEmail: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      contactPhone: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      messageCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      unreadCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
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

    await queryInterface.addIndex('conversations', ['conversationId'], { unique: true });
    await queryInterface.addIndex('conversations', ['customerId']);
    await queryInterface.addIndex('conversations', ['assignedAgentId']);
    await queryInterface.addIndex('conversations', ['status']);
    await queryInterface.addIndex('conversations', ['priority']);
    await queryInterface.addIndex('conversations', ['channelType']);
    await queryInterface.addIndex('conversations', ['lastActivityAt']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('conversations');
  },
};
