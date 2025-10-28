# 🧾 FreshVilla Automated Invoice & Order Management System
## Inspired by InvoicePlane Architecture

---

## 📊 **System Overview**

### **Inspiration from InvoicePlane**
InvoicePlane provides:
- Professional invoice generation
- Client management
- Payment tracking
- Tax calculations
- PDF exports
- Email automation

### **FreshVilla Requirements**
- **Multi-channel:** Website, Mobile Apps, Store Outlets
- **Automated:** Zero manual intervention
- **Real-time:** Instant invoice generation
- **Multi-store:** Each store has own invoicing
- **Compliance:** GST, FSSAI regulations
- **Customer portal:** View orders & invoices

---

## 🏗️ **Architecture Design**

### **Core Components**

```
┌─────────────────────────────────────────────────┐
│         Order Sources (Multi-Channel)           │
├─────────────┬─────────────┬────────────────────┤
│   Website   │  Mobile App │  Store POS System  │
└──────┬──────┴──────┬──────┴──────┬─────────────┘
       │             │              │
       └─────────────┼──────────────┘
                     │
         ┌───────────▼───────────┐
         │   Order Processing    │
         │   Engine (Automated)  │
         └───────────┬───────────┘
                     │
         ┌───────────▼───────────┐
         │  Invoice Generator    │
         │  (Auto-triggered)     │
         └───────────┬───────────┘
                     │
         ┌───────────▼───────────┐
         │  Customer Portal      │
         │  (View & Download)    │
         └───────────────────────┘
```

---

## 🗄️ **Database Schema**

### **Enhanced Models**

#### **1. Customer Model** (Enhanced)
```javascript
Customer {
  id: UUID
  name: String
  email: String
  phone: String
  customerId: String        // AUTO: FV-CUST-{city}-{number}
  
  // Billing Address
  billingAddress: Text
  billingCity: String
  billingState: String
  billingPincode: String
  billingGSTIN: String       // Optional for businesses
  
  // Shipping Address (can differ)
  shippingAddress: Text
  shippingCity: String
  shippingState: String
  shippingPincode: String
  
  // Customer Stats
  totalOrders: Integer
  totalSpent: Decimal
  lifetimeValue: Decimal
  averageOrderValue: Decimal
  lastOrderDate: DateTime
  
  // Preferences
  emailNotifications: Boolean
  smsNotifications: Boolean
  preferredPaymentMethod: String
  
  // Loyalty
  loyaltyPoints: Integer
  membershipTier: String     // Bronze, Silver, Gold, Platinum
  
  // Metadata
  source: String             // website, app, store
  registeredAt: DateTime
  isActive: Boolean
}
```

#### **2. Order Model** (Enhanced)
```javascript
Order {
  id: UUID
  orderNumber: String        // AUTO: FV-{store}-{date}-{seq}
  invoiceNumber: String      // AUTO: INV-{FY}-{store}-{seq}
  
  // Customer Info
  customerId: UUID
  customerName: String
  customerEmail: String
  customerPhone: String
  
  // Store Info
  storeId: UUID
  storeName: String
  storeGSTIN: String
  
  // Order Details
  orderDate: DateTime
  orderStatus: Enum          // pending, confirmed, processing, shipped, delivered, cancelled
  paymentStatus: Enum        // pending, paid, failed, refunded
  paymentMethod: String
  
  // Amounts
  subtotal: Decimal
  discount: Decimal
  discountType: String       // coupon, loyalty, bulk
  taxAmount: Decimal
  deliveryFee: Decimal
  totalAmount: Decimal
  paidAmount: Decimal
  dueAmount: Decimal
  
  // Addresses
  billingAddress: JSON
  shippingAddress: JSON
  
  // Delivery
  deliveryType: String       // home_delivery, store_pickup
  estimatedDelivery: DateTime
  actualDelivery: DateTime
  trackingNumber: String
  
  // Invoice
  invoiceGenerated: Boolean
  invoiceGeneratedAt: DateTime
  invoicePath: String        // S3/local path
  invoiceSent: Boolean
  invoiceSentAt: DateTime
  
  // Payment Tracking
  transactions: JSON[]       // Array of payment transactions
  
  // Notes
  customerNotes: Text
  adminNotes: Text
  
  // Metadata
  source: String             // website, app, store
  ipAddress: String
  userAgent: String
  
  createdAt: DateTime
  updatedAt: DateTime
}
```

