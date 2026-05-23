import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// WhatsApp Business API configuration
const WHATSAPP_CONFIG = {
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
  apiVersion: 'v21.0',
  baseUrl: 'https://graph.facebook.com'
};

/**
 * Get WhatsApp API URL
 */
const getApiUrl = () => {
  return `${WHATSAPP_CONFIG.baseUrl}/${WHATSAPP_CONFIG.apiVersion}/${WHATSAPP_CONFIG.phoneNumberId}/messages`;
};

/**
 * Format phone number for WhatsApp (remove spaces, dashes, and add country code if needed)
 */
const formatPhoneNumber = (phone) => {
  // Remove all non-numeric characters
  let cleaned = phone.replace(/\D/g, '');
  
  // Add country code if not present (assuming South Africa +27)
  if (!cleaned.startsWith('27') && cleaned.length === 10) {
    cleaned = '27' + cleaned.substring(1); // Remove leading 0 and add 27
  }
  
  return cleaned;
};

/**
 * Send WhatsApp message
 */
export const sendMessage = async (to, message) => {
  try {
    const formattedPhone = formatPhoneNumber(to);
    
    const response = await axios.post(
      getApiUrl(),
      {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: formattedPhone,
        type: 'text',
        text: {
          preview_url: false,
          body: message
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${WHATSAPP_CONFIG.accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      success: true,
      messageId: response.data.messages[0].id,
      data: response.data
    };
  } catch (error) {
    console.error('WhatsApp send error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message
    };
  }
};

/**
 * Send booking confirmation message
 */
export const sendBookingConfirmation = async (bookingData) => {
  const { userName, userPhone, serviceName, bookingDate, bookingTime, amount, bookingId } = bookingData;

  const message = `🎉 *Booking Confirmed!*

Hello ${userName}!

Your booking has been confirmed:

📋 *Service:* ${serviceName}
📅 *Date:* ${bookingDate}
🕐 *Time:* ${bookingTime}
💰 *Amount:* R${amount}
🔖 *Booking ID:* ${bookingId}

Thank you for choosing our service! We look forward to serving you.

If you have any questions, please don't hesitate to contact us.`;

  return await sendMessage(userPhone, message);
};

/**
 * Send payment confirmation message
 */
export const sendPaymentConfirmation = async (bookingData) => {
  const { userName, userPhone, serviceName, amount, transactionId, bookingId } = bookingData;

  const message = `✅ *Payment Received!*

Hello ${userName}!

Your payment has been successfully processed:

💳 *Transaction ID:* ${transactionId}
💰 *Amount Paid:* R${amount}
📋 *Service:* ${serviceName}
🔖 *Booking ID:* ${bookingId}

Your booking is now fully confirmed. We'll see you soon!

Thank you for your payment.`;

  return await sendMessage(userPhone, message);
};

/**
 * Send booking reminder message
 */
export const sendBookingReminder = async (bookingData) => {
  const { userName, userPhone, serviceName, bookingDate, bookingTime, bookingId } = bookingData;

  const message = `⏰ *Booking Reminder*

Hello ${userName}!

This is a friendly reminder about your upcoming booking:

📋 *Service:* ${serviceName}
📅 *Date:* ${bookingDate}
🕐 *Time:* ${bookingTime}
🔖 *Booking ID:* ${bookingId}

We look forward to seeing you!

Please arrive 5-10 minutes early.`;

  return await sendMessage(userPhone, message);
};

/**
 * Send booking cancellation message
 */
export const sendBookingCancellation = async (bookingData) => {
  const { userName, userPhone, serviceName, bookingDate, bookingId, reason } = bookingData;

  const message = `❌ *Booking Cancelled*

Hello ${userName},

Your booking has been cancelled:

📋 *Service:* ${serviceName}
📅 *Date:* ${bookingDate}
🔖 *Booking ID:* ${bookingId}
${reason ? `\n📝 *Reason:* ${reason}` : ''}

If you'd like to reschedule, please contact us or make a new booking.

Thank you for your understanding.`;

  return await sendMessage(userPhone, message);
};

/**
 * Send payment link message
 */
export const sendPaymentLink = async (bookingData) => {
  const { userName, userPhone, serviceName, amount, paymentUrl, bookingId } = bookingData;

  const message = `💳 *Payment Required*

Hello ${userName}!

Please complete your payment to confirm your booking:

📋 *Service:* ${serviceName}
💰 *Amount:* R${amount}
🔖 *Booking ID:* ${bookingId}

🔗 *Payment Link:*
${paymentUrl}

Click the link above to make your payment securely via PayFast.

Your booking will be confirmed once payment is received.`;

  return await sendMessage(userPhone, message);
};

/**
 * Send custom message
 */
export const sendCustomMessage = async (to, messageText) => {
  return await sendMessage(to, messageText);
};

/**
 * Verify webhook signature (for incoming messages)
 */
export const verifyWebhook = (mode, token, verifyToken) => {
  if (mode === 'subscribe' && token === verifyToken) {
    return true;
  }
  return false;
};

/**
 * Parse incoming WhatsApp webhook message
 */
export const parseIncomingMessage = (webhookData) => {
  try {
    const entry = webhookData.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];

    if (!message) {
      return null;
    }

    return {
      from: message.from,
      messageId: message.id,
      timestamp: message.timestamp,
      type: message.type,
      text: message.text?.body,
      name: value.contacts?.[0]?.profile?.name
    };
  } catch (error) {
    console.error('Error parsing WhatsApp message:', error);
    return null;
  }
};

export default {
  sendMessage,
  sendBookingConfirmation,
  sendPaymentConfirmation,
  sendBookingReminder,
  sendBookingCancellation,
  sendPaymentLink,
  sendCustomMessage,
  verifyWebhook,
  parseIncomingMessage
};

// Made with Bob
