import express from 'express';
import { validateIPN } from '../services/payfast.js';
import { verifyWebhook, parseIncomingMessage } from '../services/whatsapp.js';
import { 
  getBookingById, 
  updateBooking,
  getUserById 
} from '../services/supabase.js';
import { 
  sendPaymentConfirmation,
  sendBookingConfirmation 
} from '../services/whatsapp.js';

const router = express.Router();

/**
 * GET /api/webhook/whatsapp
 * WhatsApp webhook verification endpoint
 */
router.get('/whatsapp', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

  if (verifyWebhook(mode, token, verifyToken)) {
    console.log('✅ WhatsApp webhook verified');
    res.status(200).send(challenge);
  } else {
    console.error('❌ WhatsApp webhook verification failed');
    res.status(403).json({ error: 'Verification failed' });
  }
});

/**
 * POST /api/webhook/whatsapp
 * WhatsApp incoming message webhook
 */
router.post('/whatsapp', async (req, res) => {
  try {
    // Acknowledge receipt immediately
    res.status(200).send('EVENT_RECEIVED');

    const message = parseIncomingMessage(req.body);
    
    if (!message) {
      console.log('No message to process');
      return;
    }

    console.log('📱 WhatsApp message received:', {
      from: message.from,
      type: message.type,
      text: message.text
    });

    // Process message asynchronously
    // You can add custom logic here to handle incoming messages
    // For example: booking inquiries, status checks, etc.
    
  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    // Don't send error response as we already sent 200
  }
});

/**
 * POST /api/webhook/payfast
 * PayFast IPN (Instant Payment Notification) webhook
 */
router.post('/payfast', async (req, res) => {
  try {
    console.log('💳 PayFast IPN received:', req.body);

    // Validate the IPN
    const validation = await validateIPN(req.body);

    if (!validation.valid) {
      console.error('❌ Invalid PayFast IPN:', validation.error);
      return res.status(400).json({ error: validation.error });
    }

    const { 
      bookingId, 
      paymentStatus, 
      amount, 
      transactionId 
    } = validation;

    console.log('✅ Valid PayFast IPN:', {
      bookingId,
      paymentStatus,
      amount,
      transactionId
    });

    // Get booking details
    const booking = await getBookingById(bookingId);

    if (!booking) {
      console.error('❌ Booking not found:', bookingId);
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Update booking based on payment status
    if (paymentStatus === 'COMPLETE') {
      // Update booking to paid
      await updateBooking(bookingId, {
        payment_status: 'paid',
        status: 'confirmed',
        transaction_id: transactionId,
        updated_at: new Date().toISOString()
      });

      console.log('✅ Booking payment confirmed:', bookingId);

      // Send payment confirmation via WhatsApp
      await sendPaymentConfirmation({
        userName: booking.user.name,
        userPhone: booking.user.phone,
        serviceName: booking.service.name,
        amount: booking.amount,
        transactionId: transactionId,
        bookingId: booking.id
      });

      // Send booking confirmation
      await sendBookingConfirmation({
        userName: booking.user.name,
        userPhone: booking.user.phone,
        serviceName: booking.service.name,
        bookingDate: booking.booking_date,
        bookingTime: booking.booking_time,
        amount: booking.amount,
        bookingId: booking.id
      });

    } else if (paymentStatus === 'PENDING') {
      // Update to pending payment
      await updateBooking(bookingId, {
        payment_status: 'pending',
        transaction_id: transactionId,
        updated_at: new Date().toISOString()
      });

      console.log('⏳ Booking payment pending:', bookingId);

    } else {
      // Payment failed or cancelled
      await updateBooking(bookingId, {
        payment_status: 'failed',
        status: 'cancelled',
        transaction_id: transactionId,
        updated_at: new Date().toISOString()
      });

      console.log('❌ Booking payment failed:', bookingId);
    }

    res.status(200).json({ 
      success: true,
      message: 'IPN processed successfully' 
    });

  } catch (error) {
    console.error('PayFast webhook error:', error);
    res.status(500).json({ 
      error: 'Failed to process payment notification' 
    });
  }
});

/**
 * GET /api/webhook/payfast/test
 * Test endpoint to verify PayFast webhook is accessible
 */
router.get('/payfast/test', (req, res) => {
  res.json({
    status: 'ok',
    message: 'PayFast webhook endpoint is accessible',
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /api/webhook/whatsapp/test
 * Test endpoint to verify WhatsApp webhook is accessible
 */
router.get('/whatsapp/test', (req, res) => {
  res.json({
    status: 'ok',
    message: 'WhatsApp webhook endpoint is accessible',
    timestamp: new Date().toISOString()
  });
});

export default router;

// Made with Bob