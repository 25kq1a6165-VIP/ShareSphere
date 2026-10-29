import { query, getStore, saveFallbackStore } from '../config/db.js';
import { notifyBookingEvent } from './notificationService.js';

let schedulerInterval = null;
let isRunning = false;

/**
 * Execute a single cycle of the booking scheduler
 * Checks reminders, active starts, expirations, and overdue sessions
 */
export async function runSchedulerCheck() {
  if (isRunning) return { status: 'skipped', reason: 'already_running' };
  isRunning = true;

  const now = new Date();
  const nowMs = now.getTime();
  const summary = {
    reminders30mSent: 0,
    reminders5mSent: 0,
    startedSent: 0,
    expiredUpdated: 0,
    overdueSent: 0,
    timestamp: now.toISOString(),
  };

  try {
    // Fetch all active bookings
    const bookings = await query('SELECT * FROM bookings');
    if (!bookings || !Array.isArray(bookings)) {
      isRunning = false;
      return summary;
    }

    for (const b of bookings) {
      const startTime = new Date(b.start_time).getTime();
      const endTime = new Date(b.end_time).getTime();
      const diffStartMs = startTime - nowMs;
      const diffEndMs = nowMs - endTime;

      const isConfirmed = ['approved', 'booking_confirmed'].includes(b.status);
      const isInUse = ['in_use', 'checked_in'].includes(b.status);

      // 1. 30-Minute Reminder
      // If booking starts within 30 minutes (0 to 30 mins from now)
      if (isConfirmed && !b.reminder_30m_sent && diffStartMs > 0 && diffStartMs <= 30 * 60 * 1000) {
        await notifyBookingEvent({
          eventType: 'reminder_30m',
          booking: b,
        });
        await query('UPDATE bookings SET reminder_30m_sent = 1 WHERE id = ?', [b.id]);
        b.reminder_30m_sent = 1;
        summary.reminders30mSent++;
      }

      // 2. 5-Minute Reminder
      // If booking starts within 5 minutes (0 to 5 mins from now)
      if (isConfirmed && !b.reminder_5m_sent && diffStartMs > 0 && diffStartMs <= 5 * 60 * 1000) {
        await notifyBookingEvent({
          eventType: 'reminder_5m',
          booking: b,
        });
        await query('UPDATE bookings SET reminder_5m_sent = 1 WHERE id = ?', [b.id]);
        b.reminder_5m_sent = 1;
        summary.reminders5mSent++;
      }

      // 3. Booking Started Notification
      // If start_time <= now and end_time > now and haven't notified start
      if (isConfirmed && !b.started_notified && diffStartMs <= 0 && endTime > nowMs) {
        await notifyBookingEvent({
          eventType: 'booking_started',
          booking: b,
        });
        await query('UPDATE bookings SET started_notified = 1 WHERE id = ?', [b.id]);
        b.started_notified = 1;
        summary.startedSent++;
      }

      // 4. Booking Time Expired
      // If end_time has passed and booking was confirmed but user never checked in
      if (isConfirmed && diffEndMs >= 0) {
        // Mark as completed/expired so it does not remain indefinitely marked as active
        const newStatus = b.total_amount === 0 || b.final_paid ? 'completed' : 'usage_completed';
        await query(
          'UPDATE bookings SET status = ?, expired_notified = 1 WHERE id = ?',
          [newStatus, b.id]
        );
        b.status = newStatus;
        if (!b.expired_notified) {
          await notifyBookingEvent({
            eventType: 'booking_expired',
            booking: { ...b, status: newStatus },
          });
          summary.expiredUpdated++;
        }
        b.expired_notified = 1;
      }

      // 5. Overdue Active Bookings
      // If user checked in (in_use/checked_in) but end_time has passed and check-out / return not confirmed
      if (isInUse && diffEndMs > 0 && !b.overdue_notified) {
        await notifyBookingEvent({
          eventType: 'booking_overdue',
          booking: b,
        });
        await query('UPDATE bookings SET overdue_notified = 1 WHERE id = ?', [b.id]);
        b.overdue_notified = 1;
        summary.overdueSent++;
      }
    }
  } catch (err) {
    console.error('[Booking Scheduler Error]', err.message);
  } finally {
    isRunning = false;
  }

  return summary;
}

/**
 * Start the background scheduler interval
 */
export function startBookingScheduler(intervalMs = 30000) {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
  }
  console.log(`[ShareSphere Scheduler] Booking background monitor active (interval: ${intervalMs / 1000}s).`);
  // Run initial check immediately
  runSchedulerCheck();
  schedulerInterval = setInterval(runSchedulerCheck, intervalMs);
}

/**
 * Stop the background scheduler interval
 */
export function stopBookingScheduler() {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log('[ShareSphere Scheduler] Booking background monitor stopped.');
  }
}