#### **3. Invoice Model** (NEW)
```javascript
Invoice {
  id: UUID
  invoiceNumber: String      // AUTO: INV-{FY}-{store}-{seq}
  
  // References
  orderId: UUID
  customerId: UUID
  storeId: UUID
  
  // Invoice Details
  invoiceDate: Date
  dueDate: Date
  financialYear: String      // 2024-25
  
  // Status
  status: Enum               // draft, sent, paid, overdue, cancelled
  
  // Amounts (from order)
  subtotal: Decimal
  discountAmount: Decimal
  taxableAmount: Decimal
  cgst: Decimal              // Central GST
  sgst: Decimal              // State GST
  igst: Decimal              // Integrated GST (inter-state)
  totalTax: Decimal
  totalAmount: Decimal
  paidAmount: Decimal
  balanceDue: Decimal
  
  // Tax Details
  taxBreakdown: JSON         // Detailed tax calculation
  placeOfSupply: String      // State code
  isInterState: Boolean
  
  // Payment Terms
  paymentTerms: String       // "Immediate", "Net 30", etc.
  lateFee: Decimal
  
  // Files
  pdfPath: String
  pdfUrl: String
  
  // Email Tracking
  emailSent: Boolean
  emailSentAt: DateTime
  emailOpenedAt: DateTime
  
  // Customer View
  viewedByCustomer: Boolean
  viewedAt: DateTime
  downloadedAt: DateTime
  
  // Notes
  notes: Text
  terms: Text
  
  createdAt: DateTime
  updatedAt: DateTime
}
```

#### **4. OrderItem Model** (Enhanced)
```javascript
OrderItem {
  id: UUID
  orderId: UUID
  productId: UUID
  
  // Product Info (snapshot at order time)
  productName: String
  productSKU: String
  productImage: String
  
  // Pricing
  unitPrice: Decimal
  quantity: Integer
  discount: Decimal
  taxRate: Decimal           // GST rate (5%, 12%, 18%)
  taxAmount: Decimal
  totalPrice: Decimal
  
  // Tax Details
  hsnCode: String            // HSN code for GST
  taxCategory: String
  
  // Metadata
  weight: Decimal
  unit: String               // kg, litre, piece
}
```

#### **5. Transaction Model** (NEW)
```javascript
Transaction {
  id: UUID
  transactionNumber: String  // AUTO: TXN-{date}-{seq}
  
  // References
  orderId: UUID
  invoiceId: UUID
  customerId: UUID
  storeId: UUID
  
  // Transaction Details
  transactionDate: DateTime
  transactionType: Enum      // payment, refund, adjustment
  paymentMethod: String      // card, upi, cash, wallet
  
  // Amounts
  amount: Decimal
  fees: Decimal              // Payment gateway fees
  netAmount: Decimal
  
  // Payment Gateway
  gatewayName: String        // Razorpay, Stripe, Paytm
  gatewayTransactionId: String
  gatewayResponse: JSON
  
  // Status
  status: Enum               // pending, success, failed, refunded
  
  // Bank Details (for reconciliation)
  bankReference: String
  bankName: String
  
  // Metadata
  ipAddress: String
  metadata: JSON
  
  createdAt: DateTime
}
```

#### **6. InvoiceTemplate Model** (NEW)
```javascript
InvoiceTemplate {
  id: UUID
  name: String
  storeId: UUID              // Template per store
  
  // Template Details
  templateType: String       // retail, wholesale, tax_invoice
  isDefault: Boolean
  
  // Layout
  headerHtml: Text
  footerHtml: Text
  itemsTableHtml: Text
  
  // Styling
  logoUrl: String
  primaryColor: String
  accentColor: String
  fontFamily: String
  
  // Content
  terms: Text
  notes: Text
  thankYouMessage: Text
  
  // Settings
  showQRCode: Boolean
  showBarcode: Boolean
  showPaymentInstructions: Boolean
  
  createdAt: DateTime
  updatedAt: DateTime
}
```

