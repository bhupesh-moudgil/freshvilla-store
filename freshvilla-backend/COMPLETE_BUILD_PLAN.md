# FreshVilla - Complete Enterprise Build Plan
## 🎯 Build ALL Critical Features - Full Implementation

**Decision: Build everything simultaneously using your ERP advantage!**

---

## 📋 **BUILD STRATEGY**

### **Parallel Development Approach**
We'll build 3 major systems in parallel:
1. **Team A:** Distributor Marketplace (2 developers, 6 weeks)
2. **Team B:** Omnichannel Support System (2 developers, 6 weeks) - Chatwoot-inspired
3. **Team C:** Customer Features (1 developer, 6 weeks) - Reviews, Wishlist, Cart

**Timeline: 6 weeks for MVP, 12 weeks for complete system**

---

## 🏗️ **ARCHITECTURE OVERVIEW**

### **System Modules**
```
FreshVilla Enterprise Platform
├── Core E-Commerce (✅ Existing)
│   ├── Products, Orders, Customers
│   └── Stores, Warehouses, Inventory
│
├── ERP System (✅ Existing - UNIQUE ADVANTAGE)
│   ├── Internal Transfers
│   ├── Internal Invoicing
│   ├── GST Ledger
│   └── Credit Notes
│
├── 🆕 Distributor Marketplace (Team A)
│   ├── Distributor Management
│   ├── Distributor Products
│   ├── Distributor Orders
│   ├── Distributor Payments
│   └── Distributor Analytics
│
├── 🆕 Omnichannel Support (Team B)
│   ├── Live Chat
│   ├── Ticketing System
│   ├── WhatsApp Integration
│   ├── Email Integration
│   ├── Internal Notes
│   └── Agent Management
│
├── 🆕 Customer Engagement (Team C)
│   ├── Product Reviews & Ratings
│   ├── Wishlist System
│   ├── Q&A System
│   ├── Persistent Cart
│   └── Address Management
│
├── 🆕 Payment Integration (Week 7-8)
│   ├── Razorpay
│   ├── Stripe
│   ├── PayPal
│   └── COD/UPI
│
└── 🆕 Advanced Features (Week 9-12)
    ├── Analytics Dashboard
    ├── Task Management
    ├── CMS Features
    └── Subscription Model
```

---

## 📦 **TEAM A: DISTRIBUTOR MARKETPLACE** (6 weeks)

### **Week 1: Foundation Models**

#### Task A1.1: Create Distributor Core Models (2 days)
**Files to Create:**
```
src/models/distributor/Distributor.js
src/models/distributor/DistributorKYC.js
src/models/distributor/DistributorSettings.js
```

**Distributor.js Fields:**
- distributorPrefixId, customerId
- Company info (name, description, logo, cover)
- Contact person details
- Company address (city, state, pincode)
- Legal info (GST, PAN)
- Bank account details (JSONB)
- Verification status (pending/in-review/verified/rejected)
- Approval flags
- Commission settings
- Distributor slug
- Storefront settings

#### Task A1.2: Create Distributor Product Models (1 day)
```
src/models/distributor/DistributorProduct.js
src/models/distributor/DistributorInventory.js
```

**DistributorProduct.js:**
- distributorId, productId
- distributorSKU, distributorPrice, distributorMRP
- stock, lowStockThreshold
- approvalStatus
- commissionType, commissionValue

#### Task A1.3: Create Distributor Order Models (1 day)
```
src/models/distributor/DistributorOrder.js
src/models/distributor/DistributorOrderItem.js
```

**DistributorOrder.js:**
- Links to main order
- Distributor-specific order items
- Distributor commission calculation
- Fulfillment status
- Shipping details

#### Task A1.4: Create Distributor Payment Models (1 day)
```
src/models/distributor/DistributorPayment.js
src/models/distributor/DistributorPaymentItem.js
src/models/distributor/DistributorSettlement.js
```

**DistributorPayment.js:**
- Settlement period tracking
- Total sales, commission, net payable
- Payment status and method
- Transaction references

### **Week 2: Distributor Controllers & Authentication**

#### Task A2.1: Distributor Registration Controller (2 days)
```
src/controllers/distributor/distributorRegistrationController.js
```
**Functions:**
- registerDistributor()
- uploadKYCDocument()
- getDistributorStatus()
- updateDistributorProfile()

