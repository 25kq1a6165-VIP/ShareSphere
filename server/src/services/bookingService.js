import { query, getConnection, getStore } from '../config/db.js';
import { sendNotification, notifyBookingEvent } from './notificationService.js';
import { logAudit } from './auditService.js';
import { getResourceById } from './resourceService.js';

// Check if a time range overlaps with any approved or checked_in bookings
export async function checkOverlap(resourceId, startTime, endTime, excludeBookingId = null) {
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();

  const allBookings = await query('SELECT * FROM bookings');
  const conflicting = allBookings.filter(b => {
    if (b.resource_id !== resourceId) return false;
    if (excludeBookingId && b.id === excludeBookingId) return false;
    // Confirmed, advance-paid, and in-use bookings occupy time slots
    const activeStatuses = ['approved', 'checked_in', 'booking_confirmed', 'advance_verified', 'resource_ready', 'in_use', 'usage_completed'];
    if (!activeStatuses.includes(b.status)) return false;

    const bStart = new Date(b.start_time).getTime();
    const bEnd = new Date(b.end_time).getTime();

    // Overlap condition: start < bEnd AND end > bStart
    return start < bEnd && end > bStart;
  });

  return conflicting.length > 0;
}

export async function createBookingRequest(userId, data, ipAddress) {
  const resource = await getResourceById(data.resource_id);

  if (resource.status !== 'active') {
    const error = new Error('This resource is currently not available for bookings.');
    error.statusCode = 400;
    throw error;
  }

  const start = new Date(data.start_time);
  const end = new Date(data.end_time);

  if (end <= start) {
    const error = new Error('End time must be after start time.');
    error.statusCode = 400;
    throw error;
  }

  // Calculate duration in hours
  const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

  if (durationHours < resource.min_duration_hours) {
    const error = new Error(`Minimum booking duration is ${resource.min_duration_hours} hour(s).`);
    error.statusCode = 400;
    throw error;
  }

  if (durationHours > resource.max_duration_hours) {
    const error = new Error(`Maximum booking duration is ${resource.max_duration_hours} hour(s).`);
    error.statusCode = 400;
    throw error;
  }

  // Check overlap with existing approved bookings
  const isOverlapping = await checkOverlap(resource.id, data.start_time, data.end_time);
  if (isOverlapping) {
    const error = new Error('The requested time slot conflicts with an existing approved booking.');
    error.statusCode = 409;
    throw error;
  }

  // Calculate total fee and 50/50 breakdown
  const totalCents = Math.round(durationHours * Number(resource.fee_per_hour) * 100);
  const totalAmount = totalCents / 100;
  const advanceAmount = Math.round(totalCents / 2) / 100;
  const remainingAmount = Number((totalAmount - advanceAmount).toFixed(2));

  // Determine initial status: if free, confirms immediately; if paid, requires 50% advance verification
  const isFree = totalAmount === 0;
  const initialStatus = isFree ? (resource.requires_approval ? 'pending' : 'booking_confirmed') : 'advance_pending';

  const result = await query(
    `INSERT INTO bookings (
      resource_id, user_id, start_time, end_time, total_amount,
      advance_amount, remaining_amount, advance_paid, final_paid,
      visit_id, purpose, attendees_count, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      resource.id,
      userId,
      data.start_time,
      data.end_time,
      totalAmount,
      advanceAmount,
      remainingAmount,
      isFree ? 1 : 0,
      isFree ? 1 : 0,
      data.visit_id || null,
      data.purpose,
      data.attendees_count || 1,
      initialStatus,
    ]
  );

  const bookingId = result.insertId;
  const createdBooking = await getBookingById(bookingId, userId, 'student');

  // Trigger Master Dual-Recipient Notification: informs both User and System Admin (and Owner)
  await notifyBookingEvent({
    eventType: 'booking_created',
    booking: {
      ...createdBooking,
      resource_title: resource.title,
      owner_id: resource.owner_id,
    },
    actorUser: { id: userId },
  });

  // Log audit
  await logAudit({
    userId,
    action: 'BOOKING_REQUESTED',
    entityType: 'BOOKING',
    entityId: bookingId,
    details: { resourceId: resource.id, start: data.start_time, end: data.end_time },
    ipAddress,
  });

  return getBookingById(bookingId, userId, 'student');
}

export async function getBookingById(id, userId, userRole) {
  const rows = await query('SELECT * FROM bookings WHERE id = ?', [id]);
  const booking = rows[0];

  if (!booking) {
    const error = new Error('Booking not found.');
    error.statusCode = 404;
    throw error;
  }

  // Permission check: student can only view their own; owner can view bookings for their resources; admin can view all
  if (userRole !== 'admin') {
    if (userRole === 'student' && booking.user_id !== userId) {
      const error = new Error('Access denied to this booking.');
      error.statusCode = 403;
      throw error;
    }
    if (userRole === 'owner') {
      const resource = await getResourceById(booking.resource_id);
      if (resource.owner_id !== userId && booking.user_id !== userId) {
        const error = new Error('Access denied to this booking.');
        error.statusCode = 403;
        throw error;
      }
    }
  }

  return booking;
}

export async function getStudentBookings(userId, status) {
  let bookings = await query('SELECT * FROM bookings WHERE user_id = ?', [userId]);

  if (status && status !== 'all') {
    bookings = bookings.filter(b => b.status === status);
  }

  return bookings.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export async function getOwnerRequests(ownerId, status) {
  let bookings = await query('SELECT * FROM bookings WHERE r.owner_id = ?', [ownerId]);

  if (status && status !== 'all') {
    bookings = bookings.filter(b => b.status === status);
  }

  return bookings.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export async function approveBooking(id, userId, userRole, ipAddress) {
  const booking = await getBookingById(id, userId, userRole);
  const resource = await getResourceById(booking.resource_id);

  if (userRole !== 'admin' && resource.owner_id !== userId) {
    const error = new Error('Only the resource owner or an admin can approve this booking.');
    error.statusCode = 403;
    throw error;
  }

  if (!['pending', 'advance_pending'].includes(booking.status)) {
    const error = new Error(`Cannot approve booking in "${booking.status}" status.`);
    error.statusCode = 400;
    throw error;
  }

  // Re-verify availability at approval time (concurrency guarantee)
  const isOverlapping = await checkOverlap(resource.id, booking.start_time, booking.end_time, booking.id);
  if (isOverlapping) {
    const error = new Error('Time slot conflict detected with another approved reservation.');
    error.statusCode = 409;
    throw error;
  }

  await query('UPDATE bookings SET status = ? WHERE id = ?', ['approved', id]);

  const updatedBooking = await getBookingById(id, userId, userRole);

  // Trigger Master Dual-Recipient Notification: informs both User and System Admin
  await notifyBookingEvent({
    eventType: 'booking_approved',
    booking: {
      ...updatedBooking,
      resource_title: updatedBooking.resource_title || resource.title,
      owner_id: resource.owner_id,
    },
    actorUser: { id: userId, role: userRole },
  });

  await logAudit({
    userId,
    action: 'BOOKING_APPROVED',
    entityType: 'BOOKING',
    entityId: id,
    details: { resourceId: resource.id },
    ipAddress,
  });

  return getBookingById(id, userId, userRole);
}

export async function rejectBooking(id, userId, userRole, reason, ipAddress) {
  const booking = await getBookingById(id, userId, userRole);
  const resource = await getResourceById(booking.resource_id);

  if (userRole !== 'admin' && resource.owner_id !== userId) {
    const error = new Error('Only the resource owner or an admin can reject this booking.');
    error.statusCode = 403;
    throw error;
  }

  if (!['pending', 'advance_pending'].includes(booking.status)) {
    const error = new Error(`Cannot reject booking in "${booking.status}" status.`);
    error.statusCode = 400;
    throw error;
  }

  await query('UPDATE bookings SET status = ? WHERE id = ?', ['rejected', id]);

  const rejectedBooking = await getBookingById(id, userId, userRole);

  // Trigger Master Dual-Recipient Notification: informs both User and System Admin
  await notifyBookingEvent({
    eventType: 'booking_rejected',
    booking: {
      ...rejectedBooking,
      resource_title: rejectedBooking.resource_title || resource.title,
      owner_id: resource.owner_id,
    },
    actorUser: { id: userId, role: userRole },
    reason,
  });

  await logAudit({
    userId,
    action: 'BOOKING_REJECTED',
    entityType: 'BOOKING',
    entityId: id,
    details: { reason },
    ipAddress,
  });

  return getBookingById(id, userId, userRole);
}

export async function cancelBooking(id, userId, userRole, reason, ipAddress) {
  const booking = await getBookingById(id, userId, userRole);

  if (userRole !== 'admin' && booking.user_id !== userId) {
    const error = new Error('You can only cancel your own bookings.');
    error.statusCode = 403;
    throw error;
  }

  if (booking.status === 'completed' || booking.status === 'cancelled') {
    const error = new Error(`Cannot cancel booking with status "${booking.status}".`);
    error.statusCode = 400;
    throw error;
  }

  await query('UPDATE bookings SET status = ? WHERE id = ?', ['cancelled', id]);

  const resource = await getResourceById(booking.resource_id);
  const cancelledBooking = await getBookingById(id, userId, userRole);

  // Trigger Master Dual-Recipient Notification: informs both User and System Admin (and Owner)
  await notifyBookingEvent({
    eventType: 'booking_cancelled',
    booking: {
      ...cancelledBooking,
      resource_title: resource.title,
      owner_id: resource.owner_id,
    },
    actorUser: { id: userId, role: userRole },
    reason,
  });

  await logAudit({
    userId,
    action: 'BOOKING_CANCELLED',
    entityType: 'BOOKING',
    entityId: id,
    details: { reason },
    ipAddress,
  });

  return getBookingById(id, userId, userRole);
}

export async function checkInBooking(id, userId, userRole, { conditionNotes, conditionStatus = 'good' }, ipAddress) {
  const booking = await getBookingById(id, userId, userRole);

  if (booking.status !== 'approved') {
    const error = new Error('Only approved bookings can be checked in.');
    error.statusCode = 400;
    throw error;
  }

  // Update booking status
  await query('UPDATE bookings SET status = ? WHERE id = ?', ['checked_in', id]);

  // Record initial condition report
  if (conditionNotes) {
    await query(
      `INSERT INTO condition_reports (booking_id, resource_id, reported_by, report_type, condition_status, notes)
       VALUES (?, ?, ?, 'check_in', ?, ?)`,
      [id, booking.resource_id, userId, conditionStatus, conditionNotes]
    );
  }

  await logAudit({
    userId,
    action: 'BOOKING_CHECKED_IN',
    entityType: 'BOOKING',
    entityId: id,
    details: { conditionStatus, conditionNotes },
    ipAddress,
  });

  const checkedInBooking = await getBookingById(id, userId, userRole);
  await notifyBookingEvent({
    eventType: 'booking_started',
    booking: checkedInBooking,
    actorUser: { id: userId, role: userRole },
  });

  return checkedInBooking;
}

export async function checkOutBooking(id, userId, userRole, { conditionNotes, conditionStatus = 'good' }, ipAddress) {
  const booking = await getBookingById(id, userId, userRole);

  if (booking.status !== 'checked_in') {
    const error = new Error('Only checked-in bookings can be checked out and marked completed.');
    error.statusCode = 400;
    throw error;
  }

  // Update status to completed
  await query('UPDATE bookings SET status = ? WHERE id = ?', ['completed', id]);

  // Record return condition report
  if (conditionNotes) {
    await query(
      `INSERT INTO condition_reports (booking_id, resource_id, reported_by, report_type, condition_status, notes)
       VALUES (?, ?, ?, 'check_out', ?, ?)`,
      [id, booking.resource_id, userId, conditionStatus, conditionNotes]
    );
  }

  await logAudit({
    userId,
    action: 'BOOKING_COMPLETED',
    entityType: 'BOOKING',
    entityId: id,
    details: { conditionStatus, conditionNotes },
    ipAddress,
  });

  const completedBooking = await getBookingById(id, userId, userRole);
  await notifyBookingEvent({
    eventType: 'feedback_request',
    booking: completedBooking,
    actorUser: { id: userId, role: userRole },
  });

  return completedBooking;
}

export async function getAllBookingsAdmin({ status, search, page = 1, limit = 20 }) {
  let bookings = await query('SELECT * FROM bookings');

  if (status && status !== 'all') {
    bookings = bookings.filter(b => b.status === status);
  }

  if (search && search.trim()) {
    const s = search.toLowerCase();
    bookings = bookings.filter(b =>
      (b.resource_title && b.resource_title.toLowerCase().includes(s)) ||
      (b.user_name && b.user_name.toLowerCase().includes(s)) ||
      (b.purpose && b.purpose.toLowerCase().includes(s))
    );
  }

  return bookings.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}