---

## ⚙️ **Automated Workflows**

### **1. Order Creation Workflow**

```javascript
// Trigger: Customer places order (any channel)

async function processNewOrder(orderData) {
  // 1. Create Order
  const order = await Order.create({
    ...orderData,
    orderNumber: await generateOrderNumber(storeId),
    orderStatus: 'pending',
    paymentStatus: 'pending'
  });
  
  // 2. Create Order Items
  await OrderItem.bulkCreate(orderData.items.map(item => ({
    orderId: order.id,
    ...item,
    taxAmount: calculateTax(item.unitPrice, item.taxRate)
  })));
  
  // 3. Calculate Totals
  const totals = await calculateOrderTotals(order.id);
  await order.update(totals);
  
  // 4. Auto-generate Invoice (if payment successful)
  if (orderData.paymentStatus === 'paid') {
    await generateInvoice(order.id);
  }
  
  // 5. Send Notifications
  await sendOrderConfirmation(order.id);
  
  // 6. Update Customer Stats
  await updateCustomerStats(order.customerId);
  
  return order;
}
```

### **2. Invoice Generation Workflow**

```javascript
async function generateInvoice(orderId) {
  const order = await Order.findByPk(orderId, {
    include: [Customer, Store, OrderItem, Product]
  });
  
  // 1. Generate Invoice Number
  const invoiceNumber = await generateInvoiceNumber(
    order.storeId,
    order.orderDate
  );
  
  // 2. Calculate Tax Breakdown
  const taxBreakdown = calculateGSTBreakdown(
    order.OrderItems,
    order.Store.state,
    order.Customer.billingState
  );
  
  // 3. Create Invoice Record
  const invoice = await Invoice.create({
    invoiceNumber,
    orderId: order.id,
    customerId: order.customerId,
    storeId: order.storeId,
    invoiceDate: new Date(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    status: 'sent',
    ...taxBreakdown,
    subtotal: order.subtotal,
    totalAmount: order.totalAmount,
    paidAmount: order.paidAmount,
    balanceDue: order.totalAmount - order.paidAmount
  });
  
  // 4. Generate PDF
  const pdfPath = await generateInvoicePDF(invoice.id);
  await invoice.update({ 
    pdfPath, 
    pdfUrl: await uploadToS3(pdfPath) 
  });
  
  // 5. Update Order
  await order.update({
    invoiceNumber: invoice.invoiceNumber,
    invoiceGenerated: true,
    invoiceGeneratedAt: new Date()
  });
  
  // 6. Send Email
  await sendInvoiceEmail(invoice.id);
  
  // 7. Log Event
  await logInvoiceEvent(invoice.id, 'generated');
  
  return invoice;
}
```

### **3. Payment Processing Workflow**

```javascript
async function processPayment(orderId, paymentData) {
  const order = await Order.findByPk(orderId);
  
  // 1. Process Payment via Gateway
  const gatewayResponse = await paymentGateway.charge(paymentData);
  
  // 2. Create Transaction Record
  const transaction = await Transaction.create({
    transactionNumber: await generateTransactionNumber(),
    orderId: order.id,
    invoiceId: order.invoiceId,
    customerId: order.customerId,
    storeId: order.storeId,
    transactionType: 'payment',
    paymentMethod: paymentData.method,
    amount: paymentData.amount,
    status: gatewayResponse.status,
    gatewayName: paymentData.gateway,
    gatewayTransactionId: gatewayResponse.transactionId,
    gatewayResponse: gatewayResponse
  });
  
  // 3. Update Order Payment Status
  if (gatewayResponse.status === 'success') {
    await order.update({
      paymentStatus: 'paid',
      paidAmount: order.paidAmount + paymentData.amount
    });
    
    // 4. Generate Invoice if not already generated
    if (!order.invoiceGenerated) {
      await generateInvoice(order.id);
    } else {
      // Update existing invoice
      await Invoice.update({
        paidAmount: order.paidAmount,
        balanceDue: order.totalAmount - order.paidAmount,
        status: order.paidAmount >= order.totalAmount ? 'paid' : 'sent'
      }, {
        where: { orderId: order.id }
      });
    }
    
    // 5. Send Payment Confirmation
    await sendPaymentConfirmation(transaction.id);
  }
  
  return transaction;
}
```

