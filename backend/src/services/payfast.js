import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

// PayFast configuration
const PAYFAST_CONFIG = {
  merchantId: process.env.PAYFAST_MERCHANT_ID,
  merchantKey: process.env.PAYFAST_MERCHANT_KEY,
  passphrase: process.env.PAYFAST_PASSPHRASE,
  sandbox: process.env.PAYFAST_SANDBOX === 'true',
  baseUrl: process.env.PAYFAST_SANDBOX === 'true' 
    ? 'https://sandbox.payfast.co.za/eng/process'
    : 'https://www.payfast.co.za/eng/process'
};

/**
 * Generate MD5 signature for PayFast
 */
const generateSignature = (data, passphrase = null) => {
  // Create parameter string
  let pfOutput = '';
  for (let key in data) {
    if (data.hasOwnProperty(key)) {
      if (data[key] !== '') {
        pfOutput += `${key}=${encodeURIComponent(data[key].toString().trim()).replace(/%20/g, '+')}&`;
      }
    }
  }

  // Remove last ampersand
  let getString = pfOutput.slice(0, -1);
  
  // Add passphrase if provided
  if (passphrase !== null) {
    getString += `&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, '+')}`;
  }

  // Generate MD5 hash
  return crypto.createHash('md5').update(getString).digest('hex');
};

/**
 * Create PayFast payment data
 */
export const createPaymentData = (bookingData) => {
  const {
    bookingId,
    amount,
    itemName,
    itemDescription,
    userEmail,
    userName,
    userPhone
  } = bookingData;

  // Validate required fields
  if (!bookingId || !amount || !itemName || !userEmail) {
    throw new Error('Missing required payment data fields');
  }

  // Build payment data object
  const paymentData = {
    // Merchant details
    merchant_id: PAYFAST_CONFIG.merchantId,
    merchant_key: PAYFAST_CONFIG.merchantKey,
    
    // Transaction details
    amount: parseFloat(amount).toFixed(2),
    item_name: itemName,
    item_description: itemDescription || itemName,
    
    // Custom fields
    custom_str1: bookingId, // Booking ID for reference
    custom_str2: 'booking', // Transaction type
    
    // Buyer details
    email_address: userEmail,
    ...(userName && { name_first: userName.split(' ')[0] }),
    ...(userName && userName.split(' ').length > 1 && { name_last: userName.split(' ').slice(1).join(' ') }),
    ...(userPhone && { cell_number: userPhone }),
    
    // URLs
    return_url: `${process.env.FRONTEND_URL}/booking/success`,
    cancel_url: `${process.env.FRONTEND_URL}/booking/cancel`,
    notify_url: `${process.env.WEBHOOK_BASE_URL}/api/webhook/payfast`,
    
    // Email confirmation
    email_confirmation: 1,
    confirmation_address: userEmail
  };

  // Generate signature
  paymentData.signature = generateSignature(paymentData, PAYFAST_CONFIG.passphrase);

  return paymentData;
};

/**
 * Generate PayFast payment URL
 */
export const generatePaymentUrl = (paymentData) => {
  const params = new URLSearchParams(paymentData);
  return `${PAYFAST_CONFIG.baseUrl}?${params.toString()}`;
};

/**
 * Create complete payment link
 */
export const createPaymentLink = (bookingData) => {
  try {
    const paymentData = createPaymentData(bookingData);
    const paymentUrl = generatePaymentUrl(paymentData);
    
    return {
      success: true,
      paymentUrl,
      paymentData
    };
  } catch (error) {
    console.error('Error creating payment link:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Verify PayFast webhook signature
 */
export const verifyWebhookSignature = (postData, signature) => {
  // Remove signature from data
  const data = { ...postData };
  delete data.signature;

  // Generate signature
  const generatedSignature = generateSignature(data, PAYFAST_CONFIG.passphrase);

  return generatedSignature === signature;
};

/**
 * Validate PayFast IPN (Instant Payment Notification)
 */
export const validateIPN = async (postData) => {
  try {
    // Verify signature
    if (!verifyWebhookSignature(postData, postData.signature)) {
      return {
        valid: false,
        error: 'Invalid signature'
      };
    }

    // Verify payment status
    const paymentStatus = postData.payment_status;
    const validStatuses = ['COMPLETE', 'PENDING'];
    
    if (!validStatuses.includes(paymentStatus)) {
      return {
        valid: false,
        error: `Invalid payment status: ${paymentStatus}`
      };
    }

    // Extract booking information
    const bookingId = postData.custom_str1;
    const transactionType = postData.custom_str2;
    const amount = parseFloat(postData.amount_gross);

    return {
      valid: true,
      bookingId,
      transactionType,
      amount,
      paymentStatus,
      transactionId: postData.pf_payment_id,
      data: postData
    };
  } catch (error) {
    console.error('Error validating IPN:', error);
    return {
      valid: false,
      error: error.message
    };
  }
};

/**
 * Get payment status description
 */
export const getPaymentStatusDescription = (status) => {
  const statusMap = {
    'COMPLETE': 'Payment completed successfully',
    'PENDING': 'Payment is pending',
    'FAILED': 'Payment failed',
    'CANCELLED': 'Payment was cancelled'
  };

  return statusMap[status] || 'Unknown payment status';
};

export default {
  createPaymentData,
  generatePaymentUrl,
  createPaymentLink,
  verifyWebhookSignature,
  validateIPN,
  getPaymentStatusDescription
};

// Made with Bob
