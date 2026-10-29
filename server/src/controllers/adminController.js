import * as incidentService from '../services/incidentService.js';
import * as notificationService from '../services/notificationService.js';
import * as adminService from '../services/adminService.js';
import * as bookingService from '../services/bookingService.js';

// Incident Handlers
export async function createIncident(req, res, next) {
  try {
    const incident = await incidentService.createIncident(req.user.id, req.body, req.ip);
    res.status(201).json({
      success: true,
      message: 'Incident reported successfully.',
      data: incident,
    });
  } catch (err) {
    next(err);
  }
}

export async function getIncidents(req, res, next) {
  try {
    const incidents = await incidentService.getIncidents(req.query);
    res.json({
      success: true,
      data: incidents,
    });
  } catch (err) {
    next(err);
  }
}

export async function resolveIncident(req, res, next) {
  try {
    const incident = await incidentService.updateIncident(
      req.params.id,
      req.user.id,
      req.body,
      req.ip
    );
    res.json({
      success: true,
      message: 'Incident status updated successfully.',
      data: incident,
    });
  } catch (err) {
    next(err);
  }
}

// Notification Handlers
export async function getMyNotifications(req, res, next) {
  try {
    const notifications = await notificationService.getUserNotifications(req.user.id);
    res.json({
      success: true,
      data: notifications,
    });
  } catch (err) {
    next(err);
  }
}

export async function markAsRead(req, res, next) {
  try {
    await notificationService.markNotificationAsRead(req.user.id, req.params.id);
    res.json({ success: true, message: 'Notification marked as read.' });
  } catch (err) {
    next(err);
  }
}

export async function markAllAsRead(req, res, next) {
  try {
    await notificationService.markAllNotificationsAsRead(req.user.id);
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    next(err);
  }
}

// Admin Handlers
export async function getAllUsers(req, res, next) {
  try {
    const users = await adminService.getAllUsers(req.query);
    res.json({
      success: true,
      data: users,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateUserStatus(req, res, next) {
  try {
    const result = await adminService.updateUserStatus(
      parseInt(req.params.id, 10),
      req.body.status,
      req.user.id,
      req.ip
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getAuditLogs(req, res, next) {
  try {
    const logs = await adminService.getAuditLogs(req.query);
    res.json({
      success: true,
      data: logs,
    });
  } catch (err) {
    next(err);
  }
}

export async function getAllBookingsAdmin(req, res, next) {
  try {
    const bookings = await bookingService.getAllBookingsAdmin(req.query);
    res.json({
      success: true,
      data: bookings,
    });
  } catch (err) {
    next(err);
  }
}

export async function submitContact(req, res, next) {
  try {
    const result = await adminService.submitContactMessage(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
