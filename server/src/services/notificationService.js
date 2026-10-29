import { query, getStore, saveFallbackStore } from '../config/db.js';

// Connected SSE clients: Map<userId, Set<Response>>
const sseClients = new Map();

/**
 * Register an active Server-Sent Events (SSE) client response stream
 */
export function registerSSEClient(userId, res) {
  const uid = Number(userId);
  if (!sseClients.has(uid)) {
    sseClients.set(uid, new Set());
  }
  sseClients.get(uid).add(res);

  // Send initial keep-alive / connection ACK
  res.write(`event: connected\ndata: ${JSON.stringify({ status: 'connected', userId: uid, timestamp: new Date().toISOString() })}\n\n`);

  // Handle client disconnect
  res.on('close', () => {
    removeSSEClient(uid, res);
  });
}

/**
 * Remove an SSE client response stream on disconnect
 */
export function removeSSEClient(userId, res) {
  const uid = Number(userId);
  if (sseClients.has(uid)) {
    const set = sseClients.get(uid);
    set.delete(res);
    if (set.size === 0) {
      sseClients.delete(uid);
    }
  }
}

/**
 * Broadcast real-time SSE event to a specific user if currently connected
 */
export function sendRealTimeEvent(userId, eventName, payload) {
  const uid = Number(userId);
  const clients = sseClients.get(uid);
  if (clients && clients.size > 0) {
    const dataStr = JSON.stringify(payload);
    for (const res of clients) {
      try {
        res.write(`event: ${eventName}\ndata: ${dataStr}\n\n`);
      } catch (err) {
        console.warn(`[SSE Delivery Warning] Failed to push to user ${uid}:`, err.message);
      }
    }
    return true;
  }
  return false;
}

/**
 * Send heartbeat ping to all active SSE streams to keep connection alive through reverse proxies
 */
export function pingSSEClients() {
  for (const [uid, set] of sseClients.entries()) {
    for (const res of set) {
      try {
        res.write(':keepalive\n\n');
      } catch (e) {
        set.delete(res);
      }
    }
  }
}

// Start 25-second keepalive interval
setInterval(pingSSEClients, 25000);

/**
 * Retrieve user's notification preferences or create default if not existing
 */