#### Task A2.2: Distributor Auth Middleware (1 day)
```
src/middleware/distributorAuth.js
```
- JWT verification
- Distributor status checks
- Permission handling

#### Task A2.3: Admin Distributor Controllers (2 days)
```
src/controllers/admin/adminDistributorController.js
src/controllers/admin/adminDistributorKYCController.js
```
**Functions:**
- getAllDistributors()
- approveDistributor()
- rejectDistributor()
- verifyKYC()
- updateCommission()

### **Week 3: Distributor Product Management**

#### Task A3.1: Distributor Product Controller (3 days)
```
src/controllers/distributor/distributorProductController.js
```
**Functions:**
- addProduct()
- updateProduct()
- updateInventory()
- bulkUpload()
- getMyProducts()
- getProductPerformance()

#### Task A3.2: Admin Product Approval (2 days)
```
src/controllers/admin/adminDistributorProductController.js
```
**Functions:**
- getPendingProducts()
- approveProduct()
- rejectProduct()
- bulkApprove()

### **Week 4: Distributor Order Management**

#### Task A4.1: Order Split Logic (3 days)
```
src/services/orderSplitService.js
```
**Features:**
- Split order by distributor
- Calculate distributor commissions
- Create distributor sub-orders
- Assign fulfillment

#### Task A4.2: Distributor Order Controller (2 days)
```
src/controllers/distributor/distributorOrderController.js
```
**Functions:**
- getMyOrders()
- updateOrderStatus()
- markShipped()
- handleReturns()

### **Week 5: Distributor Payments & Settlements**

#### Task A5.1: Payment Calculation Service (3 days)
```
src/services/distributorPaymentService.js
```
**Features:**
- Calculate distributor earnings
- Deduct commissions
- Generate settlement reports
- Handle payment processing

#### Task A5.2: Distributor Payment Controller (2 days)
```
src/controllers/distributor/distributorPaymentController.js
```
**Functions:**
- getMyPayments()
- getSettlements()
- downloadInvoice()
- getEarningsReport()

### **Week 6: Distributor Portal & Dashboard**

#### Task A6.1: Distributor Dashboard Controller (2 days)
```
src/controllers/distributor/distributorDashboardController.js
```
**Metrics:**
- Total sales, orders, products
- Pending payments
- Recent orders
- Performance analytics

#### Task A6.2: Distributor Analytics (3 days)
```
src/controllers/distributor/distributorAnalyticsController.js
```
**Reports:**
- Sales trends
- Product performance
- Order fulfillment rates
- Customer reviews

---

## 💬 **TEAM B: OMNICHANNEL SUPPORT SYSTEM** (6 weeks)
**Inspired by Chatwoot - Built In-House**

### **Week 1: Support Foundation**

#### Task B1.1: Conversation Models (2 days)
```
src/models/support/Conversation.js
src/models/support/Message.js
src/models/support/Contact.js
```

**Conversation.js** (Chatwoot-inspired):
- conversationId, customerId
- channelType: ENUM('chat', 'email', 'whatsapp', 'phone')
- status: ENUM('open', 'pending', 'resolved', 'closed')
- assignedAgentId
- priority: ENUM('low', 'medium', 'high', 'urgent')
- tags (array)
- customAttributes (JSONB)
- lastActivityAt
- firstResponseTime, resolutionTime

**Message.js:**
- conversationId
- senderType: ENUM('customer', 'agent', 'bot', 'system')
- senderId
- content, contentType
- attachments (array)
- messageType: ENUM('text', 'image', 'file', 'audio', 'video')
- status: ENUM('sent', 'delivered', 'read', 'failed')
- externalId (for WhatsApp, etc.)

**Contact.js:**
- Extends customer
- additionalAttributes (JSONB)
- conversationHistory
- lastSeenAt

#### Task B1.2: Inbox & Channel Models (2 days)
```
src/models/support/Inbox.js
src/models/support/Channel.js
src/models/support/ChannelWhatsapp.js
src/models/support/ChannelEmail.js
src/models/support/ChannelWebChat.js
```

**Inbox.js:**
- inboxName
- channelType
- welcomeMessage
- autoAssignment
- workingHours (JSONB)
- businessHours

