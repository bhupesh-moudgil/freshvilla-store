# FreshVilla Enterprise - Detailed Task Tracker
## Sprint-based Development with User Stories

---

## 🎯 **SPRINT 0: Setup & Infrastructure** (Week 0)

### Epic: Infrastructure Setup
**Goal:** Prepare development environment and tooling

#### INFRA-1: Setup Socket.io for Real-time Chat
**Priority:** HIGH | **Points:** 5 | **Assignee:** Developer B1
```
As a system architect
I want to setup Socket.io
So that we can enable real-time messaging

Acceptance Criteria:
- [ ] Install socket.io and socket.io-client
- [ ] Configure server-side socket connections
- [ ] Add authentication middleware for sockets
- [ ] Test basic message emission
- [ ] Document socket events

Files to Create/Modify:
- server.js (add socket.io init)
- src/services/websocketService.js
- src/middleware/socketAuth.js
```

#### INFRA-2: Setup Bull Queue for Background Jobs
**Priority:** HIGH | **Points:** 3 | **Assignee:** DevOps
```
As a system architect
I want to setup Bull queue with Redis
So that we can handle background jobs efficiently

Acceptance Criteria:
- [ ] Install bull and redis
- [ ] Configure Redis connection
- [ ] Create queue processor
- [ ] Add monitoring dashboard
- [ ] Document job patterns

Files to Create:
- src/jobs/queue.js
- src/jobs/processors/
- config/redis.js
```

#### INFRA-3: Create Model Directory Structure
**Priority:** HIGH | **Points:** 2 | **Assignee:** All Teams
```
Acceptance Criteria:
- [ ] Create src/models/distributor/
- [ ] Create src/models/support/
- [ ] Create src/models/customer/
- [ ] Create src/models/review/
- [ ] Create src/models/cart/
- [ ] Create src/models/payment/
- [ ] Create src/models/analytics/
- [ ] Create src/models/task/
- [ ] Create src/models/cms/
```

#### INFRA-4: Setup Development Branches
**Priority:** HIGH | **Points:** 1 | **Assignee:** Lead Dev
```
Acceptance Criteria:
- [ ] Create feature/distributor-marketplace branch
- [ ] Create feature/support-system branch
- [ ] Create feature/customer-engagement branch
- [ ] Setup branch protection rules
- [ ] Configure CI/CD for branches
```

---

## 🏪 **SPRINT 1: Distributor Foundation** (Week 1)

### Epic: Distributor Core Models
**Goal:** Create all distributor-related database models

#### DISTRIBUTOR-1: Create Distributor Model
**Priority:** CRITICAL | **Points:** 8 | **Assignee:** Developer A1
```
As a distributor
I want to register my business
So that I can sell products on the platform

Acceptance Criteria:
- [ ] Create Distributor.js model with all fields
- [ ] Add validation for GST and PAN
- [ ] Add unique constraints
- [ ] Add indexes for performance
- [ ] Add instance methods (generateSlug)
- [ ] Write unit tests

Model Fields:
✓ distributorPrefixId (unique, auto-generated)
✓ customerId (FK to customers)
✓ companyName, companyDescription
✓ companyLogo, companyCoverImage
✓ contactPersonName, designation
✓ companyAddress1, companyAddress2
✓ companyCity, companyCityCode, companyState, companyStateCode
✓ companyPincode, companyCountry
✓ companyPhone, companyEmail, companyWebsite
✓ companyGST (with validation), companyPAN (with validation)
✓ bankAccountDetails (JSONB)
✓ commission (decimal)
✓ verificationStatus ENUM
✓ verificationComments (JSONB array)
✓ approvalFlag, approvedBy, approvedDate
✓ isActive, isDelete
✓ distributorSlug (unique)
✓ storefrontSettings (JSONB)
✓ lastLoginDate

File: src/models/distributor/Distributor.js
Test: tests/models/distributor/Distributor.test.js
```