export async function getUserPreferences(userId) {
  const uid = Number(userId);
  try {
    const rows = await query('SELECT * FROM notification_preferences WHERE user_id = ?', [uid]);
    if (rows && rows.length > 0) {
      return rows[0];
    }

    // Default preferences
    const defaultPrefs = {
      user_id: uid,
      booking_updates: 1,
      booking_reminders: 1,
      cancellation_updates: 1,
      payment_updates: 1,
      browser_push: 0,
      reminder_time_1: 30,
      reminder_time_2: 5,
    };

    try {
      await query(
        `INSERT INTO notification_preferences (
          user_id, booking_updates, booking_reminders, cancellation_updates,
          payment_updates, browser_push, reminder_time_1, reminder_time_2
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          uid,
          defaultPrefs.booking_updates,
          defaultPrefs.booking_reminders,
          defaultPrefs.cancellation_updates,
          defaultPrefs.payment_updates,
          defaultPrefs.browser_push,
          defaultPrefs.reminder_time_1,
          defaultPrefs.reminder_time_2,
        ]
      );
    } catch (insertErr) {
      // If concurrent insert occurred or fallback handled, return default
    }

    return defaultPrefs;
  } catch (err) {
    return {
      user_id: uid,
      booking_updates: 1,
      booking_reminders: 1,
      cancellation_updates: 1,
      payment_updates: 1,
      browser_push: 0,
      reminder_time_1: 30,
      reminder_time_2: 5,
    };
  }
}

/**
 * Update user notification preferences
 */
export async function updateUserPreferences(userId, prefs) {
  const uid = Number(userId);
  const current = await getUserPreferences(uid);

  const updated = {
    booking_updates: prefs.booking_updates !== undefined ? (prefs.booking_updates ? 1 : 0) : current.booking_updates,
    booking_reminders: prefs.booking_reminders !== undefined ? (prefs.booking_reminders ? 1 : 0) : current.booking_reminders,
    cancellation_updates: prefs.cancellation_updates !== undefined ? (prefs.cancellation_updates ? 1 : 0) : current.cancellation_updates,
    payment_updates: prefs.payment_updates !== undefined ? (prefs.payment_updates ? 1 : 0) : current.payment_updates,
    browser_push: prefs.browser_push !== undefined ? (prefs.browser_push ? 1 : 0) : current.browser_push,
    reminder_time_1: prefs.reminder_time_1 !== undefined ? Number(prefs.reminder_time_1) : current.reminder_time_1,
    reminder_time_2: prefs.reminder_time_2 !== undefined ? Number(prefs.reminder_time_2) : current.reminder_time_2,
  };

  await query(
    `UPDATE notification_preferences SET
      booking_updates = ?,
      booking_reminders = ?,
      cancellation_updates = ?,
      payment_updates = ?,
      browser_push = ?,
      reminder_time_1 = ?,
      reminder_time_2 = ?
    WHERE user_id = ?`,
    [
      updated.booking_updates,
      updated.booking_reminders,
      updated.cancellation_updates,
      updated.payment_updates,
      updated.browser_push,
      updated.reminder_time_1,
      updated.reminder_time_2,
      uid
    ]
  );

  return { ...current, ...updated, user_id: uid };
}

/**
 * Send a single persistent notification to a user with idempotency and real-time SSE dispatch
 */
export async function sendNotification({
  userId,
  recipientRole = 'student',
  title,
  message,
  type = 'system',
  eventType = null,
  linkUrl = null,
  bookingId = null,
  resourceId = null,
  idempotencyKey = null,
  metadata = null,
}) {
  const uid = Number(userId);
  const evType = eventType || type || 'system';

  // Check idempotency if key provided
  if (idempotencyKey) {
    try {
      const existing = await query('SELECT id FROM notifications WHERE idempotency_key = ?', [idempotencyKey]);
      if (existing && existing.length > 0) {
        return { success: true, duplicateSkipped: true, id: existing[0].id };
      }
    } catch (e) {
      // Proceed if check fails
    }
  }

  // Check preferences for recipient
  const prefs = await getUserPreferences(uid);
  if (prefs) {
    if (evType.startsWith('reminder_') && !prefs.booking_reminders) return { skipped: true, reason: 'preference_disabled' };
    if ((evType.includes('cancel') || evType.includes('reject')) && !prefs.cancellation_updates) return { skipped: true, reason: 'preference_disabled' };
    if (evType.startsWith('payment_') && !prefs.payment_updates) return { skipped: true, reason: 'preference_disabled' };
    if ((evType.startsWith('booking_') || evType.startsWith('visit_')) && !prefs.booking_updates) return { skipped: true, reason: 'preference_disabled' };
  }

  const metaStr = metadata ? JSON.stringify(metadata) : null;

  try {
    const result = await query(
      `INSERT INTO notifications (
        user_id, recipient_role, booking_id, resource_id, event_type,
        title, message, link_url, is_read, delivery_status, idempotency_key, metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 'delivered', ?, ?)`,
      [
        uid,
        recipientRole,
        bookingId ? Number(bookingId) : null,
        resourceId ? Number(resourceId) : null,
        evType,
        title,
        message,
        linkUrl,
        idempotencyKey,
        metaStr,
      ]
    );

    const notificationPayload = {
      id: result?.insertId || Date.now(),
      user_id: uid,
      recipient_role: recipientRole,
      booking_id: bookingId ? Number(bookingId) : null,
      resource_id: resourceId ? Number(resourceId) : null,
      event_type: evType,
      type: evType,
      title,
      message,
      link_url: linkUrl,
      is_read: 0,
      delivery_status: 'delivered',
      idempotency_key: idempotencyKey,
      metadata,
      created_at: new Date().toISOString(),
    };

    // Push immediately to SSE client if online
    sendRealTimeEvent(uid, 'notification', notificationPayload);

    return { success: true, data: notificationPayload, id: notificationPayload.id };
  } catch (err) {
    console.error('[Notification Dispatch Error]', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Fetch all system administrators (users with role = 'admin')
 */
export async function getAllAdminUsers() {
  try {
    const admins = await query("SELECT id, full_name, email FROM users WHERE role = 'admin'");
    if (admins && admins.length > 0) {
      return admins;
    }
  } catch (e) {
    // Fallback if query fails
  }
  return [{ id: 1, full_name: 'System Administrator', email: 'admin@sharesphere.edu' }];
}

/**
 * MASTER DUAL-RECIPIENT NOTIFICATION DISPATCHER
 * Every booking/reservation event triggers notifications to BOTH:
 * 1. The booking user (Alex Rivera, etc.)
 * 2. The ShareSphere Administrator (admin@sharesphere.edu)
 * (And the resource owner if different)
 */
export async function notifyBookingEvent({
  eventType,
  booking,
  actorUser = null,
  reason = null,
  oldSchedule = null,
  newSchedule = null,
  metadata = {},
}) {
  if (!booking) return;

  const bookingId = booking.id;
  const resourceTitle = booking.resource_title || 'Campus Resource';
  const resourceId = booking.resource_id;
  const studentUserId = Number(booking.user_id);
  const ownerUserId = booking.owner_id ? Number(booking.owner_id) : null;
  const userName = booking.user_name || 'Student';
  const actorName = actorUser?.full_name || 'System';

  // Format date and time
  const startDateStr = booking.start_time ? new Date(booking.start_time).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : '';
  const startTimeStr = booking.start_time ? new Date(booking.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
  const endTimeStr = booking.end_time ? new Date(booking.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
  const timeRange = `${startDateStr} (${startTimeStr} - ${endTimeStr})`;

  const admins = await getAllAdminUsers();

  let userTitle = '';
  let userMessage = '';
  let adminTitle = '';
  let adminMessage = '';
  let linkForUser = `/my-bookings/${bookingId}`;
  let linkForAdmin = `/admin/bookings`;

  switch (eventType) {
    case 'booking_created':
      userTitle = 'Booking Request Submitted';
      userMessage = `Your reservation request for "${resourceTitle}" (Booking #${bookingId}) for ${timeRange} has been submitted. Status: ${booking.status || 'Pending'}.`;
      adminTitle = 'New Booking Request';
      adminMessage = `${userName} submitted a new booking request for "${resourceTitle}" (Booking #${bookingId}) for ${timeRange}.`;
      break;

    case 'booking_approved':
      userTitle = 'Booking Approved!';
      userMessage = `Great news! Your booking #${bookingId} for "${resourceTitle}" scheduled for ${timeRange} has been approved.`;
      adminTitle = 'Booking Approved';
      adminMessage = `Booking #${bookingId} for "${resourceTitle}" (${userName}) was approved by ${actorName}.`;
      break;

    case 'booking_rejected':
      userTitle = 'Booking Request Declined';
      userMessage = `Your booking request #${bookingId} for "${resourceTitle}" was declined.${reason ? ` Reason: ${reason}` : ''}`;
      adminTitle = 'Booking Request Declined';
      adminMessage = `Booking request #${bookingId} for "${resourceTitle}" (${userName}) was rejected.${reason ? ` Reason: ${reason}` : ''}`;
      break;

    case 'booking_cancelled':
      userTitle = 'Booking Cancelled';
      userMessage = `Booking #${bookingId} for "${resourceTitle}" was cancelled.${reason ? ` Reason: ${reason}` : ''}`;
      adminTitle = 'Booking Cancelled';
      adminMessage = `Booking #${bookingId} for "${resourceTitle}" was cancelled by ${actorName}.${reason ? ` Reason: ${reason}` : ''}`;
      break;

    case 'reminder_30m':
      userTitle = 'Booking Reminder (30 Minutes)';
      userMessage = `Upcoming Session: Your reservation for "${resourceTitle}" begins in 30 minutes at ${startTimeStr}.`;
      adminTitle = 'Upcoming Booking Session (30m)';
      adminMessage = `Upcoming Booking: Booking #${bookingId} ("${resourceTitle}", user: ${userName}) starts in 30 minutes at ${startTimeStr}.`;
      break;

    case 'reminder_5m':
      userTitle = 'Starting Soon (5 Minutes)';
      userMessage = `Your booking session for "${resourceTitle}" begins in 5 minutes at ${startTimeStr}. Please prepare for check-in.`;
      adminTitle = 'Starting Soon (5m)';
      adminMessage = `Session Imminent: Booking #${bookingId} ("${resourceTitle}") starts in 5 minutes.`;
      break;

    case 'booking_started':
      userTitle = 'Booking Session Active';
      userMessage = `Your reserved session for "${resourceTitle}" has officially started. Scheduled to end at ${endTimeStr}.`;
      adminTitle = 'Booking Session Started';
      adminMessage = `Session In Progress: Booking #${bookingId} ("${resourceTitle}", user: ${userName}) has commenced.`;
      break;

    case 'booking_expired':
      userTitle = 'Booking Session Ended';
      userMessage = `Scheduled booking time for "${resourceTitle}" (Booking #${bookingId}) has concluded at ${endTimeStr}.`;
      adminTitle = 'Booking Expired / Concluded';
      adminMessage = `Scheduled time expired for Booking #${bookingId} ("${resourceTitle}", user: ${userName}) at ${endTimeStr}. Status updated.`;
      break;

    case 'booking_overdue':
      userTitle = 'ACTION REQUIRED: Booking Overdue';
      userMessage = `Your reservation for "${resourceTitle}" (Booking #${bookingId}) has exceeded its scheduled end time (${endTimeStr}). Please complete check-out immediately.`;
      adminTitle = 'ALERT: Resource Usage Overdue';
      adminMessage = `OVERDUE ALERT: Booking #${bookingId} for "${resourceTitle}" (${userName}) is overdue. Scheduled end was ${endTimeStr}.`;
      break;

    case 'booking_rescheduled':
      userTitle = 'Booking Rescheduled';
      userMessage = `Booking #${bookingId} for "${resourceTitle}" has been rescheduled. New time: ${timeRange}.${oldSchedule ? ` (Previous: ${oldSchedule})` : ''}`;
      adminTitle = 'Booking Rescheduled';
      adminMessage = `Booking #${bookingId} for "${resourceTitle}" was rescheduled to ${timeRange}.`;
      break;

    case 'payment_success':
      const amtStr = metadata.amount ? `₹${Number(metadata.amount).toLocaleString()}` : '';
      const pType = metadata.paymentType === 'advance_50' ? '50% Advance Payment' : 'Final Settlement';
      userTitle = `${pType} Verified`;
      userMessage = `Your payment of ${amtStr} for Booking #${bookingId} ("${resourceTitle}") has been verified. Transaction: ${metadata.transactionId || 'Confirmed'}.`;
      adminTitle = `Payment Received (${pType})`;
      adminMessage = `${pType} of ${amtStr} verified for Booking #${bookingId} ("${resourceTitle}", ${userName}).`;
      break;

    case 'payment_failed':
      userTitle = 'Payment Attempt Declined';
      userMessage = `Your payment attempt for Booking #${bookingId} ("${resourceTitle}") was declined. Please verify your payment details and retry.`;
      adminTitle = 'Payment Failure Alert';
      adminMessage = `A payment transaction failed for Booking #${bookingId} ("${resourceTitle}", user: ${userName}).`;
      break;

    case 'feedback_request':
      userTitle = 'How was your experience?';
      userMessage = `Your booking for "${resourceTitle}" is complete! Please take a moment to submit your usage review and feedback.`;
      adminTitle = 'Session Completed';
      adminMessage = `Booking #${bookingId} ("${resourceTitle}", ${userName}) marked completed. Feedback requested.`;
      break;

    default:
      userTitle = `Booking Update (#${bookingId})`;
      userMessage = `There is an update on your booking for "${resourceTitle}".`;
      adminTitle = `Booking Event (#${bookingId})`;
      adminMessage = `Event on Booking #${bookingId} for "${resourceTitle}".`;
  }

  const results = [];

  // 1. Notify Booking User
  const studentKey = `${eventType}_${bookingId}_${studentUserId}_${Date.now()}`;
  results.push(
    await sendNotification({
      userId: studentUserId,
      recipientRole: 'student',
      bookingId,
      resourceId,
      eventType,
      title: userTitle,
      message: userMessage,
      linkUrl: linkForUser,
      idempotencyKey: studentKey,
      metadata: { ...metadata, bookingId, resourceTitle },
    })
  );

  // 2. Notify All System Administrators
  for (const admin of admins) {
    if (admin.id !== studentUserId) {
      const adminKey = `${eventType}_${bookingId}_admin_${admin.id}_${Date.now()}`;
      results.push(
        await sendNotification({
          userId: admin.id,
          recipientRole: 'admin',
          bookingId,
          resourceId,
          eventType,
          title: adminTitle,
          message: adminMessage,
          linkUrl: linkForAdmin,
          idempotencyKey: adminKey,
          metadata: { ...metadata, bookingId, resourceTitle, userName, studentUserId },
        })
      );
    }
  }

  // 3. Notify Resource Owner (if distinct from user and admin)
  if (ownerUserId && ownerUserId !== studentUserId && !admins.some(a => a.id === ownerUserId)) {
    const ownerKey = `${eventType}_${bookingId}_owner_${ownerUserId}_${Date.now()}`;
    results.push(
      await sendNotification({
        userId: ownerUserId,
        recipientRole: 'owner',
        bookingId,
        resourceId,
        eventType,
        title: adminTitle,
        message: adminMessage,
        linkUrl: `/owner/requests`,
        idempotencyKey: ownerKey,
        metadata: { ...metadata, bookingId, resourceTitle, userName },
      })
    );
  }

  return results;
}

/**
 * Retrieve notifications with rich filtering, search, and pagination
 */
export async function getUserNotifications(userId, {
  category = 'all',
  eventType = null,
  isRead = null,
  search = null,
  page = 1,
  limit = 20,
} = {}) {
  const uid = Number(userId);
  const offset = (Number(page) - 1) * Number(limit);

  let rows = await query(
    `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC`,
    [uid]
  );

  if (!rows || !Array.isArray(rows)) {
    rows = [];
  }

  // Filter by category
  if (category && category !== 'all') {
    if (category === 'unread') {
      rows = rows.filter(n => !n.is_read);
    } else if (category === 'bookings') {
      rows = rows.filter(n =>
        ['booking_created', 'booking_approved', 'booking_rejected', 'booking_cancelled', 'booking_rescheduled'].includes(n.event_type) ||
        ['booking_request', 'booking_approved', 'booking_rejected', 'booking_cancelled'].includes(n.type)
      );
    } else if (category === 'reminders') {
      rows = rows.filter(n =>
        ['reminder_30m', 'reminder_5m', 'booking_started', 'booking_expired', 'booking_overdue'].includes(n.event_type)
      );
    } else if (category === 'payments') {
      rows = rows.filter(n =>
        ['payment_success', 'payment_failed', 'payment_received'].includes(n.event_type) ||
        ['payment_success', 'payment_failed', 'payment_received'].includes(n.type)
      );
    } else if (category === 'system') {
      rows = rows.filter(n =>
        ['system', 'feedback_request', 'incident_reported', 'visit_request', 'visit_approved', 'visit_rejected'].includes(n.event_type)
      );
    }
  }

  // Filter by eventType if explicitly passed
  if (eventType && eventType !== 'all') {
    rows = rows.filter(n => n.event_type === eventType || n.type === eventType);
  }

  // Filter by read status
  if (isRead !== null && isRead !== undefined && isRead !== '') {
    const readBool = isRead === '1' || isRead === 1 || isRead === true;
    rows = rows.filter(n => (n.is_read ? 1 : 0) === (readBool ? 1 : 0));
  }

  // Search filter
  if (search && search.trim()) {
    const q = search.toLowerCase().trim();
    rows = rows.filter(n =>
      (n.title && n.title.toLowerCase().includes(q)) ||
      (n.message && n.message.toLowerCase().includes(q))
    );
  }

  const total = rows.length;
  const paged = rows.slice(offset, offset + Number(limit));

  return {
    notifications: paged,
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / Number(limit)) || 1,
    unreadCount: rows.filter(n => !n.is_read).length,
  };
}

/**
 * Get quick unread count for navbar badges
 */
export async function getUnreadCount(userId) {
  const uid = Number(userId);
  try {
    const rows = await query(
      `SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0`,
      [uid]
    );
    if (rows && rows.length > 0) {
      return Number(rows[0].count || 0);
    }
  } catch (err) {
    // Fallback
  }
  return 0;
}

/**
 * Mark a single notification as read
 */
export async function markNotificationAsRead(userId, notificationId) {
  const uid = Number(userId);
  const nid = Number(notificationId);

  await query(
    `UPDATE notifications SET is_read = 1, read_at = ? WHERE id = ? AND user_id = ?`,
    [new Date().toISOString(), nid, uid]
  );
  return { success: true };
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId) {
  const uid = Number(userId);
  await query(
    `UPDATE notifications SET is_read = 1, read_at = ? WHERE user_id = ?`,
    [new Date().toISOString(), uid]
  );
  return { success: true };
}