**ChannelWhatsapp.js:**
- phoneNumber
- phoneNumberId
- businessAccountId
- webhookToken
- provider: ENUM('whatsapp_cloud', 'twilio', 'gupshup')

#### Task B1.3: Agent Models (1 day)
```
src/models/support/Agent.js
src/models/support/AgentPresence.js
src/models/support/Team.js
```

**Agent.js:**
- Extends Employee model
- role: ENUM('agent', 'administrator')
- availability: ENUM('online', 'busy', 'offline')
- maxConcurrentChats
- autoAssignEnabled

### **Week 2: Live Chat System**

#### Task B2.1: WebSocket Setup (2 days)
```
src/services/websocketService.js
```
**Using Socket.io:**
- Real-time message delivery
- Typing indicators
- Presence updates
- Read receipts

#### Task B2.2: Chat Controller (2 days)
```
src/controllers/support/chatController.js
```
**Functions:**
- startConversation()
- sendMessage()
- receiveMessage()
- updateTyping()
- markAsRead()

#### Task B2.3: Widget Embed (1 day)
```
public/chat-widget.js
```
- Embeddable chat widget
- Customizable theme
- File upload support

### **Week 3: WhatsApp Integration**

#### Task B3.1: WhatsApp Service (3 days)
```
src/services/whatsapp/whatsappCloudService.js
src/services/whatsapp/whatsappWebhookHandler.js
```

**Features:**
- WhatsApp Cloud API integration
- Send/receive messages
- Media handling (images, docs, audio)
- Template messages
- Quick replies
- Interactive buttons

#### Task B3.2: WhatsApp Controller (2 days)
```
src/controllers/support/whatsappController.js
```
**Functions:**
- handleIncomingMessage()
- sendWhatsappMessage()
- sendTemplate()
- handleStatus()
- syncContacts()

### **Week 4: Email Integration**

#### Task B4.1: Email Channel Service (2 days)
```
src/services/email/emailChannelService.js
```
**Features:**
- IMAP integration (fetch emails)
- SMTP integration (send replies)
- Email parsing
- Attachment handling
- Thread tracking

#### Task B4.2: Email Controller (2 days)
```
src/controllers/support/emailController.js
```
**Functions:**
- fetchEmails()
- sendEmailReply()
- assignToConversation()
- handleBounces()

#### Task B4.3: Automated Responses (1 day)
```
src/models/support/CannedResponse.js
src/models/support/AutomationRule.js
```

### **Week 5: Agent Dashboard & Assignment**

#### Task B5.1: Agent Dashboard (3 days)
```
src/controllers/support/agentDashboardController.js
```
**Features:**
- My conversations (open, pending, resolved)
- Conversation filters
- Quick actions
- Performance metrics
- Team performance

#### Task B5.2: Assignment Logic (2 days)
```
src/services/conversationAssignmentService.js
```
**Strategies:**
- Round-robin
- Least loaded
- Skill-based
- Manual assignment
- Auto-reassignment on no response

### **Week 6: Analytics & Reporting**

#### Task B6.1: Support Analytics (2 days)
```
src/controllers/support/supportAnalyticsController.js
```
**Metrics:**
- First response time (FRT)
- Average resolution time
- CSAT scores
- Agent performance
- Channel-wise reports

#### Task B6.2: CSAT & Feedback (2 days)
```
src/models/support/CSATSurvey.js
src/controllers/support/feedbackController.js
```

#### Task B6.3: SLA Management (1 day)
```
src/models/support/SLAPolicy.js
src/services/slaTrackingService.js
```

---

## ⭐ **TEAM C: CUSTOMER ENGAGEMENT** (6 weeks)

### **Week 1-2: Reviews & Ratings**

#### Task C1.1: Review Models (2 days)
```
src/models/review/ProductReview.js
src/models/review/ReviewHelpful.js
src/models/review/ReviewResponse.js
src/models/review/ReviewMedia.js
```

**ProductReview.js:**
- productId, customerId, orderId
- rating (1-5)
- title, review
- images (array)
- verifiedPurchase
- status: ENUM('pending', 'approved', 'rejected')
- helpful, notHelpful counters
- flagged, flagReason

#### Task C1.2: Q&A Models (1 day)
```
src/models/review/ProductQuestion.js
src/models/review/ProductAnswer.js
```

#### Task C1.3: Review Controllers (3 days)
```
src/controllers/customer/reviewController.js
src/controllers/admin/reviewModerationController.js
```

