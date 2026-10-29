import { query, getStore } from '../config/db.js';
import { sendNotification, notifyBookingEvent } from './notificationService.js';
import { logAudit } from './auditService.js';

// Server-side precise 50/50 payment calculation avoiding floating point errors
export function calculate5050Breakdown(durationHours, feePerHour) {
  const duration = Number(durationHours) || 0;
  const rate = Number(feePerHour) || 0;
  const totalCents = Math.round(duration * rate * 100);
  const totalAmount = totalCents / 100;

  const advanceCents = Math.round(totalCents / 2);
  const advanceAmount = advanceCents / 100;
  const remainingAmount = (totalCents - advanceCents) / 100;

  return {
    total_amount: totalAmount,
    advance_amount: advanceAmount,
    remaining_amount: remainingAmount,
    advance_percentage: 50,
    remaining_percentage: 50,
    taxes: 0.00,
    additional_fees: 0.00,
    currency: 'INR',
    currency_symbol: '₹'
  };
}

export async function processAdvancePayment(bookingId, userId, { paymentMethod = 'UPI / NetBanking', simulateFailure = false }, ipAddress) {
  const bookings = await query('SELECT * FROM bookings WHERE id = ?', [bookingId]);
  if (!bookings || bookings.length === 0) {
    const err = new Error('Booking not found.');
    err.statusCode = 404;
    throw err;
  }
  const booking = bookings[0];

  if (booking.user_id !== Number(userId)) {
    const err = new Error('Unauthorized to pay for this booking.');
    err.statusCode = 403;
    throw err;
  }

  // Prevent duplicate advance payment
  if (booking.advance_paid) {
    const err = new Error('50% Advance payment has already been verified for this reservation.');
    err.statusCode = 400;
    throw err;
  }

  // Handle simulated failure test scenario (Master Prompt requirement 5 & 14)
  if (simulateFailure) {
    await notifyBookingEvent({
      eventType: 'payment_failed',
      booking,
      actorUser: { id: userId },
      metadata: { amount: advanceAmount, paymentType: 'advance_50' }
    });
    const err = new Error('Payment authorization was declined by issuer bank (Simulated Test Mode Failure).');
    err.statusCode = 402;
    throw err;
  }

  const advanceAmount = booking.advance_amount ? Number(booking.advance_amount) : Number((booking.total_amount * 0.5).toFixed(2));
  const remainingAmount = Number((booking.total_amount - advanceAmount).toFixed(2));

  const transactionId = `txn_adv_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  const receiptNumber = `RCPT-ADV-${new Date().getFullYear()}-${String(booking.id).padStart(4, '0')}`;
  const now = new Date().toISOString();

  // Insert payment record
  const paymentResult = await query(
    `INSERT INTO payments (
      booking_id, user_id, payment_type, amount, currency, status,
      gateway, transaction_id, receipt_number, payment_method, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      booking.id,
      userId,
      'advance_50',
      advanceAmount,
      'INR',
      'success',
      'ShareSphere Verified Test Gateway',
      transactionId,
      receiptNumber,
      paymentMethod,
      now
    ]
  );

  // Update booking state
  await query(
    `UPDATE bookings SET
      advance_paid = 1,
      advance_payment_id = ?,
      advance_paid_at = ?,
      advance_amount = ?,
      remaining_amount = ?,
      status = 'booking_confirmed',
      updated_at = ?
    WHERE id = ?`,
    [transactionId, now, advanceAmount, remainingAmount, now, booking.id]
  );

  // Get resource details
  const resources = await query('SELECT owner_id, title FROM resources WHERE id = ?', [booking.resource_id]);
  const resource = resources[0];

  // Notify user, admin, and owner via Master Dual-Recipient dispatcher
  await notifyBookingEvent({
    eventType: 'payment_success',
    booking: {
      ...booking,
      resource_title: resource ? resource.title : 'Resource',
      owner_id: resource ? resource.owner_id : null,
    },
    actorUser: { id: userId },
    metadata: {
      amount: advanceAmount,
      paymentType: 'advance_50',
      transactionId,
      receiptNumber
    }
  });

  await logAudit({
    userId,
    action: 'PAY_ADVANCE_50',
    entityType: 'PAYMENT',
    entityId: paymentResult.insertId,
    details: { booking_id: booking.id, amount: advanceAmount, transaction_id: transactionId },
    ipAddress
  });

  return {
    success: true,
    bookingId: booking.id,
    transactionId,
    receiptNumber,
    amountPaid: advanceAmount,
    remainingBalance: remainingAmount,
    status: 'booking_confirmed',
    paidAt: now
  };
}

