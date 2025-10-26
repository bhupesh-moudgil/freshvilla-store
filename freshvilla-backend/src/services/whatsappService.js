const axios = require('axios');
const crypto = require('crypto');

// wppconnect-server configuration
const WPPCONNECT_URL = process.env.WPPCONNECT_URL || 'http://localhost:21465';
const WPPCONNECT_SESSION = process.env.WPPCONNECT_SESSION || 'freshvilla';
const WPPCONNECT_TOKEN = process.env.WPPCONNECT_TOKEN || '';

// Rate limiting state (in-memory, use Redis in production)
const messageQueue = [];
const rateLimits = {
  verification: {
    hourly: 0,
    daily: 0,
    lastHourReset: Date.now(),
    lastDayReset: Date.now(),
  },
  notifications: {
    hourly: 0,
    daily: 0,
    lastHourReset: Date.now(),
    lastDayReset: Date.now(),
  }
};

// Message templates for verification (randomized to avoid patterns)
const verificationTemplates = [
  'Hi {name}! 👋 Verify your mobile for FreshVilla order updates: {link}',
  'Hello {name}! Click to confirm your number for delivery notifications: {link}',
  'Hey {name}! Complete your FreshVilla profile: {link} 📱',
  '{name}, verify your mobile to receive order updates: {link}',
  'Welcome {name}! Confirm your number to stay updated on orders: {link}',
  'Hi {name}! 🛒 Activate order notifications: {link}',
];

/**
 * Reset rate limits hourly and daily
 */
function checkAndResetRateLimits() {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  const oneDay = 24 * 60 * 60 * 1000;

  // Reset hourly limits
  if (now - rateLimits.verification.lastHourReset > oneHour) {
    rateLimits.verification.hourly = 0;
    rateLimits.verification.lastHourReset = now;
  }
  if (now - rateLimits.notifications.lastHourReset > oneHour) {
    rateLimits.notifications.hourly = 0;
    rateLimits.notifications.lastHourReset = now;
  }

  // Reset daily limits
  if (now - rateLimits.verification.lastDayReset > oneDay) {
    rateLimits.verification.daily = 0;
    rateLimits.verification.lastDayReset = now;
  }
  if (now - rateLimits.notifications.lastDayReset > oneDay) {
    rateLimits.notifications.daily = 0;
    rateLimits.notifications.lastDayReset = now;
  }
}

/**
 * Check if rate limit is exceeded
 */
function checkRateLimit(type = 'verification') {
  checkAndResetRateLimits();

  const limits = {
    verification: { hourly: 10, daily: 100 },
    notifications: { hourly: 50, daily: 500 }
  };

  const current = rateLimits[type];
  const max = limits[type];

  return {
    allowed: current.hourly < max.hourly && current.daily < max.daily,
    hourly: { current: current.hourly, max: max.hourly },
    daily: { current: current.daily, max: max.daily }
  };
}

/**
 * Increment rate limit counter
 */
function incrementRateLimit(type = 'verification') {
  rateLimits[type].hourly++;
  rateLimits[type].daily++;
}

/**
 * Check wppconnect session status
 */
