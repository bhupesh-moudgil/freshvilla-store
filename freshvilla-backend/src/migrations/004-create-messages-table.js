module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('messages', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      conversationId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'conversations',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      contentType: {
        type: Sequelize.ENUM('text', 'html', 'markdown'),
        defaultValue: 'text',
      },
      senderType: {
        type: Sequelize.ENUM('customer', 'agent', 'bot', 'system'),
        allowNull: false,
      },
      senderId: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      senderName: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      messageType: {
        type: Sequelize.ENUM('incoming', 'outgoing', 'activity', 'private_note'),
        allowNull: false,
        defaultValue: 'outgoing',
      },
      attachments: {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      status: {
        type: Sequelize.ENUM('sent', 'delivered', 'read', 'failed'),
        defaultValue: 'sent',
      },
      externalId: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      sourceId: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      metadata: {
        type: Sequelize.JSONB,
        defaultValue: {},
      },
      reactions: {
        type: Sequelize.JSONB,
        defaultValue: {},
      },
      sentimentScore: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      readAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      deliveredAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      isAutomated: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
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

    await queryInterface.addIndex('messages', ['conversationId']);
    await queryInterface.addIndex('messages', ['senderType', 'senderId']);
    await queryInterface.addIndex('messages', ['messageType']);
    await queryInterface.addIndex('messages', ['status']);
    await queryInterface.addIndex('messages', ['createdAt']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('messages');
  },
};
