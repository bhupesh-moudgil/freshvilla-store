# WhatsApp Integration Setup Guide

## Overview
Your FreshVilla store now includes WhatsApp integration for order management. Customers can browse products and send orders directly to your WhatsApp Business number.

## How It Works

1. **Customer browses** products on your GitHub Pages site
2. **Adds items** to cart
3. **Clicks "Order via WhatsApp"** or the floating WhatsApp button
4. **WhatsApp opens** with pre-filled order details
5. **Customer sends** the message to your business number
6. **You receive** the order on WhatsApp and can respond

## Setup Instructions

### Step 1: Configure Your WhatsApp Number

Edit the file: `src/utils/whatsapp.js`

```javascript
const WHATSAPP_NUMBER = '919876543210'; // Replace with YOUR number
```

**Format:** Country code + number (no + or spaces)
- India: `919876543210`
- USA: `14155552671`
- UK: `447911123456`

### Step 2: Get a WhatsApp Business Number

**Option A: WhatsApp Business App** (Free, Simple)
1. Download WhatsApp Business app
2. Register your business number
3. Set up business profile
4. Use this number in the code

**Option B: WhatsApp Business API via Receevi** (Advanced, Recommended)
1. Go to https://receevi.com/
2. Sign up for free account
3. Connect to WhatsApp Cloud API
4. Get your business number
5. Configure webhooks for automated responses

### Step 3: Test the Integration

1. Visit your site: https://bhupesh-moudgil.github.io/freshvilla-store/
2. Add products to cart
3. Click the floating WhatsApp button (bottom-right)
4. Verify WhatsApp opens with your number

## Features Included

### 1. Floating WhatsApp Button
- Always visible on all pages
- Animated pulse effect
- Opens direct chat with your business

### 2. Order via WhatsApp
- Formats cart items nicely
- Includes product names, quantities, prices
- Calculates total automatically
- Adds customer info if provided

### 3. Message Format Example
```
🛒 *New Order from FreshVilla*

👤 *Customer:* John Doe
📱 *Phone:* +919876543210
📍 *Address:* 123 Main St, Mumbai

*Order Items:*
━━━━━━━━━━━━━━━━
1. Fresh Tomatoes
   Qty: 2 × ₹50 = ₹100

2. Organic Milk
   Qty: 1 × ₹60 = ₹60

━━━━━━━━━━━━━━━━
💰 *Total Amount:* ₹160

📦 _Order placed via FreshVilla Store_
🌐 https://bhupesh-moudgil.github.io/freshvilla-store/
```

## Managing Orders with Receevi

### Why Use Receevi?

1. **Automated Responses** - Send instant replies to customers
2. **Order Management** - Track all orders in one dashboard
3. **Bulk Messaging** - Send promotions to all customers
4. **Custom Bots** - Automate common queries
5. **Analytics** - See order statistics

### Receevi Setup

1. **Create Account**
   - Go to https://receevi.com/
   - Sign up (free tier available)

2. **Connect WhatsApp**
   - Follow their guide to connect WhatsApp Cloud API
   - Verify your business number

3. **Set Up Webhook**
   - Configure webhook to receive messages
   - Auto-respond to new orders

4. **Create Bot Responses**
   - "Thank you for your order!"
   - "We'll confirm in 5 minutes"
   - Payment instructions
   - Delivery updates

## Future Enhancements

When you deploy on GCP with Rocky Linux, you can integrate:

- **Full backend API** to store orders in database
- **Admin dashboard** to manage orders
- **Automated order confirmation** emails
- **Payment gateway** integration (Razorpay, Stripe)
- **Inventory management**
- **Customer accounts** with order history

## Current Limitations

- Orders not stored (WhatsApp only)
- No payment processing
- Manual order confirmation required
- No inventory tracking
- Customer must have WhatsApp installed

## Support

For WhatsApp Business API help:
- Receevi Documentation: https://receevi.com/docs
- WhatsApp Business API: https://developers.facebook.com/docs/whatsapp

---

**Note:** This is a simple catalog + WhatsApp solution perfect for testing and small businesses. For enterprise features, proceed with the GCP backend implementation as planned.