#### DISTRIBUTOR-2: Create DistributorKYC Model
**Priority:** CRITICAL | **Points:** 5 | **Assignee:** Developer A1
```
As an admin
I want to verify distributor documents
So that we can ensure legitimate sellers

Acceptance Criteria:
- [ ] Create DistributorKYC.js model
- [ ] Add FK to Distributor
- [ ] Support multiple document types
- [ ] Add verification workflow fields
- [ ] Add file storage handling

Model Fields:
✓ distributorId (FK)
✓ documentType ENUM(gst_certificate, pan_card, bank_proof, address_proof, trade_license, other)
✓ documentNumber
✓ documentFile (path/URL)
✓ verificationStatus ENUM(pending, verified, rejected)
✓ verifiedBy (admin ID)
✓ verifiedDate
✓ rejectionReason

File: src/models/distributor/DistributorKYC.js
```

#### DISTRIBUTOR-3: Create DistributorProduct Model
**Priority:** CRITICAL | **Points:** 5 | **Assignee:** Developer A1
```
As a distributor
I want to list my products
So that customers can purchase them

Acceptance Criteria:
- [ ] Create DistributorProduct.js
- [ ] Link to Product and Distributor
- [ ] Add distributor-specific pricing
- [ ] Add stock management
- [ ] Add approval workflow

Model Fields:
✓ distributorId, productId (composite unique)
✓ distributorSKU
✓ distributorPrice, distributorMRP
✓ stock, lowStockThreshold
✓ isActive
✓ approvalStatus ENUM(pending, approved, rejected)
✓ approvedBy, approvedDate, rejectionReason
✓ commissionType ENUM(percentage, fixed)
✓ commissionValue

File: src/models/distributor/DistributorProduct.js
```

#### DISTRIBUTOR-4: Create DistributorOrder Models
**Priority:** HIGH | **Points:** 5 | **Assignee:** Developer A2
```
As a distributor
I want to receive order notifications
So that I can fulfill them

Acceptance Criteria:
- [ ] Create DistributorOrder.js
- [ ] Create DistributorOrderItem.js
- [ ] Link to main Order
- [ ] Add commission calculation
- [ ] Add fulfillment tracking

DistributorOrder Fields:
✓ orderId (FK)
✓ distributorId (FK)
✓ subOrderNumber
✓ subTotal
✓ distributorCommission, platformCommission
✓ orderStatus
✓ fulfillmentStatus
✓ paymentStatus
✓ shippingMethod, trackingNumber

Files:
- src/models/distributor/DistributorOrder.js
- src/models/distributor/DistributorOrderItem.js
```

#### DISTRIBUTOR-5: Create DistributorPayment Models
**Priority:** HIGH | **Points:** 5 | **Assignee:** Developer A2
```
As a distributor
I want to track my earnings
So that I know when I'll get paid

Acceptance Criteria:
- [ ] Create DistributorPayment.js
- [ ] Create DistributorSettlement.js
- [ ] Add settlement period tracking
- [ ] Add payment status workflow
- [ ] Add transaction reference

DistributorPayment Fields:
✓ distributorId
✓ settlementPeriod (start/end dates)
✓ totalSales, totalCommission, netPayable
✓ paymentStatus ENUM(pending, processing, paid, failed)
✓ paymentMethod
✓ paidDate
✓ paymentReference
✓ transactionId

Files:
- src/models/distributor/DistributorPayment.js
- src/models/distributor/DistributorSettlement.js
```

---

## 💬 **SPRINT 1: Support Foundation** (Week 1)

### Epic: Omnichannel Support Models
**Goal:** Create conversation and messaging models

#### SUPPORT-1: Create Conversation Model
**Priority:** CRITICAL | **Points:** 8 | **Assignee:** Developer B1
```
As a customer support agent
I want to manage conversations across channels
So that I can help customers effectively

Acceptance Criteria:
- [ ] Create Conversation.js model
- [ ] Support multiple channel types
- [ ] Add status workflow
- [ ] Add priority levels
- [ ] Add SLA tracking fields
- [ ] Add custom attributes

Model Fields:
✓ conversationId (unique)
✓ customerId (FK)
✓ channelType ENUM(chat, email, whatsapp, phone)
✓ status ENUM(open, pending, resolved, closed)
✓ assignedAgentId (FK to Employee)
✓ priority ENUM(low, medium, high, urgent)
✓ tags (array)
✓ customAttributes (JSONB)
✓ firstResponseTime
✓ resolutionTime
✓ lastActivityAt
✓ slaBreached (boolean)

File: src/models/support/Conversation.js
Inspired by: Chatwoot conversation model
```

