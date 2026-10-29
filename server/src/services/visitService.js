import { query, getStore } from '../config/db.js';
import { sendNotification } from './notificationService.js';
import { logAudit } from './auditService.js';
import { getResourceById } from './resourceService.js';

// Check if a visit appointment conflicts with an existing requested/approved visit
export async function checkVisitOverlap(resourceId, preferredDate, preferredTime, excludeVisitId = null) {
  const allVisits = await query('SELECT * FROM visits');
  const conflicting = allVisits.filter(v => {
    if (v.resource_id !== Number(resourceId)) return false;
    if (excludeVisitId && v.id === Number(excludeVisitId)) return false;
    if (v.status !== 'visit_requested' && v.status !== 'visit_approved') return false;

    const vDate = v.preferred_date;
    const vTime = v.preferred_time;
    return vDate === preferredDate && vTime === preferredTime;
  });

  return conflicting.length > 0;
}

export async function createVisitRequest(userId, data, ipAddress) {
  const resource = await getResourceById(data.resource_id);
  if (!resource || resource.status !== 'active') {
    const err = new Error('Resource is not available for physical inspection.');
    err.statusCode = 400;
    throw err;
  }

  // Conflict prevention
  const hasConflict = await checkVisitOverlap(resource.id, data.preferred_date, data.preferred_time);
  if (hasConflict) {
    const err = new Error('A visit is already scheduled for this resource at that time. Please pick another time slot.');
    err.statusCode = 409;
    throw err;
  }

  // Fetch visitor user details
  const users = await query('SELECT id, full_name, email, phone FROM users WHERE id = ?', [userId]);
  const user = users[0] || {};

  const result = await query(
    `INSERT INTO visits (
      resource_id, user_id, owner_id, preferred_date, preferred_time,
      notes, status, user_name, user_email, user_phone, resource_title, resource_location
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      resource.id,
      userId,
      resource.owner_id,
      data.preferred_date,
      data.preferred_time,
      data.notes || 'Physical inspection before reservation',
      'visit_requested',
      user.full_name || 'Campus Researcher',
      user.email || '',
      user.phone || '',
      resource.title,
      resource.location
    ]
  );

  const visitId = result.insertId;

  // Notify visitor (student)
  await sendNotification({
    userId,
    recipientRole: 'student',
    title: 'Physical Visit Request Submitted',
    message: `Your inspection visit for "${resource.title}" on ${data.preferred_date} at ${data.preferred_time} is awaiting owner confirmation.`,
    type: 'visit_request',
    linkUrl: '/dashboard?tab=visits'
  });

  // Notify owner
  await sendNotification({
    userId: resource.owner_id,
    recipientRole: 'owner',
    title: 'New Physical Visit Request',
    message: `${user.full_name || 'A researcher'} requested an in-person visit for "${resource.title}" on ${data.preferred_date} at ${data.preferred_time}.`,
    type: 'visit_request',
    linkUrl: '/owner/requests?tab=visits'
  });

  // Notify administrator
  await sendNotification({
    userId: 1,
    recipientRole: 'admin',
    title: 'New Physical Inspection Request',
    message: `${user.full_name || 'A student'} requested to inspect "${resource.title}" on ${data.preferred_date} at ${data.preferred_time}.`,
    type: 'visit_request',
    linkUrl: '/admin/bookings'
  });

  await logAudit({
    userId,
    action: 'REQUEST_PHYSICAL_VISIT',
    entityType: 'VISIT',
    entityId: visitId,
    details: { resource_id: resource.id, preferred_date: data.preferred_date, preferred_time: data.preferred_time },
    ipAddress
  });

  return getVisitById(visitId);
}

export async function getVisitById(id) {
  const visits = await query('SELECT * FROM visits WHERE id = ?', [id]);
  if (!visits || visits.length === 0) {
    const err = new Error('Physical visit request not found.');
    err.statusCode = 404;
    throw err;
  }
  const visit = visits[0];
  const resource = await getResourceById(visit.resource_id);
  return { ...visit, resource };
}

export async function getMyVisits(userId) {
  const visits = await query('SELECT * FROM visits WHERE user_id = ? ORDER BY created_at DESC', [userId]);
  return visits;
}

export async function getOwnerVisits(ownerId, statusFilter = null) {
  let sql = 'SELECT * FROM visits WHERE owner_id = ?';
  const params = [ownerId];
  if (statusFilter && statusFilter !== 'all') {
    sql += ' AND status = ?';
    params.push(statusFilter);
  }
  sql += ' ORDER BY created_at DESC';
  const visits = await query(sql, params);
  return visits;
}

export async function approveVisit(visitId, ownerId) {
  const visit = await getVisitById(visitId);
  if (visit.owner_id !== Number(ownerId)) {
    const err = new Error('You are not authorized to manage visits for this resource.');
    err.statusCode = 403;
    throw err;
  }

  await query('UPDATE visits SET status = ?, updated_at = NOW() WHERE id = ?', ['visit_approved', visitId]);

  await sendNotification({
    userId: visit.user_id,
    title: 'Physical Visit Approved!',
    message: `Your physical inspection of "${visit.resource_title}" on ${visit.preferred_date} at ${visit.preferred_time} has been approved.`,
    type: 'visit_approved',
    linkUrl: '/dashboard?tab=visits'
  });

  await sendNotification({
    userId: 1,
    recipientRole: 'admin',
    title: 'Physical Visit Approved',
    message: `Inspection for "${visit.resource_title}" (${visit.user_name}) was approved for ${visit.preferred_date} at ${visit.preferred_time}.`,
    type: 'visit_approved',
    linkUrl: '/admin/bookings'
  });

  return getVisitById(visitId);
}

export async function rejectVisit(visitId, ownerId, reason = 'Facility unavailable at requested time') {
  const visit = await getVisitById(visitId);
  if (visit.owner_id !== Number(ownerId)) {
    const err = new Error('You are not authorized to manage visits for this resource.');
    err.statusCode = 403;
    throw err;
  }

  await query(
    'UPDATE visits SET status = ?, rejection_reason = ?, updated_at = NOW() WHERE id = ?',
    ['visit_rejected', reason, visitId]
  );

  await sendNotification({
    userId: visit.user_id,
    title: 'Visit Request Declined',
    message: `Your visit for "${visit.resource_title}" was declined: ${reason}`,
    type: 'visit_rejected',
    linkUrl: '/dashboard?tab=visits'
  });

  await sendNotification({
    userId: 1,
    recipientRole: 'admin',
    title: 'Physical Visit Declined',
    message: `Visit for "${visit.resource_title}" (${visit.user_name}) was declined: ${reason}`,
    type: 'visit_rejected',
    linkUrl: '/admin/bookings'
  });

  return getVisitById(visitId);
}

export async function rescheduleVisit(visitId, ownerId, { newDate, newTime, notes }) {
  const visit = await getVisitById(visitId);
  if (visit.owner_id !== Number(ownerId)) {
    const err = new Error('You are not authorized to manage visits for this resource.');
    err.statusCode = 403;
    throw err;
  }

  await query(
    `UPDATE visits SET
      status = 'visit_rescheduled',
      rescheduled_date = ?,
      rescheduled_time = ?,
      rescheduled_notes = ?,
      updated_at = NOW()
    WHERE id = ?`,
    [newDate, newTime, notes || 'Owner proposed an alternate time', visitId]
  );

  await sendNotification({
    userId: visit.user_id,
    title: 'Visit Rescheduled by Facility Host',
    message: `The host for "${visit.resource_title}" proposed a new visit time: ${newDate} at ${newTime}.`,
    type: 'visit_rescheduled',
    linkUrl: '/dashboard?tab=visits'
  });

  await sendNotification({
    userId: 1,
    recipientRole: 'admin',
    title: 'Visit Rescheduled',
    message: `Physical visit for "${visit.resource_title}" was rescheduled to ${newDate} at ${newTime}.`,
    type: 'visit_rescheduled',
    linkUrl: '/admin/bookings'
  });

  return getVisitById(visitId);
}

export async function completeVisit(visitId, userId, role) {
  const visit = await getVisitById(visitId);
  if (role !== 'owner' && role !== 'admin' && visit.user_id !== Number(userId)) {
    const err = new Error('Not authorized to complete this visit.');
    err.statusCode = 403;
    throw err;
  }

  await query('UPDATE visits SET status = ?, updated_at = NOW() WHERE id = ?', ['visit_completed', visitId]);

  // Notify visitor to make post-visit decision
  await sendNotification({
    userId: visit.user_id,
    title: 'Visit Completed — How was your inspection?',
    message: `Your physical inspection of "${visit.resource_title}" is marked complete. Please choose: "Interested — Continue to Booking" or "Not Interested — Cancel Request".`,
    type: 'visit_completed',
    linkUrl: '/dashboard?tab=visits'
  });

  return getVisitById(visitId);
}

export async function recordVisitDecision(visitId, userId, { outcome, notes }) {
  const visit = await getVisitById(visitId);
  if (visit.user_id !== Number(userId)) {
    const err = new Error('Only the visiting researcher can record the post-visit decision.');
    err.statusCode = 403;
    throw err;
  }

  if (outcome === 'not_interested') {
    // Option A: Not Interested -> Cancel request with zero charge
    await query(
      `UPDATE visits SET
        status = 'cancelled_after_visit',
        outcome = 'not_interested',
        outcome_notes = ?,
        updated_at = NOW()
      WHERE id = ?`,
      [notes || 'User decided not to proceed after physical inspection', visitId]
    );

    // Notify owner
    await sendNotification({
      userId: visit.owner_id,
      title: 'Visit Outcome: Cancelled After Inspection',
      message: `${visit.user_name} completed the visit for "${visit.resource_title}" and decided not to proceed to booking. Request is closed.`,
      type: 'visit_cancelled',
      linkUrl: '/owner/requests?tab=visits'
    });
  } else {
    // Option B: Interested -> Proceed to Booking
    await query(
      `UPDATE visits SET
        outcome = 'interested',
        outcome_notes = ?,
        updated_at = NOW()
      WHERE id = ?`,
      [notes || 'User confirmed interest after physical inspection', visitId]
    );

    await sendNotification({
      userId: visit.owner_id,
      title: 'Visit Outcome: Interested in Booking!',
      message: `${visit.user_name} completed the physical visit for "${visit.resource_title}" and is proceeding to booking with 50% advance payment.`,
      type: 'visit_interested',
      linkUrl: '/owner/requests?tab=visits'
    });
  }

  return getVisitById(visitId);
}

