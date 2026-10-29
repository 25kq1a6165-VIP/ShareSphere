import { query } from '../config/db.js';
import { logAudit } from './auditService.js';
import { sendNotification } from './notificationService.js';
import { getResourceById } from './resourceService.js';

export async function createIncident(userId, data, ipAddress) {
  const result = await query(
    `INSERT INTO incidents (booking_id, resource_id, reported_by, title, description, severity, status)
     VALUES (?, ?, ?, ?, ?, ?, 'open')`,
    [data.booking_id || null, data.resource_id, userId, data.title, data.description, data.severity || 'medium']
  );

  const incidentId = result.insertId;
  const resource = await getResourceById(data.resource_id);

  // Notify reporting user
  await sendNotification({
    userId,
    recipientRole: 'student',
    title: 'Incident Report Received',
    message: `Your report for "${resource?.title || 'Resource'}" has been logged and escalated to facility administrators.`,
    type: 'incident_reported',
    linkUrl: '/dashboard'
  });

  // Notify owner of the resource
  if (resource && resource.owner_id && resource.owner_id !== userId) {
    await sendNotification({
      userId: resource.owner_id,
      recipientRole: 'owner',
      title: 'Incident Reported on Resource',
      message: `An incident was reported on "${resource.title}": ${data.title} (${data.severity || 'medium'} severity).`,
      type: 'incident_reported',
      linkUrl: '/owner/reports',
    });
  }

  // Notify administrator
  await sendNotification({
    userId: 1,
    recipientRole: 'admin',
    title: 'New Incident Escalation',
    message: `New ${data.severity || 'medium'} priority incident reported on "${resource?.title || 'Resource'}": ${data.title}.`,
    type: 'incident_reported',
    linkUrl: '/admin/incidents',
  });

  await logAudit({
    userId,
    action: 'INCIDENT_REPORTED',
    entityType: 'INCIDENT',
    entityId: incidentId,
    details: { resourceId: data.resource_id, severity: data.severity },
    ipAddress,
  });

  return getIncidentById(incidentId);
}

export async function getIncidents({ status, severity, resourceId }) {
  let incidents = await query('SELECT * FROM incidents');

  if (status && status !== 'all') {
    incidents = incidents.filter(i => i.status === status);
  }
  if (severity && severity !== 'all') {
    incidents = incidents.filter(i => i.severity === severity);
  }
  if (resourceId) {
    incidents = incidents.filter(i => i.resource_id === parseInt(resourceId, 10));
  }

  return incidents.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export async function getIncidentById(id) {
  const rows = await query('SELECT * FROM incidents');
  const incident = rows.find(i => i.id === parseInt(id, 10));
  if (!incident) {
    const error = new Error('Incident report not found.');
    error.statusCode = 404;
    throw error;
  }
  return incident;
}

export async function updateIncident(id, adminId, { status, resolution_notes }, ipAddress) {
  const incident = await getIncidentById(id);

  await query(
    `UPDATE incidents SET status = ?, resolution_notes = ?, resolved_by = ?, resolved_at = NOW() WHERE id = ?`,
    [status, resolution_notes, adminId, id]
  );

  await logAudit({
    userId: adminId,
    action: 'INCIDENT_RESOLVED',
    entityType: 'INCIDENT',
    entityId: id,
    details: { status, resolution_notes },
    ipAddress,
  });

  return getIncidentById(id);
}
