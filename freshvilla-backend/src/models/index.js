const { sequelize } = require('../config/database');

// Distributor Models
const Distributor = require('./distributor/Distributor');
const DistributorKYC = require('./distributor/DistributorKYC');

// Support Models
const Conversation = require('./support/Conversation');
const Message = require('./support/Message');
const Inbox = require('./support/Inbox');
const CannedResponse = require('./support/CannedResponse');

// Review Models
const Review = require('./review/Review');
const ReviewHelpfulness = require('./review/ReviewHelpfulness');

// Customer Models
const Wishlist = require('./customer/Wishlist');
const CustomerAddress = require('./customer/CustomerAddress');

// Cart Models
const Cart = require('./cart/Cart');
const CartItem = require('./cart/CartItem');

// Promotion Models
const Coupon = require('./promotion/Coupon');
const CouponUsage = require('./promotion/CouponUsage');

// Payment Models
const PaymentMethod = require('./payment/PaymentMethod');
const Transaction = require('./payment/Transaction');

// Notification Models
const Notification = require('./notification/Notification');

// Define Associations
const defineAssociations = () => {
  // Distributor Associations
  Distributor.hasMany(DistributorKYC, { foreignKey: 'distributorId', as: 'kycDocuments' });
  DistributorKYC.belongsTo(Distributor, { foreignKey: 'distributorId', as: 'distributor' });

  // Support Associations
  Conversation.hasMany(Message, { foreignKey: 'conversationId', as: 'messages' });
  Message.belongsTo(Conversation, { foreignKey: 'conversationId', as: 'conversation' });

  // Review Associations
  Review.hasMany(ReviewHelpfulness, { foreignKey: 'reviewId', as: 'helpfulness' });
  ReviewHelpfulness.belongsTo(Review, { foreignKey: 'reviewId', as: 'review' });

  // Cart Associations
  Cart.hasMany(CartItem, { foreignKey: 'cartId', as: 'items' });
  CartItem.belongsTo(Cart, { foreignKey: 'cartId', as: 'cart' });

  // Coupon Associations
  Coupon.hasMany(CouponUsage, { foreignKey: 'couponId', as: 'usages' });
  CouponUsage.belongsTo(Coupon, { foreignKey: 'couponId', as: 'coupon' });

  // Transaction Associations (if Order model exists)
  // Transaction.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
  // Order.hasMany(Transaction, { foreignKey: 'orderId', as: 'transactions' });
};

// Initialize Associations
defineAssociations();

module.exports = {
  sequelize,
  
  // Distributor
  Distributor,
  DistributorKYC,
  
  // Support
  Conversation,
  Message,
  Inbox,
  CannedResponse,
  
  // Review
  Review,
  ReviewHelpfulness,
  
  // Customer
  Wishlist,
  CustomerAddress,
  
  // Cart
  Cart,
  CartItem,
  
  // Promotion
  Coupon,
  CouponUsage,
  
  // Payment
  PaymentMethod,
  Transaction,
  
  // Notification
  Notification,
};
