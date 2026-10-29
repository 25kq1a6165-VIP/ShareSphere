import { query } from '../config/db.js';
import { logAudit } from './auditService.js';

export async function getAllUsers({ role, status, search }) {
  let users = await query('SELECT id, full_name, email, role, department, phone, avatar_url, status, created_at FROM users');

  if (role && role !== 'all') {
    users = users.filter(u => u.role === role);
  }
  if (status && status !== 'all') {
    users = users.filter(u => u.status === status);
  }
  if (search && search.trim()) {
    const s = search.toLowerCase();
    users = users.filter(u =>
      u.full_name.toLowerCase().includes(s) ||
      u.email.toLowerCase().includes(s) ||
      (u.department && u.department.toLowerCase().includes(s))
    );
  }

  return users.sort((a, b) => b.id - a.id);
}

export async function updateUserStatus(userId, status, adminId, ipAddress) {
  if (userId === adminId) {
    const error = new Error('Administrators cannot suspend their own account.');
    error.statusCode = 400;
    throw error;
  }

  await query('UPDATE users SET status = ? WHERE id = ?', [status, userId]);

  await logAudit({
    userId: adminId,
    action: 'USER_STATUS_UPDATED',
    entityType: 'USER',
    entityId: userId,
    details: { newStatus: status },
    ipAddress,
  });

  return { success: true, message: `User status updated to ${status}.` };
}

export async function getAuditLogs({ action, entityType, limit = 100 }) {
  let logs = await query('SELECT * FROM audit_logs');

  if (action && action !== 'all') {
    logs = logs.filter(l => l.action === action);
  }
  if (entityType && entityType !== 'all') {
    logs = logs.filter(l => l.entity_type === entityType);
  }

  return logs.slice(0, parseInt(limit, 10));
}

export async function submitContactMessage({ name, email, subject, message }) {
  const result = await query(
    `INSERT INTO contact_messages (name, email, subject, message, status)
     VALUES (?, ?, ?, ?, 'unread')`,
    [name, email, subject, message]
  );
  return { success: true, message: 'Your message has been received! Our support team will respond shortly.' };
}

export async function getConditionReportsForBooking(bookingId) {
  return await query('SELECT * FROM condition_reports WHERE booking_id = ?', [bookingId]);
}
