// WhatsApp Integration Utility
// Configure your WhatsApp Business number here

const WHATSAPP_NUMBER = '917009214355'; // FreshVilla WhatsApp Business Number

/**
 * Format cart items into WhatsApp message
 */
export const formatOrderMessage = (cartItems, customerInfo = {}) => {
  let message = `🛒 *New Order from FreshVilla*\n\n`;
  
  // Add customer info if provided
  if (customerInfo.name) {
    message += `👤 *Customer:* ${customerInfo.name}\n`;
  }
  if (customerInfo.phone) {
    message += `📱 *Phone:* ${customerInfo.phone}\n`;
  }
  if (customerInfo.email) {
    message += `📧 *Email:* ${customerInfo.email}\n`;
  }
  if (customerInfo.address) {
    message += `📍 *Address:* ${customerInfo.address}\n`;
  }
  if (customerInfo.notes) {
    message += `📝 *Notes:* ${customerInfo.notes}\n`;
  }
  
  message += `\n*Order Items:*\n`;
  message += `━━━━━━━━━━━━━━━━\n`;
  
  let total = 0;
  
  cartItems.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    message += `${index + 1}. ${item.name}\n`;
    message += `   Qty: ${item.quantity} × ₹${item.price} = ₹${itemTotal}\n\n`;
  });
  
  message += `━━━━━━━━━━━━━━━━\n`;
  message += `💰 *Total Amount:* ₹${total}\n\n`;
  message += `📦 _Order placed via FreshVilla Store_\n`;
  message += `🌐 https://bhupesh-moudgil.github.io/freshvilla-store/`;
  
  return encodeURIComponent(message);
};

/**
 * Open WhatsApp with pre-filled order message
 */
export const sendOrderToWhatsApp = (cartItems, customerInfo = {}) => {
  const message = formatOrderMessage(cartItems, customerInfo);
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
  
  // Open in new window
  window.open(whatsappUrl, '_blank');
};

/**
 * Get WhatsApp chat link (without message)
 */
export const getWhatsAppChatLink = () => {
  return `https://wa.me/${WHATSAPP_NUMBER}`;
};

/**
 * Open WhatsApp chat
 */
export const openWhatsAppChat = () => {
  window.open(getWhatsAppChatLink(), '_blank');
};

export default {
  sendOrderToWhatsApp,
  openWhatsAppChat,
  getWhatsAppChatLink,
  formatOrderMessage,
  WHATSAPP_NUMBER
};