---

## 🧮 **GST Calculation Engine**

```javascript
function calculateGSTBreakdown(orderItems, storeState, customerState) {
  const isInterState = storeState !== customerState;
  let subtotal = 0;
  let totalTax = 0;
  let cgst = 0;
  let sgst = 0;
  let igst = 0;
  
  const taxBreakdown = [];
  
  orderItems.forEach(item => {
    const itemTotal = item.unitPrice * item.quantity - item.discount;
    subtotal += itemTotal;
    
    const taxAmount = (itemTotal * item.taxRate) / 100;
    totalTax += taxAmount;
    
    if (isInterState) {
      // Inter-state: IGST
      igst += taxAmount;
      taxBreakdown.push({
        hsnCode: item.hsnCode,
        taxableAmount: itemTotal,
        igst: taxAmount,
        cgst: 0,
        sgst: 0
      });
    } else {
      // Intra-state: CGST + SGST
      const halfTax = taxAmount / 2;
      cgst += halfTax;
      sgst += halfTax;
      taxBreakdown.push({
        hsnCode: item.hsnCode,
        taxableAmount: itemTotal,
        cgst: halfTax,
        sgst: halfTax,
        igst: 0
      });
    }
  });
  
  return {
    subtotal,
    taxableAmount: subtotal,
    cgst,
    sgst,
    igst,
    totalTax,
    totalAmount: subtotal + totalTax,
    taxBreakdown: JSON.stringify(taxBreakdown),
    isInterState
  };
}
```

---

## 📄 **Invoice PDF Generation**