**Customer Functions:**
- submitReview()
- uploadReviewImages()
- markHelpful()
- askQuestion()
- answerQuestion()

**Admin Functions:**
- moderateReviews()
- approveReview()
- rejectReview()
- respondToReview()

#### Task C1.4: Review Aggregation (2 days)
```
src/services/reviewAggregationService.js
```
- Calculate average ratings
- Rating distribution (5 star, 4 star, etc.)
- Update product rating scores
- Generate review summaries

### **Week 3: Wishlist System**

#### Task C2.1: Wishlist Models (1 day)
```
src/models/customer/Wishlist.js
src/models/customer/WishlistItem.js
```

**Wishlist.js:**
- customerId
- name ('My Wishlist', 'Birthday Gifts')
- isPublic, shareToken
- itemCount

**WishlistItem.js:**
- wishlistId, productId
- priceAtAdd
- notifyOnPriceDrop
- notifyOnBackInStock
- priority

#### Task C2.2: Wishlist Controller (2 days)
```
src/controllers/customer/wishlistController.js
```
**Functions:**
- createWishlist()
- addToWishlist()
- removeFromWishlist()
- moveToCart()
- shareWishlist()
- getPublicWishlist()

#### Task C2.3: Price Drop Notifications (2 days)
```
src/jobs/priceDropNotificationJob.js
```
- Monitor price changes
- Send email/push notifications
- Back-in-stock alerts

### **Week 4: Persistent Cart**

#### Task C3.1: Cart Models (1 day)
```
src/models/cart/Cart.js
src/models/cart/CartItem.js
```

**Cart.js:**
- customerId or sessionId (for guests)
- status: ENUM('active', 'abandoned', 'converted')
- expiresAt
- totalItems, totalValue

**CartItem.js:**
- cartId, productId
- quantity, price
- selectedVariant (JSONB)
- addedAt, updatedAt
- isAvailable

#### Task C3.2: Cart Controller (2 days)
```
src/controllers/cart/cartController.js
```
**Functions:**
- getCart()
- addToCart()
- updateQuantity()
- removeFromCart()
- clearCart()
- validateCart()
- applyGupon()

#### Task C3.3: Cart Abandonment (2 days)
```
src/jobs/cartAbandonmentJob.js
src/models/cart/CartAbandon.js
```
- Track abandonment
- Send recovery emails
- Analytics on abandonment reasons

### **Week 5: Address Management**

#### Task C4.1: Address Model (1 day)
```
src/models/customer/Address.js
```
**Replace JSONB with proper model:**
- customerId
- addressType: ENUM('home', 'office', 'other')
- label
- firstName, lastName, phone
- addressLine1, addressLine2
- city, cityCode, state, stateCode
- pincode, country, landmark
- isDefault
- latitude, longitude
- deliveryInstructions

#### Task C4.2: Address Controller (2 days)
```
src/controllers/customer/addressController.js
```
**Functions:**
- addAddress()
- updateAddress()
- deleteAddress()
- setDefaultAddress()
- validateAddress() // Google Maps API

#### Task C4.3: Data Migration (2 days)
```
migrations/migrate-addresses-from-jsonb.js
```
- Extract addresses from customer.addresses JSONB
- Create Address records
- Maintain backward compatibility

### **Week 6: Return & Refund System**

#### Task C5.1: Return Models (2 days)
```
src/models/order/ReturnRequest.js
src/models/order/RefundTransaction.js
src/models/order/ExchangeRequest.js
```

**ReturnRequest.js:**
- orderId, orderProductId
- customerId, distributorId
- returnReason, description
- returnType: ENUM('refund', 'exchange', 'replacement')
- images (damage proof)
- status: ENUM('requested', 'approved', 'rejected', 'picked-up', 'received', 'refunded')
- approvedBy, processedBy
- refundAmount, refundMethod

#### Task C5.2: Return Controller (3 days)
```
src/controllers/order/returnController.js
src/controllers/admin/returnManagementController.js
```

**Customer Functions:**
- initiateReturn()
- uploadReturnProof()
- trackReturn()
- cancelReturn()

**Admin Functions:**
- getPendingReturns()
- approveReturn()
- rejectReturn()
- arrangePickup()
- processRefund()

---