#### SUPPORT-2: Create Message Model
**Priority:** CRITICAL | **Points:** 5 | **Assignee:** Developer B1
```
As a support agent
I want to send and receive messages
So that I can communicate with customers

Acceptance Criteria:
- [ ] Create Message.js model
- [ ] Support multiple message types
- [ ] Add attachment handling
- [ ] Add read receipts
- [ ] Add external ID for integrations

Model Fields:
✓ conversationId (FK)
✓ senderType ENUM(customer, agent, bot, system)
✓ senderId
✓ content, contentType
✓ attachments (array of objects)
✓ messageType ENUM(text, image, file, audio, video)
✓ status ENUM(sent, delivered, read, failed)
✓ externalId (for WhatsApp message ID, etc.)
✓ metadata (JSONB)

File: src/models/support/Message.js
```

#### SUPPORT-3: Create Inbox & Channel Models
**Priority:** HIGH | **Points:** 8 | **Assignee:** Developer B2
```
As a support manager
I want to configure multiple inboxes
So that we can manage different channels

Acceptance Criteria:
- [ ] Create Inbox.js
- [ ] Create ChannelWhatsapp.js
- [ ] Create ChannelEmail.js
- [ ] Create ChannelWebChat.js
- [ ] Add auto-assignment settings
- [ ] Add business hours

Inbox Fields:
✓ inboxName
✓ channelType
✓ channelId (polymorphic to channel models)
✓ welcomeMessage
✓ autoAssignment (boolean)
✓ assignmentStrategy ENUM(round_robin, least_loaded, manual)
✓ workingHours (JSONB)
✓ outOfOfficeMessage
✓ isActive

ChannelWhatsapp Fields:
✓ phoneNumber
✓ phoneNumberId
✓ businessAccountId
✓ webhookToken
✓ provider ENUM(whatsapp_cloud, twilio, gupshup)
✓ providerConfig (JSONB)

Files:
- src/models/support/Inbox.js
- src/models/support/ChannelWhatsapp.js
- src/models/support/ChannelEmail.js
- src/models/support/ChannelWebChat.js
```

#### SUPPORT-4: Create Agent Models
**Priority:** HIGH | **Points:** 5 | **Assignee:** Developer B2
```
As a support manager
I want to assign agents to conversations
So that work is distributed efficiently

Acceptance Criteria:
- [ ] Create Agent.js (extends Employee)
- [ ] Create AgentPresence.js
- [ ] Add availability tracking
- [ ] Add concurrent chat limits
- [ ] Add agent teams

Agent Fields:
✓ employeeId (FK)
✓ role ENUM(agent, supervisor, administrator)
✓ availability ENUM(online, busy, offline, away)
✓ maxConcurrentChats
✓ autoAssignEnabled
✓ skills (array)
✓ teamId (FK to Team)

Files:
- src/models/support/Agent.js
- src/models/support/AgentPresence.js
- src/models/support/Team.js
```

---

## ⭐ **SPRINT 1: Customer Engagement** (Week 1-2)

### Epic: Reviews & Ratings
**Goal:** Enable customer reviews and Q&A

#### REVIEW-1: Create ProductReview Model
**Priority:** HIGH | **Points:** 5 | **Assignee:** Developer C1
```
As a customer
I want to leave product reviews
So that I can share my experience

Acceptance Criteria:
- [ ] Create ProductReview.js
- [ ] Add rating (1-5 stars)
- [ ] Support review images
- [ ] Add moderation workflow
- [ ] Add helpful vote tracking

Model Fields:
✓ productId (FK)
✓ customerId (FK)
✓ orderId (FK)
✓ rating (1-5)
✓ title
✓ review (text)
✓ images (array)
✓ verifiedPurchase (boolean)
✓ status ENUM(pending, approved, rejected)
✓ helpful, notHelpful (counters)
✓ flagged (boolean)
✓ flagReason
✓ approvedBy, approvedDate

File: src/models/review/ProductReview.js
```

#### REVIEW-2: Create Review Supporting Models
**Priority:** MEDIUM | **Points:** 3 | **Assignee:** Developer C1
```
Acceptance Criteria:
- [ ] Create ReviewHelpful.js (track helpful votes)
- [ ] Create ReviewResponse.js (distributor responses)
- [ ] Create ReviewMedia.js (image management)

Files:
- src/models/review/ReviewHelpful.js
- src/models/review/ReviewResponse.js
- src/models/review/ReviewMedia.js
```