```javascript
const PDFDocument = require('pdfkit');

async function generateInvoicePDF(invoiceId) {
  const invoice = await Invoice.findByPk(invoiceId, {
    include: [Order, Customer, Store, { model: Order, include: [OrderItem] }]
  });
  
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  const fileName = `invoice-${invoice.invoiceNumber}.pdf`;
  const filePath = `invoices/${invoice.storeId}/${fileName}`;
  
  doc.pipe(fs.createWriteStream(filePath));
  
  // Header
  doc.fontSize(20).text(invoice.Store.name, 50, 50);
  doc.fontSize(10).text(invoice.Store.address);
  doc.text(`GSTIN: ${invoice.Store.gstNumber}`);
  
  // Invoice Details
  doc.fontSize(16).text('TAX INVOICE', 400, 50);
  doc.fontSize(10).text(`Invoice #: ${invoice.invoiceNumber}`, 400, 80);
  doc.text(`Date: ${invoice.invoiceDate.toLocaleDateString()}`);
  doc.text(`Due Date: ${invoice.dueDate.toLocaleDateString()}`);
  
  // Customer Details
  doc.fontSize(12).text('Bill To:', 50, 150);
  doc.fontSize(10).text(invoice.Customer.name);
  doc.text(invoice.Order.billingAddress.address);
  if (invoice.Customer.gstNumber) {
    doc.text(`GSTIN: ${invoice.Customer.gstNumber}`);
  }
  
  // Items Table
  const tableTop = 250;
  doc.fontSize(10);
  
  // Table Headers
  doc.text('Item', 50, tableTop);
  doc.text('HSN', 200, tableTop);
  doc.text('Qty', 300, tableTop);
  doc.text('Rate', 350, tableTop);
  doc.text('Tax', 400, tableTop);
  doc.text('Amount', 450, tableTop);
  
  // Items
  let y = tableTop + 20;
  invoice.Order.OrderItems.forEach(item => {
    doc.text(item.productName, 50, y);
    doc.text(item.hsnCode, 200, y);
    doc.text(item.quantity.toString(), 300, y);
    doc.text(`₹${item.unitPrice}`, 350, y);
    doc.text(`${item.taxRate}%`, 400, y);
    doc.text(`₹${item.totalPrice}`, 450, y);
    y += 20;
  });
  
  // Tax Summary
  y += 30;
  doc.text('Subtotal:', 350, y);
  doc.text(`₹${invoice.subtotal}`, 450, y);
  
  if (invoice.isInterState) {
    y += 20;
    doc.text('IGST:', 350, y);
    doc.text(`₹${invoice.igst}`, 450, y);
  } else {
    y += 20;
    doc.text('CGST:', 350, y);
    doc.text(`₹${invoice.cgst}`, 450, y);
    y += 20;
    doc.text('SGST:', 350, y);
    doc.text(`₹${invoice.sgst}`, 450, y);
  }
  
  y += 20;
  doc.fontSize(12).text('Total:', 350, y);
  doc.text(`₹${invoice.totalAmount}`, 450, y);
  
  // Footer
  doc.fontSize(8).text('Terms & Conditions apply', 50, 750);
  doc.text('This is a computer-generated invoice', 50, 760);
  
  doc.end();
  
  return filePath;
}
```

---

## 📧 **Email Automation**

```javascript
async function sendInvoiceEmail(invoiceId) {
  const invoice = await Invoice.findByPk(invoiceId, {
    include: [Customer, Store, Order]
  });
  
  const emailData = {
    to: invoice.Customer.email,
    from: invoice.Store.email,
    subject: `Invoice ${invoice.invoiceNumber} from ${invoice.Store.name}`,
    html: `
      <h2>Thank you for your order!</h2>
      <p>Dear ${invoice.Customer.name},</p>
      <p>Your invoice for order #${invoice.Order.orderNumber} is attached.</p>
      <p><strong>Invoice #:</strong> ${invoice.invoiceNumber}</p>
      <p><strong>Amount:</strong> ₹${invoice.totalAmount}</p>
      <p><strong>Due Date:</strong> ${invoice.dueDate.toLocaleDateString()}</p>
      <p>You can also view and download your invoice from your account dashboard.</p>
      <p>Thank you for shopping with ${invoice.Store.name}!</p>
    `,
    attachments: [
      {
        filename: `invoice-${invoice.invoiceNumber}.pdf`,
        path: invoice.pdfPath
      }
    ]
  };
  
  await emailService.send(emailData);
  
  await invoice.update({
    emailSent: true,
    emailSentAt: new Date()
  });
}
```

---

## 🔄 **Auto-Number Generation**

```javascript
// Order Number: FV-{store-code}-{date}-{seq}
async function generateOrderNumber(storeId) {
  const store = await Store.findByPk(storeId);
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  
  const lastOrder = await Order.findOne({
    where: {
      storeId,
      orderNumber: { [Op.like]: `FV-${store.cityCode}-${date}-%` }
    },
    order: [['createdAt', 'DESC']]
  });
  
  let seq = 1;
  if (lastOrder) {
    const lastSeq = parseInt(lastOrder.orderNumber.split('-').pop());
    seq = lastSeq + 1;
  }
  
  return `FV-${store.cityCode}-${date}-${seq.toString().padStart(4, '0')}`;
}

// Invoice Number: INV-{FY}-{store}-{seq}
async function generateInvoiceNumber(storeId, orderDate) {
  const store = await Store.findByPk(storeId);
  const year = orderDate.getFullYear();
  const month = orderDate.getMonth();
  const fy = month >= 3 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
  
  const lastInvoice = await Invoice.findOne({
    where: {
      storeId,
      financialYear: fy
    },
    order: [['createdAt', 'DESC']]
  });
  
  let seq = 1;
  if (lastInvoice) {
    const lastSeq = parseInt(lastInvoice.invoiceNumber.split('-').pop());
    seq = lastSeq + 1;
  }
  
  return `INV-${fy}-${store.cityCode}-${seq.toString().padStart(5, '0')}`;
}