## 💳 **PHASE 2: PAYMENT INTEGRATION** (Week 7-8)

### **Week 7: Payment Gateway Setup**

#### Task P1.1: Payment Models (2 days)
```
src/models/payment/PaymentMethod.js
src/models/payment/PaymentTransaction.js
src/models/payment/PaymentRefund.js
```

#### Task P1.2: Razorpay Integration (2 days)
```
src/services/payment/razorpayService.js
src/controllers/payment/razorpayController.js
```
**Features:**
- Create order
- Verify payment
- Handle webhooks
- Capture payment
- Process refunds

#### Task P1.3: Stripe Integration (2 days)
```
src/services/payment/stripeService.js
src/controllers/payment/stripeController.js
```

### **Week 8: Multiple Payment Methods**

#### Task P2.1: Payment Orchestration (3 days)
```
src/services/payment/paymentOrchestratorService.js
```
**Features:**
- Route to appropriate gateway
- Handle failures & retries
- Payment status synchronization
- Reconciliation

#### Task P2.2: COD & UPI (1 day)
```
src/controllers/payment/codController.js
src/controllers/payment/upiController.js
```

#### Task P2.3: Payment Dashboard (1 day)
```
src/controllers/admin/paymentDashboardController.js
```

---

## 📊 **PHASE 3: ANALYTICS & ADVANCED FEATURES** (Week 9-12)

### **Week 9: Analytics Dashboard**

#### Task AN1.1: Analytics Models (2 days)
```
src/models/analytics/SalesReport.js
src/models/analytics/CustomerActivity.js
src/models/analytics/ProductPerformance.js
```

#### Task AN1.2: Analytics Service (3 days)
```
src/services/analyticsService.js
```
**Metrics:**
- Sales trends
- Customer lifetime value
- Product performance
- Conversion funnels
- Revenue reports

### **Week 10: Task Management**

#### Task TM1.1: Task Models (2 days)
```
src/models/task/Task.js
src/models/task/TaskComment.js
src/models/task/Workflow.js
src/models/task/ApprovalProcess.js
```

#### Task TM1.2: Task Controllers (3 days)
```
src/controllers/task/taskController.js
src/controllers/workflow/workflowController.js
```

### **Week 11: CMS Features**

#### Task CMS1.1: CMS Models (2 days)
```
src/models/cms/Page.js
src/models/cms/BlogPost.js
src/models/cms/Category.js
```

#### Task CMS1.2: CMS Controllers (3 days)
```
src/controllers/cms/pageController.js
src/controllers/cms/blogController.js
```

### **Week 12: Polish & Testing**

#### Task FIN1: Integration Testing (2 days)
#### Task FIN2: Performance Optimization (2 days)
#### Task FIN3: Documentation (1 day)

---

## 🗂️ **PROJECT STRUCTURE**

```
freshvilla-backend/
├── src/
│   ├── models/
│   │   ├── distributor/          (Team A)
│   │   │   ├── Distributor.js
│   │   │   ├── DistributorKYC.js
│   │   │   ├── DistributorProduct.js
│   │   │   ├── DistributorOrder.js
│   │   │   └── DistributorPayment.js
│   │   │
│   │   ├── support/         (Team B)
│   │   │   ├── Conversation.js
│   │   │   ├── Message.js
│   │   │   ├── Inbox.js
│   │   │   ├── Agent.js
│   │   │   └── Channel*.js
│   │   │
│   │   ├── customer/        (Team C)
│   │   │   ├── Wishlist.js
│   │   │   ├── Address.js
│   │   │   └── CustomerActivity.js
│   │   │
│   │   ├── review/
│   │   │   ├── ProductReview.js
│   │   │   └── ProductQuestion.js
│   │   │
│   │   ├── cart/
│   │   │   ├── Cart.js
│   │   │   └── CartItem.js
│   │   │
│   │   ├── payment/
│   │   └── analytics/
│   │
│   ├── controllers/
│   │   ├── distributor/
│   │   ├── support/
│   │   ├── customer/
│   │   └── admin/
│   │
│   ├── services/
│   │   ├── distributorPaymentService.js
│   │   ├── whatsapp/
│   │   ├── payment/
│   │   ├── websocketService.js
│   │   └── analyticsService.js
│   │
│   ├── jobs/              (Background jobs)
│   │   ├── priceDropNotificationJob.js
│   │   ├── cartAbandonmentJob.js
│   │   └── distributorSettlementJob.js
│   │
│   ├── middleware/
│   │   ├── distributorAuth.js
│   │   └── agentAuth.js
│   │
│   └── routes/
│       ├── distributor.js
│       ├── support.js
│       ├── customer.js
│       └── admin.js
│
├── migrations/
├── tests/
└── docs/
```