export async function processRemainingPayment(bookingId, userId, { paymentMethod = 'UPI / NetBanking', simulateFailure = false }, ipAddress) {
  const bookings = await query('SELECT * FROM bookings WHERE id = ?', [bookingId]);
  if (!bookings || bookings.length === 0) {
    const err = new Error('Booking not found.');
    err.statusCode = 404;
    throw err;
  }
  const booking = bookings[0];

  if (booking.user_id !== Number(userId)) {
    const err = new Error('Unauthorized to settle balance for this booking.');
    err.statusCode = 403;
    throw err;
  }

  if (!booking.advance_paid) {
    const err = new Error('Initial 50% advance payment has not yet been completed.');
    err.statusCode = 400;
    throw err;
  }

  if (booking.final_paid) {
    const err = new Error('Remaining balance has already been fully settled for this booking.');
    err.statusCode = 400;
    throw err;
  }

  if (simulateFailure) {
    const err = new Error('Final payment transaction declined by bank (Simulated Failure).');
    err.statusCode = 402;
    throw err;
  }

  const remainingAmount = booking.remaining_amount ? Number(booking.remaining_amount) : Number((booking.total_amount * 0.5).toFixed(2));
  const transactionId = `txn_fin_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  const receiptNumber = `RCPT-FINAL-${new Date().getFullYear()}-${String(booking.id).padStart(4, '0')}`;
  const now = new Date().toISOString();

  // Insert payment record
  const paymentResult = await query(
    `INSERT INTO payments (
      booking_id, user_id, payment_type, amount, currency, status,
      gateway, transaction_id, receipt_number, payment_method, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      booking.id,
      userId,
      'final_50',
      remainingAmount,
      'INR',
      'success',
      'ShareSphere Verified Test Gateway',
      transactionId,
      receiptNumber,
      paymentMethod,
      now
    ]
  );

  // Update booking to completed & fully paid
  await query(
    `UPDATE bookings SET
      final_paid = 1,
      final_payment_id = ?,
      final_paid_at = ?,
      remaining_amount = 0.00,
      status = 'completed',
      updated_at = ?
    WHERE id = ?`,
    [transactionId, now, now, booking.id]
  );

  const resources = await query('SELECT owner_id, title FROM resources WHERE id = ?', [booking.resource_id]);
  const resource = resources[0];

  // Notify user, admin, and owner via Master Dual-Recipient dispatcher
  await notifyBookingEvent({
    eventType: 'payment_success',
    booking: {
      ...booking,
      resource_title: resource ? resource.title : 'Resource',
      owner_id: resource ? resource.owner_id : null,
      status: 'completed',
    },
    actorUser: { id: userId },
    metadata: {
      amount: remainingAmount,
      paymentType: 'final_50',
      transactionId,
      receiptNumber,
    }
  });

  await logAudit({
    userId,
    action: 'PAY_REMAINING_50',
    entityType: 'PAYMENT',
    entityId: paymentResult.insertId,
    details: { booking_id: booking.id, amount: remainingAmount, transaction_id: transactionId },
    ipAddress
  });

  return {
    success: true,
    bookingId: booking.id,
    transactionId,
    receiptNumber,
    amountPaid: remainingAmount,
    totalSettled: Number(booking.total_amount),
    status: 'completed',
    paidAt: now
  };
}

export async function confirmHandover(bookingId, ownerId) {
  const bookings = await query('SELECT * FROM bookings WHERE id = ?', [bookingId]);
  if (!bookings || bookings.length === 0) {
    const err = new Error('Booking not found.');
    err.statusCode = 404;
    throw err;
  }
  const booking = bookings[0];

  const resources = await query('SELECT owner_id, title, location FROM resources WHERE id = ?', [booking.resource_id]);
  const resource = resources[0];
  if (resource.owner_id !== Number(ownerId)) {
    const err = new Error('You are not authorized to manage handover for this resource.');
    err.statusCode = 403;
    throw err;
  }

  const now = new Date().toISOString();
  await query(
    `UPDATE bookings SET
      handover_confirmed = 1,
      handover_confirmed_at = ?,
      status = 'resource_ready',
      updated_at = ?
    WHERE id = ?`,
    [now, now, booking.id]
  );

  await sendNotification({
    userId: booking.user_id,
    title: 'Resource Ready for Handover!',
    message: `Host has completed preparation for "${resource.title}" at ${resource.location}. You may now begin usage upon arrival.`,
    type: 'resource_ready',
    linkUrl: `/my-bookings/${booking.id}`
  });

  return { success: true, bookingId: booking.id, status: 'resource_ready' };
}

