/**
 * Run this script to generate all remaining migration files
 * Usage: node scripts/generate-migrations.js
 */

const fs = require('fs');
const path = require('path');

const migrationsDir = path.join(__dirname, '../src/migrations');

// Ensure migrations directory exists
if (!fs.existsSync(migrationsDir)) {
  fs.mkdirSync(migrationsDir, { recursive: true });
}

const migrations = [
  {
    number: '005',
    name: 'create-inboxes-table',
    table: 'inboxes',
    fields: `
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      name: { type: Sequelize.STRING(200), allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: true },
      channelType: { type: Sequelize.ENUM('chat', 'email', 'whatsapp', 'phone', 'api'), allowNull: false },
      channelConfig: { type: Sequelize.JSONB, defaultValue: {} },
      webhookUrl: { type: Sequelize.STRING(500), allowNull: true },
      autoAssignment: { type: Sequelize.BOOLEAN, defaultValue: true },
      assignmentStrategy: { type: Sequelize.ENUM('round_robin', 'load_balanced', 'priority', 'manual'), defaultValue: 'round_robin' },
      teamIds: { type: Sequelize.ARRAY(Sequelize.UUID), defaultValue: [] },
      businessHours: { type: Sequelize.JSONB, defaultValue: {} },
      autoReplyEnabled: { type: Sequelize.BOOLEAN, defaultValue: false },
      autoReplyMessage: { type: Sequelize.TEXT, allowNull: true },
      outOfOfficeMessage: { type: Sequelize.TEXT, allowNull: true },
      slaConfig: { type: Sequelize.JSONB, defaultValue: {} },
      widgetConfig: { type: Sequelize.JSONB, defaultValue: {} },
      csatEnabled: { type: Sequelize.BOOLEAN, defaultValue: true },
      isActive: { type: Sequelize.BOOLEAN, defaultValue: true },
      totalConversations: { type: Sequelize.INTEGER, defaultValue: 0 },
      averageResponseTime: { type: Sequelize.FLOAT, allowNull: true },
    `,
    indexes: ['channelType', 'isActive'],
  },
  {
    number: '006',
    name: 'create-canned-responses-table',
    table: 'canned_responses',
    fields: `
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      shortCode: { type: Sequelize.STRING(50), allowNull: false, unique: true },
      title: { type: Sequelize.STRING(200), allowNull: false },
      content: { type: Sequelize.TEXT, allowNull: false },
      category: { type: Sequelize.STRING(100), allowNull: true },
      tags: { type: Sequelize.ARRAY(Sequelize.STRING), defaultValue: [] },
      scope: { type: Sequelize.ENUM('global', 'team', 'personal'), defaultValue: 'personal' },
      teamId: { type: Sequelize.UUID, allowNull: true },
      createdBy: { type: Sequelize.UUID, allowNull: false, references: { model: 'employees', key: 'id' }, onDelete: 'CASCADE' },
      usageCount: { type: Sequelize.INTEGER, defaultValue: 0 },
      lastUsedAt: { type: Sequelize.DATE, allowNull: true },
      isActive: { type: Sequelize.BOOLEAN, defaultValue: true },
      metadata: { type: Sequelize.JSONB, defaultValue: {} },
    `,
    indexes: ['shortCode:unique', 'scope', 'createdBy', 'isActive'],
  },
  {
    number: '007',
    name: 'create-reviews-table',
    table: 'reviews',
    fields: `
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      productId: { type: Sequelize.UUID, allowNull: false, references: { model: 'products', key: 'id' }, onDelete: 'CASCADE' },
      customerId: { type: Sequelize.UUID, allowNull: false, references: { model: 'customers', key: 'id' }, onDelete: 'CASCADE' },
      orderId: { type: Sequelize.UUID, allowNull: true, references: { model: 'orders', key: 'id' }, onDelete: 'SET NULL' },
      rating: { type: Sequelize.INTEGER, allowNull: false },
      title: { type: Sequelize.STRING(200), allowNull: true },
      comment: { type: Sequelize.TEXT, allowNull: true },
      isVerifiedPurchase: { type: Sequelize.BOOLEAN, defaultValue: false },
      status: { type: Sequelize.ENUM('pending', 'approved', 'rejected', 'flagged'), defaultValue: 'pending' },
      moderatedBy: { type: Sequelize.UUID, allowNull: true, references: { model: 'employees', key: 'id' }, onDelete: 'SET NULL' },
      moderatedAt: { type: Sequelize.DATE, allowNull: true },
      moderationNote: { type: Sequelize.TEXT, allowNull: true },
      images: { type: Sequelize.ARRAY(Sequelize.STRING), defaultValue: [] },
      videos: { type: Sequelize.ARRAY(Sequelize.STRING), defaultValue: [] },
      helpfulCount: { type: Sequelize.INTEGER, defaultValue: 0 },
      notHelpfulCount: { type: Sequelize.INTEGER, defaultValue: 0 },
      vendorResponse: { type: Sequelize.TEXT, allowNull: true },
      vendorRespondedAt: { type: Sequelize.DATE, allowNull: true },
      vendorRespondedBy: { type: Sequelize.UUID, allowNull: true, references: { model: 'vendors', key: 'id' }, onDelete: 'SET NULL' },
      metadata: { type: Sequelize.JSONB, defaultValue: {} },
      isVisible: { type: Sequelize.BOOLEAN, defaultValue: true },
      sentimentScore: { type: Sequelize.FLOAT, allowNull: true },
    `,
    indexes: ['productId', 'customerId', 'orderId', 'rating', 'status', 'isVerifiedPurchase', 'isVisible'],
  },
];

// Generate migration files
migrations.forEach(({ number, name, table, fields, indexes }) => {
  const filename = `${number}-${name}.js`;
  const filepath = path.join(migrationsDir, filename);

  const indexesCode = indexes.map(idx => {
    if (idx.includes(':unique')) {
      const field = idx.replace(':unique', '');
      return `    await queryInterface.addIndex('${table}', ['${field}'], { unique: true });`;
    }
    return `    await queryInterface.addIndex('${table}', ['${idx}']);`;
  }).join('\n');

  const content = `module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('${table}', {
${fields}
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

${indexesCode}
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('${table}');
  },
};
`;

  fs.writeFileSync(filepath, content);
  console.log(`✅ Created: ${filename}`);
});

console.log('\n✅ All migration files generated successfully!');
console.log('\nRun: npm run migrate');