---

## 👥 **TEAM ALLOCATION**

### **Team A: Distributor Marketplace**
- **Developer A1** (Senior): Models, Services, Payment Logic
- **Developer A2** (Mid): Controllers, APIs, Admin Panel

### **Team B: Omnichannel Support**
- **Developer B1** (Senior): WebSocket, WhatsApp, Real-time
- **Developer B2** (Mid): Email, Controllers, Dashboard

### **Team C: Customer Engagement**
- **Developer C1** (Mid-Senior): All customer features

### **Shared Resources**
- **DevOps Engineer**: Infrastructure, deployments
- **QA Engineer**: Testing all modules
- **Frontend Developer**: Admin panels, distributor portal, chat widget

---

## 📈 **MILESTONES & DELIVERABLES**

### **Week 2 Milestone: MVP Models Complete**
- ✅ All models created
- ✅ Database migrations ready
- ✅ Associations defined

### **Week 4 Milestone: Core APIs Ready**
- ✅ Distributor registration & KYC
- ✅ Live chat working
- ✅ Review submission

### **Week 6 Milestone: Full MVP**
- ✅ Distributor marketplace functional
- ✅ Omnichannel support live
- ✅ Customer features working
- ✅ Ready for alpha testing

### **Week 8 Milestone: Payment Integration**
- ✅ Multiple payment gateways
- ✅ Payment reconciliation
- ✅ Refund processing

### **Week 12 Milestone: Production Ready**
- ✅ All features complete
- ✅ Tests passing
- ✅ Performance optimized
- ✅ Documentation complete

---

## ✅ **IMPLEMENTATION CHECKLIST**

### **Phase 1: Setup (Week 0)**
- [ ] Create project branches (distributor, support, customer)
- [ ] Setup development environments
- [ ] Create model directories
- [ ] Setup Socket.io for real-time
- [ ] Configure Redis for caching
- [ ] Setup Bull for job queues

### **Phase 2: Development (Week 1-6)**
- [ ] Team A: Complete distributor marketplace
- [ ] Team B: Complete support system
- [ ] Team C: Complete customer features
- [ ] Code reviews every 2 days
- [ ] Integration meetings twice weekly

### **Phase 3: Integration (Week 7-8)**
- [ ] Merge all features
- [ ] Payment integration
- [ ] End-to-end testing
- [ ] Bug fixes

### **Phase 4: Polish (Week 9-12)**
- [ ] Analytics & reporting
- [ ] Task management
- [ ] CMS features
- [ ] Performance optimization
- [ ] Security audit
- [ ] Load testing
- [ ] Documentation

---

## 🚀 **START IMMEDIATELY**

### **THIS WEEK:**
1. ✅ Assign teams
2. ✅ Create model files (use templates from PHASE1_QUICKSTART.md)
3. ✅ Setup development branches
4. ✅ Initialize WebSocket for chat
5. ✅ Configure WhatsApp Cloud API credentials

### **NEXT WEEK:**
1. Start controllers
2. Build basic UIs
3. Test integrations

---

## 📞 **DAILY STANDUPS**

**Format:** 15 minutes daily
- What did I complete yesterday?
- What will I work on today?
- Any blockers?
- Integration needs?

---

## 🎯 **SUCCESS METRICS**

### **Week 6 Targets:**
- ✅ 10 distributors onboarded
- ✅ 100 products listed
- ✅ 50 support conversations
- ✅ 20 product reviews
- ✅ Live chat response < 2 min

### **Week 12 Targets:**
- ✅ 50+ distributors
- ✅ 1000+ products
- ✅ 500+ orders processed
- ✅ 200+ support tickets resolved
- ✅ 100+ reviews
- ✅ Payment success rate > 95%

---

**LET'S BUILD THE BEST B2B+B2C MARKETPLACE WITH IN-HOUSE SUPPORT! 🚀**

**Next Step: Review this plan, assign teams, and start with model creation tomorrow!**
