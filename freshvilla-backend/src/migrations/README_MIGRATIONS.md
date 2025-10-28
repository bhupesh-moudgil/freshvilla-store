# Database Migrations Guide

## Migration Files Created

1. `001-create-distributors-table.js` - Distributors table with store KYC ✅
2. `002-create-distributor-kyc-table.js` - Distributor KYC documents ✅
3. `003-create-conversations-table.js` - Support conversations ✅

## Remaining Tables to Migrate

Run the following command to generate migrations for remaining tables:

```bash
npx sequelize-cli migration:generate --name create-messages-table
npx sequelize-cli migration:generate --name create-inboxes-table
npx sequelize-cli migration:generate --name create-canned-responses-table
npx sequelize-cli migration:generate --name create-reviews-table
npx sequelize-cli migration:generate --name create-review-helpfulness-table
npx sequelize-cli migration:generate --name create-wishlists-table
npx sequelize-cli migration:generate --name create-customer-addresses-table
npx sequelize-cli migration:generate --name create-carts-table
npx sequelize-cli migration:generate --name create-cart-items-table
npx sequelize-cli migration:generate --name create-coupons-table
npx sequelize-cli migration:generate --name create-coupon-usage-table
npx sequelize-cli migration:generate --name create-payment-methods-table
npx sequelize-cli migration:generate --name create-transactions-table
npx sequelize-cli migration:generate --name create-notifications-table
```

## Run Migrations

```bash
# Run all pending migrations
npx sequelize-cli db:migrate

# Undo last migration
npx sequelize-cli db:migrate:undo

# Undo all migrations
npx sequelize-cli db:migrate:undo:all

# Run specific migration
npx sequelize-cli db:migrate --to 003-create-conversations-table.js
```

## Migration Structure

Each migration file should follow this pattern:

```javascript
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create table
    await queryInterface.createTable('table_name', {
      // columns
    });
    
    // Add indexes
    await queryInterface.addIndex('table_name', ['column_name']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('table_name');
  },
};
```

## Sequelize CLI Configuration

Create `.sequelizerc` in project root:

```javascript
const path = require('path');

module.exports = {
  'config': path.resolve('src', 'config', 'database.js'),
  'models-path': path.resolve('src', 'models'),
  'seeders-path': path.resolve('src', 'seeders'),
  'migrations-path': path.resolve('src', 'migrations')
};
```

## Database Seeding

After migrations, create seeders for initial data:

```bash
npx sequelize-cli seed:generate --name demo-distributors
npx sequelize-cli seed:generate --name demo-products
npx sequelize-cli seed:generate --name demo-customers
```

## Notes

- Always backup database before running migrations in production
- Test migrations in development/staging first
- Use transactions for complex migrations
- Keep migrations atomic and reversible
- Document any manual steps required

## Tables Overview

| Table | Purpose | Foreign Keys |
|-------|---------|--------------|
| distributors | Distributor profiles | customerId |
| distributor_kyc | KYC documents | distributorId, verifiedBy |
| conversations | Support conversations | customerId, assignedAgentId |
| messages | Chat messages | conversationId |
| inboxes | Support channels | - |
| canned_responses | Quick replies | createdBy |
| reviews | Product reviews | productId, customerId, orderId |
| review_helpfulness | Review votes | reviewId, customerId |
| wishlists | Saved products | customerId, productId |
| customer_addresses | Delivery addresses | customerId |
| carts | Shopping carts | customerId |
| cart_items | Cart products | cartId, productId, distributorId |
| coupons | Promotional codes | createdBy |
| coupon_usage | Usage tracking | couponId, customerId, orderId |
| payment_methods | Saved payments | customerId |
| transactions | Payment tracking | orderId, customerId |
| notifications | System notifications | - |