// Customer ID: FV-CUST-{city}-{number}
async function generateCustomerId(city) {
  const cityCode = await getCityCode(city);
  
  const lastCustomer = await Customer.findOne({
    where: {
      customerId: { [Op.like]: `FV-CUST-${cityCode}-%` }
    },
    order: [['createdAt', 'DESC']]
  });
  
  let seq = 1;
  if (lastCustomer) {
    const lastSeq = parseInt(lastCustomer.customerId.split('-').pop());
    seq = lastSeq + 1;
  }
  
  return `FV-CUST-${cityCode}-${seq.toString().padStart(6, '0')}`;
}
```

---

## 📱 **Customer Portal Features**

### **Customer Dashboard API**
```javascript
// GET /api/customer/dashboard
async function getCustomerDashboard(customerId) {
  const customer = await Customer.findByPk(customerId);
  
  const [orders, invoices, transactions] = await Promise.all([
    Order.findAll({
      where: { customerId },
      order: [['orderDate', 'DESC']],
      limit: 10
    }),
    Invoice.findAll({
      where: { customerId },
      order: [['invoiceDate', 'DESC']],
      limit: 10
    }),
    Transaction.findAll({
      where: { customerId },
      order: [['transactionDate', 'DESC']],
      limit: 10
    })
  ]);
  
  return {
    customer: {
      name: customer.name,
      customerId: customer.customerId,
      membershipTier: customer.membershipTier,
      loyaltyPoints: customer.loyaltyPoints
    },
    stats: {
      totalOrders: customer.totalOrders,
      totalSpent: customer.totalSpent,
      averageOrderValue: customer.averageOrderValue
    },
    recentOrders: orders,
    recentInvoices: invoices,
    recentTransactions: transactions
  };
}
```

---

## 🎯 **Key Features Summary**

### **Automated**
✅ Auto-generate order numbers  
✅ Auto-generate invoice numbers  
✅ Auto-calculate GST (CGST/SGST/IGST)  
✅ Auto-generate PDF invoices  
✅ Auto-send email notifications  
✅ Auto-update customer stats  

### **Multi-Channel**
✅ Website orders  
✅ Mobile app orders  
✅ Store POS orders  
✅ Unified processing  

### **Compliance**
✅ GST-compliant invoices  
✅ HSN code tracking  
✅ Financial year management  
✅ Tax breakdowns  

### **Customer Experience**
✅ Customer portal  
✅ View orders & invoices  
✅ Download PDFs  
✅ Payment tracking  
✅ Loyalty points  

---

## 🚀 **Implementation Priority**

1. **Phase 1: Core Models** (Week 1)
   - Enhanced Customer, Order, Invoice models
   - Transaction model
   - Database migrations

2. **Phase 2: Auto-Number Generation** (Week 1)
   - Order number generator
   - Invoice number generator
   - Customer ID generator

3. **Phase 3: Order Processing** (Week 2)
   - Order creation workflow
   - Automated invoice generation
   - Email notifications

4. **Phase 4: GST Engine** (Week 2)
   - Tax calculation logic
   - CGST/SGST/IGST handling
   - Inter-state detection

5. **Phase 5: PDF Generation** (Week 3)
   - Invoice template system
   - PDF rendering
   - S3 storage integration

6. **Phase 6: Customer Portal** (Week 3)
   - Dashboard API
   - Order history
   - Invoice downloads

7. **Phase 7: Payment Integration** (Week 4)
   - Payment gateway integration
   - Transaction tracking
   - Refund handling

---

**Total Implementation Time:** ~4 weeks  
**Backend Architecture:** Production-ready, scalable, automated  
**Inspired by:** InvoicePlane best practices  
**Built for:** FreshVilla multi-store ecosystem
