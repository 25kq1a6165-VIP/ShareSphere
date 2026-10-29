import { query } from '../config/db.js';

export async function logAudit({ userId = null, action, entityType, entityId = null, details = null, ipAddress = '127.0.0.1' }) {
  try {
    const detailsStr = details ? (typeof details === 'string' ? details : JSON.stringify(details)) : null;
    await query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, action, entityType, entityId, detailsStr, ipAddress]
    );
  } catch (err) {
    console.error('[Audit Log Error]', err.message);
  }
}
