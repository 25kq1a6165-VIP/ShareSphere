import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import * as notificationService from '../services/notificationService.js';
import { runSchedulerCheck } from '../services/bookingScheduler.js';

/**
 * Real-time Server-Sent Events (SSE) Stream
 * Accepts token via Authorization header or ?token query param for EventSource compatibility
 */
export async function getStream(req, res, next) {
  try {
    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Missing authentication token for event stream.' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, config.jwt.secret);
    } catch (jwtErr) {
      return res.status(401).json({ success: false, message: 'Invalid or expired event stream token.' });
    }

    const userId = decoded.id;

    // Headers required for standard SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    // Register active SSE client
    notificationService.registerSSEClient(userId, res);

  } catch (err) {
    next(err);
  }
}

/**
 * Get user notifications with filtering, category, read status, and pagination
 */
export async function getMyNotifications(req, res, next) {
  try {
    const result = await notificationService.getUserNotifications(req.user.id, req.query);
    res.json({
      success: true,
      data: result.notifications,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
      unreadCount: result.unreadCount,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get quick count of unread notifications for badge counters
 */
export async function getUnreadCount(req, res, next) {
  try {
    const count = await notificationService.getUnreadCount(req.user.id);
    res.json({
      success: true,
      count,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Mark a single notification as read
 */
export async function markAsRead(req, res, next) {
  try {
    await notificationService.markNotificationAsRead(req.user.id, req.params.id);
    res.json({
      success: true,
      message: 'Notification marked as read.',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Mark all user notifications as read
 */
export async function markAllAsRead(req, res, next) {
  try {
    await notificationService.markAllNotificationsAsRead(req.user.id);
    res.json({
      success: true,
      message: 'All notifications marked as read.',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get user's notification preferences
 */
export async function getPreferences(req, res, next) {
  try {
    const prefs = await notificationService.getUserPreferences(req.user.id);
    res.json({
      success: true,
      data: prefs,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Update user's notification preferences
 */
export async function updatePreferences(req, res, next) {
  try {
    const updated = await notificationService.updateUserPreferences(req.user.id, req.body);
    res.json({
      success: true,
      message: 'Notification preferences updated successfully.',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Trigger manual scheduler execution (useful for integration tests & cron)
 */
export async function triggerScheduler(req, res, next) {
  try {
    const summary = await runSchedulerCheck();
    res.json({
      success: true,
      message: 'Booking scheduler execution completed.',
      summary,
    });
  } catch (err) {
    next(err);
  }
}