async function checkSessionStatus() {
  try {
    const response = await axios.get(
      `${WPPCONNECT_URL}/api/${WPPCONNECT_SESSION}/status-session`,
      {
        headers: {
          'Authorization': `Bearer ${WPPCONNECT_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return {
      connected: response.data?.connected || false,
      status: response.data?.state || 'DISCONNECTED'
    };
  } catch (error) {
    console.error('Failed to check WhatsApp session status:', error.message);
    return { connected: false, status: 'ERROR' };
  }
}

/**
 * Send WhatsApp message via wppconnect-server
 */
async function sendWhatsAppMessage(phone, message) {
  try {
    // Check session before sending
    const sessionStatus = await checkSessionStatus();
    if (!sessionStatus.connected) {
      throw new Error('WhatsApp session not connected. Please scan QR code.');
    }

    // Format phone number (remove + and spaces, add country code if missing)
    let formattedPhone = phone.replace(/\D/g, '');
    if (!formattedPhone.startsWith('91') && formattedPhone.length === 10) {
      formattedPhone = '91' + formattedPhone; // Add India country code
    }

    const response = await axios.post(
      `${WPPCONNECT_URL}/api/${WPPCONNECT_SESSION}/send-message`,
      {
        phone: formattedPhone,
        message: message,
        isGroup: false
      },
      {
        headers: {
          'Authorization': `Bearer ${WPPCONNECT_TOKEN}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 seconds timeout
      }
    );

    return {
      success: true,
      messageId: response.data?.id || null,
      data: response.data
    };
  } catch (error) {
    console.error('Failed to send WhatsApp message:', error.message);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
}

/**
 * Send mobile verification link via WhatsApp
 */
async function sendMobileVerification(customerName, mobile, verificationToken) {
  // Check rate limits
  const rateCheck = checkRateLimit('verification');
  if (!rateCheck.allowed) {
    throw new Error(
      `Rate limit exceeded. Hourly: ${rateCheck.hourly.current}/${rateCheck.hourly.max}, ` +
      `Daily: ${rateCheck.daily.current}/${rateCheck.daily.max}`
    );
  }

  // Generate verification URL
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-mobile?token=${verificationToken}`;

  // Select random template
  const template = verificationTemplates[Math.floor(Math.random() * verificationTemplates.length)];
  
  // Replace placeholders
  const message = template
    .replace('{name}', customerName)
    .replace('{link}', verificationUrl);

  // Add random delay (30-90 seconds) to appear human-like
  const delay = Math.floor(Math.random() * 60000) + 30000; // 30-90 seconds
  console.log(`Scheduling verification message to ${mobile} in ${delay/1000} seconds`);

  // Wait before sending (anti-spam measure)
  await new Promise(resolve => setTimeout(resolve, delay));

  // Send message
  const result = await sendWhatsAppMessage(mobile, message);

  if (result.success) {
    // Increment rate limit
    incrementRateLimit('verification');
    console.log(`✅ Verification message sent to ${mobile}`);
  } else {
    console.error(`❌ Failed to send verification to ${mobile}:`, result.error);
  }

  return result;
}

/**
 * Send order notification via WhatsApp
 */
async function sendOrderNotification(customerName, mobile, orderData) {
  // Check rate limits
  const rateCheck = checkRateLimit('notifications');
  if (!rateCheck.allowed) {
    console.warn(`Rate limit exceeded for notifications. Message queued.`);
    // In production, queue this for later
    return { success: false, error: 'Rate limit exceeded, message queued' };
  }

  const { orderId, status, total } = orderData;

  const statusMessages = {
    'confirmed': `🛒 Order #${orderId} confirmed!\nTotal: ₹${total}\n\nYour order will be packed soon. Track: ${process.env.FRONTEND_URL}/orders/${orderId}`,
    'packed': `📦 Order #${orderId} is being packed!\n\nYour order will be out for delivery soon.`,
    'shipped': `🚚 Order #${orderId} is out for delivery!\n\nYour order will arrive today. Please keep your phone handy.`,
    'delivered': `✅ Order #${orderId} delivered!\n\nThank you for shopping with FreshVilla! 🎉\n\nRate your experience: ${process.env.FRONTEND_URL}/orders/${orderId}/review`
  };

  const message = `Hi ${customerName}! 👋\n\n${statusMessages[status] || 'Order status updated.'}`;

  // Send message
  const result = await sendWhatsAppMessage(mobile, message);

  if (result.success) {
    incrementRateLimit('notifications');
    console.log(`✅ Order notification sent to ${mobile}`);
  }

  return result;
}

/**
 * Get current rate limit status
 */
function getRateLimitStatus() {
  checkAndResetRateLimits();
  return {
    verification: {
      hourly: rateLimits.verification.hourly,
      daily: rateLimits.verification.daily,
      limits: { hourly: 10, daily: 100 }
    },
    notifications: {
      hourly: rateLimits.notifications.hourly,
      daily: rateLimits.notifications.daily,
      limits: { hourly: 50, daily: 500 }
    }
  };
}

module.exports = {
  checkSessionStatus,
  sendWhatsAppMessage,
  sendMobileVerification,
  sendOrderNotification,
  getRateLimitStatus,
  checkRateLimit
};