#### REVIEW-3: Create Product Q&A Models
**Priority:** MEDIUM | **Points:** 3 | **Assignee:** Developer C1
```
As a customer
I want to ask questions about products
So that I can make informed decisions

Acceptance Criteria:
- [ ] Create ProductQuestion.js
- [ ] Create ProductAnswer.js
- [ ] Support multiple answers
- [ ] Mark verified answers
- [ ] Add helpful voting

Files:
- src/models/review/ProductQuestion.js
- src/models/review/ProductAnswer.js
```

---

## 🏪 **SPRINT 2: Distributor Controllers** (Week 2)

### Epic: Distributor Registration & Auth
**Goal:** Enable distributor registration and authentication

#### DISTRIBUTOR-6: Distributor Registration Controller
**Priority:** CRITICAL | **Points:** 8 | **Assignee:** Developer A1
```
As a user
I want to register as a distributor
So that I can sell products

User Story:
Given I am a logged-in customer
When I submit distributor registration form
Then my application should be created in pending status
And admin should receive email notification
And I should receive confirmation email

Acceptance Criteria:
- [ ] Create distributorRegistrationController.js
- [ ] Implement registerDistributor()
- [ ] Implement uploadKYCDocument()
- [ ] Implement getDistributorStatus()
- [ ] Implement updateDistributorProfile()
- [ ] Add input validation
- [ ] Send email notifications
- [ ] Write integration tests

API Endpoints:
POST /api/distributor/register
POST /api/distributor/kyc-upload
GET /api/distributor/status
PUT /api/distributor/profile

File: src/controllers/distributor/distributorRegistrationController.js
Tests: tests/controllers/distributor/registration.test.js
```

#### DISTRIBUTOR-7: Distributor Authentication Middleware
**Priority:** CRITICAL | **Points:** 5 | **Assignee:** Developer A2
```
As a system
I want to verify distributor identity
So that only authorized distributors can access their data

Acceptance Criteria:
- [ ] Create distributorAuth.js middleware
- [ ] Implement JWT verification
- [ ] Check distributor active status
- [ ] Check distributor approval status
- [ ] Add role-based permissions
- [ ] Handle token expiry
- [ ] Write middleware tests

File: src/middleware/distributorAuth.js
```

#### DISTRIBUTOR-8: Admin Distributor Management Controller
**Priority:** CRITICAL | **Points:** 8 | **Assignee:** Developer A2
```
As an admin
I want to approve/reject distributor applications
So that we maintain quality standards

Acceptance Criteria:
- [ ] Create adminDistributorController.js
- [ ] Implement getAllDistributors()
- [ ] Implement approveDistributor()
- [ ] Implement rejectDistributor()
- [ ] Implement updateCommission()
- [ ] Implement suspendDistributor()
- [ ] Add filtering and pagination
- [ ] Send status change emails

API Endpoints:
GET /api/admin/distributors
PUT /api/admin/distributors/:id/approve
PUT /api/admin/distributors/:id/reject
PUT /api/admin/distributors/:id/commission
PUT /api/admin/distributors/:id/suspend

File: src/controllers/admin/adminDistributorController.js
```

---

## 💬 **SPRINT 2: Live Chat** (Week 2)

### Epic: Real-time Chat System
**Goal:** Enable live chat between customers and agents

#### SUPPORT-5: WebSocket Service
**Priority:** CRITICAL | **Points:** 8 | **Assignee:** Developer B1
```
As a customer/agent
I want to chat in real-time
So that I can get/provide instant support

Acceptance Criteria:
- [ ] Create websocketService.js
- [ ] Implement connection handling
- [ ] Implement message broadcasting
- [ ] Add typing indicators
- [ ] Add presence tracking
- [ ] Add read receipts
- [ ] Handle disconnections gracefully
- [ ] Add heartbeat/ping-pong

Socket Events:
- connection
- message:send
- message:receive
- typing:start
- typing:stop
- message:read
- user:online
- user:offline

File: src/services/websocketService.js
```