export async function markUsageStarted(bookingId, userId) {
  const now = new Date().toISOString();
  await query(
    `UPDATE bookings SET
      status = 'in_use',
      check_in_time = ?,
      updated_at = ?
    WHERE id = ?`,
    [now, now, bookingId]
  );

  return { success: true, bookingId, status: 'in_use' };
}

export async function markUsageCompleted(bookingId, userId) {
  const now = new Date().toISOString();
  await query(
    `UPDATE bookings SET
      status = 'usage_completed',
      check_out_time = ?,
      updated_at = ?
    WHERE id = ?`,
    [now, now, bookingId]
  );

  const bookings = await query('SELECT user_id, remaining_amount, total_amount FROM bookings WHERE id = ?', [bookingId]);
  const booking = bookings[0];

  await sendNotification({
    userId: booking.user_id,
    title: 'Usage Completed — Final 50% Balance Pending',
    message: `Your session has ended. Please settle the remaining balance of ₹${Number(booking.remaining_amount || 0).toLocaleString()} to conclude this reservation.`,
    type: 'final_payment_due',
    linkUrl: `/my-bookings/${bookingId}`
  });

  return { success: true, bookingId, status: 'usage_completed' };
}

export async function requestRefund(bookingId, userId, reason) {
  const bookings = await query('SELECT * FROM bookings WHERE id = ?', [bookingId]);
  const booking = bookings[0];
  if (!booking) {
    const err = new Error('Booking not found.');
    err.statusCode = 404;
    throw err;
  }

  // Calculate refund eligibility based on cancellation timeframe
  const startTime = new Date(booking.start_time).getTime();
  const now = Date.now();
  const hoursUntilStart = (startTime - now) / (1000 * 60 * 60);

  let refundPercentage = 100;
  if (hoursUntilStart < 2) {
    refundPercentage = 0; // Within 2 hours: non-refundable
  } else if (hoursUntilStart < 24) {
    refundPercentage = 50; // Between 2 and 24 hours: 50% refund
  }

  const advancePaid = Number(booking.advance_amount || 0);
  const eligibleRefund = Number(((advancePaid * refundPercentage) / 100).toFixed(2));

  await query(
    `UPDATE bookings SET
      refund_status = 'requested',
      refund_amount = ?,
      refund_reason = ?,
      status = 'cancelled',
      cancellation_reason = ?,
      updated_at = NOW()
    WHERE id = ?`,
    [eligibleRefund, reason, reason, bookingId]
  );

  return {
    success: true,
    bookingId,
    refundPercentage,
    refundAmount: eligibleRefund,
    status: 'cancelled',
    refundStatus: 'requested'
  };
}

export async function getPaymentsByUser(userId) {
  const payments = await query('SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC', [userId]);
  return payments;
}

export async function getOwnerEarnings(ownerId) {
  const allBookings = await query('SELECT b.*, r.owner_id FROM bookings b JOIN resources r ON b.resource_id = r.id WHERE r.owner_id = ?', [ownerId]);
  const advances = allBookings.filter(b => b.advance_paid).reduce((sum, b) => sum + Number(b.advance_amount || 0), 0);
  const finals = allBookings.filter(b => b.final_paid).reduce((sum, b) => sum + Number(b.remaining_amount === 0 ? b.total_amount * 0.5 : 0), 0);
  const pendingBalance = allBookings.filter(b => b.advance_paid && !b.final_paid && b.status !== 'cancelled').reduce((sum, b) => sum + Number(b.remaining_amount || 0), 0);

  return {
    totalRevenue: advances + finals,
    advancesCollected: advances,
    finalBalancesCollected: finals,
    outstandingReceivables: pendingBalance,
    bookingCount: allBookings.length
  };
}

