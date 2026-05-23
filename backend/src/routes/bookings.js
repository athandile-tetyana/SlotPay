import express from 'express';
import { verifyToken } from './auth.js';
import {
  createBooking,
  getBookingById,
  updateBooking,
  getUserBookings,
  getServiceById
} from '../services/supabase.js';
import { createPaymentLink } from '../services/payfast.js';
import { sendBookingConfirmation, sendPaymentLink } from '../services/whatsapp.js';

const router = express.Router();

/**
 * POST /api/bookings
 * Create a new booking
 */
router.post('/', verifyToken, async (req, res) => {
  try {
    const { serviceId, bookingDate, bookingTime, notes } = req.body;
    const userId = req.userId;

    // Validate required fields
    if (!serviceId || !bookingDate || !bookingTime) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get service details
    const service = await getServiceById(serviceId);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    // Create booking
    const bookingData = {
      user_id: userId,
      service_id: serviceId,
      booking_date: bookingDate,
      booking_time: bookingTime,
      status: 'pending',
      payment_status: 'pending',
      amount: service.price,
      notes: notes || null,
      created_at: new Date().toISOString()
    };

    const booking = await createBooking(bookingData);

    res.status(201).json({
      message: 'Booking created successfully',
      booking: {
        id: booking.id,
        serviceId: booking.service_id,
        bookingDate: booking.booking_date,
        bookingTime: booking.booking_time,
        status: booking.status,
        paymentStatus: booking.payment_status,
        amount: booking.amount
      }
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

/**
 * GET /api/bookings
 * Get all bookings for the authenticated user
 */
router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const bookings = await getUserBookings(userId);

    res.json({
      bookings: bookings.map(booking => ({
        id: booking.id,
        service: {
          id: booking.service.id,
          name: booking.service.name,
          description: booking.service.description,
          price: booking.service.price
        },
        bookingDate: booking.booking_date,
        bookingTime: booking.booking_time,
        status: booking.status,
        paymentStatus: booking.payment_status,
        amount: booking.amount,
        notes: booking.notes,
        createdAt: booking.created_at
      }))
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ error: 'Failed to get bookings' });
  }
});

/**
 * GET /api/bookings/:id
 * Get a specific booking by ID
 */
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.userId;

    const booking = await getBookingById(bookingId);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Verify booking belongs to user
    if (booking.user_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized access to booking' });
    }

    res.json({
      booking: {
        id: booking.id,
        service: {
          id: booking.service.id,
          name: booking.service.name,
          description: booking.service.description,
          price: booking.service.price,
          duration: booking.service.duration
        },
        user: {
          id: booking.user.id,
          name: booking.user.name,
          email: booking.user.email,
          phone: booking.user.phone
        },
        bookingDate: booking.booking_date,
        bookingTime: booking.booking_time,
        status: booking.status,
        paymentStatus: booking.payment_status,
        amount: booking.amount,
        notes: booking.notes,
        createdAt: booking.created_at,
        updatedAt: booking.updated_at
      }
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ error: 'Failed to get booking' });
  }
});

/**
 * POST /api/bookings/:id/payment
 * Generate payment link for a booking
 */
router.post('/:id/payment', verifyToken, async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.userId;

    const booking = await getBookingById(bookingId);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Verify booking belongs to user
    if (booking.user_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized access to booking' });
    }

    // Check if already paid
    if (booking.payment_status === 'paid') {
      return res.status(400).json({ error: 'Booking already paid' });
    }

    // Generate payment link
    const paymentData = {
      bookingId: booking.id,
      amount: booking.amount,
      itemName: booking.service.name,
      itemDescription: `${booking.service.name} - ${booking.booking_date} at ${booking.booking_time}`,
      userEmail: booking.user.email,
      userName: booking.user.name,
      userPhone: booking.user.phone
    };

    const paymentResult = createPaymentLink(paymentData);

    if (!paymentResult.success) {
      return res.status(500).json({ error: 'Failed to generate payment link' });
    }

    // Send payment link via WhatsApp
    await sendPaymentLink({
      userName: booking.user.name,
      userPhone: booking.user.phone,
      serviceName: booking.service.name,
      amount: booking.amount,
      paymentUrl: paymentResult.paymentUrl,
      bookingId: booking.id
    });

    res.json({
      message: 'Payment link generated successfully',
      paymentUrl: paymentResult.paymentUrl
    });
  } catch (error) {
    console.error('Generate payment link error:', error);
    res.status(500).json({ error: 'Failed to generate payment link' });
  }
});

/**
 * PATCH /api/bookings/:id
 * Update booking status
 */
router.patch('/:id', verifyToken, async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.userId;
    const { status, notes } = req.body;

    const booking = await getBookingById(bookingId);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Verify booking belongs to user
    if (booking.user_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized access to booking' });
    }

    // Prepare updates
    const updates = {
      updated_at: new Date().toISOString()
    };

    if (status) {
      updates.status = status;
    }

    if (notes !== undefined) {
      updates.notes = notes;
    }

    const updatedBooking = await updateBooking(bookingId, updates);

    res.json({
      message: 'Booking updated successfully',
      booking: {
        id: updatedBooking.id,
        status: updatedBooking.status,
        notes: updatedBooking.notes,
        updatedAt: updatedBooking.updated_at
      }
    });
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ error: 'Failed to update booking' });
  }
});

/**
 * DELETE /api/bookings/:id
 * Cancel a booking
 */
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.userId;

    const booking = await getBookingById(bookingId);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Verify booking belongs to user
    if (booking.user_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized access to booking' });
    }

    // Check if booking can be cancelled
    if (booking.status === 'completed') {
      return res.status(400).json({ error: 'Cannot cancel completed booking' });
    }

    // Update booking status to cancelled
    await updateBooking(bookingId, {
      status: 'cancelled',
      updated_at: new Date().toISOString()
    });

    res.json({
      message: 'Booking cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

export default router;

// Made with Bob