#### SUPPORT-6: Chat Controller
**Priority:** CRITICAL | **Points:** 5 | **Assignee:** Developer B1
```
Acceptance Criteria:
- [ ] Create chatController.js
- [ ] Implement startConversation()
- [ ] Implement sendMessage()
- [ ] Implement receiveMessage()
- [ ] Implement getConversationHistory()
- [ ] Implement markAsRead()
- [ ] Add file upload support

API Endpoints:
POST /api/support/conversations
POST /api/support/conversations/:id/messages
GET /api/support/conversations/:id/messages
PUT /api/support/messages/:id/read

File: src/controllers/support/chatController.js
```

#### SUPPORT-7: Chat Widget
**Priority:** HIGH | **Points:** 5 | **Assignee:** Frontend Dev
```
As a customer
I want a chat widget on the website
So that I can easily contact support

Acceptance Criteria:
- [ ] Create embeddable widget
- [ ] Add customizable branding
- [ ] Support file uploads
- [ ] Add emoji support
- [ ] Responsive design
- [ ] Minimize/maximize functionality
- [ ] Unread message counter

File: public/chat-widget.js
CSS: public/chat-widget.css
```

---

## 📋 **SPRINT PLANNING TEMPLATE**

For each subsequent sprint, use this template:

### Sprint X: [Sprint Name]

**Duration:** Week X
**Goal:** [Sprint objective]
**Team:** [Team A/B/C]

#### User Stories

##### [TICKET-ID]: [Title]
**Priority:** [CRITICAL/HIGH/MEDIUM/LOW]
**Points:** [1-13 fibonacci]
**Assignee:** [Developer name]

```
As a [role]
I want to [action]
So that [benefit]

Acceptance Criteria:
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

Technical Tasks:
- [ ] Task 1
- [ ] Task 2

Files:
- path/to/file.js

Tests:
- path/to/test.js
```

---

## 📊 **PROGRESS TRACKING**

### Sprint 0 (Setup)
- [ ] INFRA-1: Socket.io Setup
- [ ] INFRA-2: Bull Queue Setup
- [ ] INFRA-3: Directory Structure
- [ ] INFRA-4: Branch Setup

### Sprint 1 (Week 1)
**Team A:**
- [ ] DISTRIBUTOR-1: Distributor Model
- [ ] DISTRIBUTOR-2: DistributorKYC Model
- [ ] DISTRIBUTOR-3: DistributorProduct Model
- [ ] DISTRIBUTOR-4: DistributorOrder Models
- [ ] DISTRIBUTOR-5: DistributorPayment Models

**Team B:**
- [ ] SUPPORT-1: Conversation Model
- [ ] SUPPORT-2: Message Model
- [ ] SUPPORT-3: Inbox & Channels
- [ ] SUPPORT-4: Agent Models

**Team C:**
- [ ] REVIEW-1: ProductReview Model
- [ ] REVIEW-2: Review Supporting Models
- [ ] REVIEW-3: Product Q&A Models

### Sprint 2 (Week 2)
**Team A:**
- [ ] DISTRIBUTOR-6: Registration Controller
- [ ] DISTRIBUTOR-7: Auth Middleware
- [ ] DISTRIBUTOR-8: Admin Controller

**Team B:**
- [ ] SUPPORT-5: WebSocket Service
- [ ] SUPPORT-6: Chat Controller
- [ ] SUPPORT-7: Chat Widget

---

## 🎯 **DAILY STANDUP FORMAT**

**Time:** 10:00 AM daily
**Duration:** 15 minutes

**Each developer answers:**
1. What did I complete yesterday?
2. What will I work on today?
3. Any blockers or dependencies?
4. Do I need help from another team?

**Sample:**
```
Developer A1:
✅ Yesterday: Completed DISTRIBUTOR-1 (Distributor Model) - PR #123
🎯 Today: Starting DISTRIBUTOR-2 (DistributorKYC Model)
🚫 Blockers: Need clarity on KYC document storage (S3 vs local)
🤝 Dependencies: Need env vars from DevOps for file upload
```

---

## 📈 **BURNDOWN TRACKING**

### Week 1 Target: 70 points
- Team A: 28 points
- Team B: 26 points
- Team C: 16 points

### Week 2 Target: 68 points
- Team A: 21 points
- Team B: 18 points
- Team C: 29 points

---

**LET'S START BUILDING! 🚀**

**Next Action:** Assign ticket IDs to team members in your project management tool (Jira/Linear/GitHub Projects)
