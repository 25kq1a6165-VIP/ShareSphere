import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';
import { initializeDatabase, query } from '../src/config/db.js';
import { runSchedulerCheck } from '../src/services/bookingScheduler.js';

let server;
let baseUrl;
let studentToken;
let adminToken;
let ownerToken;
let timeIndex = 1;

function getUniqueTimeRange() {
  const start = Date.now() + 1000000000 + (timeIndex++ * 86400000);
  return {
    startTime: new Date(start).toISOString(),
    endTime: new Date(start + 3600000).toISOString()
  };
}

test.before(async () => {
  await initializeDatabase();
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });

  // Login as student
  const studentRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'student@sharesphere.edu', password: 'Password123!' }),
  });
  const studentData = await studentRes.json();
  studentToken = studentData.data.token;

  // Login as admin
  const adminRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@sharesphere.edu', password: 'Password123!' }),
  });
  const adminData = await adminRes.json();
  adminToken = adminData.data.token;

  // Login as owner
  const ownerRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'owner@sharesphere.edu', password: 'Password123!' }),
  });
  const ownerData = await ownerRes.json();
  ownerToken = ownerData.data.token;
});

test.after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('1. Booking Created: Dispatches notifications to BOTH User AND System Admin', async () => {
  const { startTime, endTime } = getUniqueTimeRange();

  // Create booking request
  const bookingRes = await fetch(`${baseUrl}/api/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${studentToken}`,
    },
    body: JSON.stringify({
      resource_id: 1,
      start_time: startTime,
      end_time: endTime,
      purpose: 'Master Notification System Validation Test Run',
      attendees_count: 2,
    }),
  });
  assert.equal(bookingRes.status, 201);
  const bookingJson = await bookingRes.json();
  const createdBookingId = bookingJson.data.id;
  assert.ok(createdBookingId);

  // Check student notifications
  const studentNotifsRes = await fetch(`${baseUrl}/api/notifications?category=bookings`, {
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  assert.equal(studentNotifsRes.status, 200);
  const studentNotifsJson = await studentNotifsRes.json();
  const studentBookingNotif = studentNotifsJson.data.find(
    (n) => n.booking_id === createdBookingId && n.event_type === 'booking_created'
  );
  assert.ok(studentBookingNotif, 'Student should receive booking_created notification');
  assert.ok(studentBookingNotif.title.includes('Booking Request Submitted'));
  assert.ok(studentBookingNotif.message.includes(`Booking #${createdBookingId}`));

  // Check admin notifications (admin must receive notification for the same event)
  const adminNotifsRes = await fetch(`${baseUrl}/api/notifications?category=bookings`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert.equal(adminNotifsRes.status, 200);
  const adminNotifsJson = await adminNotifsRes.json();
  const adminBookingNotif = adminNotifsJson.data.find(
    (n) => n.booking_id === createdBookingId && n.event_type === 'booking_created'
  );
  assert.ok(adminBookingNotif, 'Admin should receive notification for newly created booking');
  assert.ok(adminBookingNotif.title.includes('New Booking Request'));
  assert.ok(adminBookingNotif.message.includes(`Booking #${createdBookingId}`));
});

test('2. Booking Approved: Notifies BOTH User AND Admin', async () => {
  // First create a free resource booking that stays pending approval
  const { startTime, endTime } = getUniqueTimeRange();

  const bookingRes = await fetch(`${baseUrl}/api/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${studentToken}`,
    },
    body: JSON.stringify({
      resource_id: 2, // PCR cycler (free, requires approval)
      start_time: startTime,
      end_time: endTime,
      purpose: 'PCR Test run for approval notification verification',
    }),
  });
  const bookingJson = await bookingRes.json();
  const bookingId = bookingJson.data.id;

  // Approve as owner
  const approveRes = await fetch(`${baseUrl}/api/bookings/${bookingId}/approve`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${ownerToken}` },
  });
  assert.equal(approveRes.status, 200);

  // Check student received approval notification
  const studentNotifsRes = await fetch(`${baseUrl}/api/notifications?category=bookings`, {
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  const studentNotifsJson = await studentNotifsRes.json();
  const studentApprovalNotif = studentNotifsJson.data.find(
    (n) => n.booking_id === bookingId && n.event_type === 'booking_approved'
  );
  assert.ok(studentApprovalNotif, 'Student must receive booking_approved notification');

  // Check admin also received notification
  const adminNotifsRes = await fetch(`${baseUrl}/api/notifications?category=bookings`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const adminNotifsJson = await adminNotifsRes.json();
  const adminApprovalNotif = adminNotifsJson.data.find(
    (n) => n.booking_id === bookingId && n.event_type === 'booking_approved'
  );
  assert.ok(adminApprovalNotif, 'Admin must receive booking_approved notification');
});

test('3. Booking Rejected: Notifies BOTH with reason', async () => {
  const { startTime, endTime } = getUniqueTimeRange();

  const bookingRes = await fetch(`${baseUrl}/api/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${studentToken}`,
    },
    body: JSON.stringify({
      resource_id: 2,
      start_time: startTime,
      end_time: endTime,
      purpose: 'Rejection test run',
    }),
  });
  const bookingJson = await bookingRes.json();
  const bookingId = bookingJson.data.id;

  const rejectionReason = 'Laser alignment scheduled during this maintenance window';

  // Reject as admin
  const rejectRes = await fetch(`${baseUrl}/api/bookings/${bookingId}/reject`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ reason: rejectionReason }),
  });
  assert.equal(rejectRes.status, 200);

  // Check student notification contains rejection reason
  const studentNotifsRes = await fetch(`${baseUrl}/api/notifications`, {
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  const studentNotifsJson = await studentNotifsRes.json();
  const studentRejectNotif = studentNotifsJson.data.find(
    (n) => n.booking_id === bookingId && n.event_type === 'booking_rejected'
  );
  assert.ok(studentRejectNotif, 'Student must receive rejection notification');
  assert.ok(studentRejectNotif.message.includes(rejectionReason));

  // Check admin notification contains rejection
  const adminNotifsRes = await fetch(`${baseUrl}/api/notifications`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const adminNotifsJson = await adminNotifsRes.json();
  const adminRejectNotif = adminNotifsJson.data.find(
    (n) => n.booking_id === bookingId && n.event_type === 'booking_rejected'
  );
  assert.ok(adminRejectNotif, 'Admin must receive rejection notification');
  assert.ok(adminRejectNotif.message.includes(rejectionReason));
});

test('4. Booking Cancelled: Notifies BOTH User and Admin with reason', async () => {
  const { startTime, endTime } = getUniqueTimeRange();

  const bookingRes = await fetch(`${baseUrl}/api/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${studentToken}`,
    },
    body: JSON.stringify({
      resource_id: 2,
      start_time: startTime,
      end_time: endTime,
      purpose: 'Cancellation test run',
    }),
  });
  const bookingJson = await bookingRes.json();
  const bookingId = bookingJson.data.id;

  const cancelReason = 'Project funding schedule shifted to next month';

  const cancelRes = await fetch(`${baseUrl}/api/bookings/${bookingId}/cancel`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${studentToken}`,
    },
    body: JSON.stringify({ reason: cancelReason }),
  });
  assert.equal(cancelRes.status, 200);

  // Verify student notification
  const studentNotifsRes = await fetch(`${baseUrl}/api/notifications`, {
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  const studentNotifsJson = await studentNotifsRes.json();
  const studentCancelNotif = studentNotifsJson.data.find(
    (n) => n.booking_id === bookingId && n.event_type === 'booking_cancelled'
  );
  assert.ok(studentCancelNotif, 'Student must receive cancellation notification');
  assert.ok(studentCancelNotif.message.includes(cancelReason));

  // Verify admin notification
  const adminNotifsRes = await fetch(`${baseUrl}/api/notifications`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const adminNotifsJson = await adminNotifsRes.json();
  const adminCancelNotif = adminNotifsJson.data.find(
    (n) => n.booking_id === bookingId && n.event_type === 'booking_cancelled'
  );
  assert.ok(adminCancelNotif, 'Admin must receive cancellation notification');
  assert.ok(adminCancelNotif.message.includes(cancelReason));
});

test('5. Autonomous Scheduler: 30m & 5m Reminders, Expired, and Overdue Processing', async () => {
  const now = Date.now();

  // Create booking starting in 20 minutes (triggers 30m reminder)
  const b30Start = new Date(now + 20 * 60 * 1000).toISOString();
  const b30End = new Date(now + 80 * 60 * 1000).toISOString();

  // Create booking starting in 3 minutes (triggers 5m reminder)
  const b5Start = new Date(now + 3 * 60 * 1000).toISOString();
  const b5End = new Date(now + 63 * 60 * 1000).toISOString();

  // Create booking that ended 10 minutes ago but never checked in (triggers expired transition)
  const bExpStart = new Date(now - 70 * 60 * 1000).toISOString();
  const bExpEnd = new Date(now - 10 * 60 * 1000).toISOString();

  // Insert test bookings with full parameters
  const insert30 = await query(
    `INSERT INTO bookings (
      resource_id, user_id, start_time, end_time, total_amount,
      advance_amount, remaining_amount, advance_paid, final_paid,
      visit_id, purpose, attendees_count, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [1, 4, b30Start, b30End, 100, 50, 50, 1, 0, null, 'Test 30m reminder booking', 1, 'approved']
  );
  const id30 = insert30.insertId;

  const insert5 = await query(
    `INSERT INTO bookings (
      resource_id, user_id, start_time, end_time, total_amount,
      advance_amount, remaining_amount, advance_paid, final_paid,
      visit_id, purpose, attendees_count, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [1, 4, b5Start, b5End, 100, 50, 50, 1, 0, null, 'Test 5m reminder booking', 1, 'approved']
  );
  const id5 = insert5.insertId;

  const insertExp = await query(
    `INSERT INTO bookings (
      resource_id, user_id, start_time, end_time, total_amount,
      advance_amount, remaining_amount, advance_paid, final_paid,
      visit_id, purpose, attendees_count, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [1, 4, bExpStart, bExpEnd, 100, 50, 50, 1, 0, null, 'Test expired booking', 1, 'approved']
  );
  const idExp = insertExp.insertId;

  // Run scheduler cycle
  const schedulerSummary = await runSchedulerCheck();
  assert.ok(schedulerSummary);

  // Check 30m reminder was sent
  const studentNotifsRes = await fetch(`${baseUrl}/api/notifications?category=reminders`, {
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  const studentNotifsJson = await studentNotifsRes.json();
  const notif30 = studentNotifsJson.data.find((n) => n.booking_id === id30 && n.event_type === 'reminder_30m');
  assert.ok(notif30, '30m reminder must be sent to student');

  // Check admin also received 30m reminder
  const adminNotifsRes = await fetch(`${baseUrl}/api/notifications?category=reminders`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const adminNotifsJson = await adminNotifsRes.json();
  const adminNotif30 = adminNotifsJson.data.find((n) => n.booking_id === id30 && n.event_type === 'reminder_30m');
  assert.ok(adminNotif30, '30m reminder must be sent to admin');

  // Check 5m reminder was sent
  const notif5 = studentNotifsJson.data.find((n) => n.booking_id === id5 && n.event_type === 'reminder_5m');
  assert.ok(notif5, '5m reminder must be sent to student');

  // Check expired booking status was transitioned and not left active
  const expRows = await query('SELECT status, expired_notified FROM bookings WHERE id = ?', [idExp]);
  assert.ok(expRows.length > 0);
  assert.notEqual(expRows[0].status, 'approved', 'Expired booking must no longer be marked as active');
  assert.ok(['completed', 'usage_completed', 'expired'].includes(expRows[0].status));
});

test('6. In-App Notification Center: Unread count, Category filters, and Preferences', async () => {
  // Check unread count endpoint
  const countRes = await fetch(`${baseUrl}/api/notifications/unread-count`, {
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  assert.equal(countRes.status, 200);
  const countJson = await countRes.json();
  assert.equal(countJson.success, true);
  assert.equal(typeof countJson.count, 'number');

  // Check preferences endpoint
  const prefsRes = await fetch(`${baseUrl}/api/notifications/preferences`, {
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  assert.equal(prefsRes.status, 200);
  const prefsJson = await prefsRes.json();
  assert.equal(prefsJson.success, true);
  assert.ok(prefsJson.data);

  // Update preferences
  const updateRes = await fetch(`${baseUrl}/api/notifications/preferences`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${studentToken}`,
    },
    body: JSON.stringify({
      reminder_time_1: 45,
      reminder_time_2: 10,
      browser_push: true,
    }),
  });
  assert.equal(updateRes.status, 200);
  const updateJson = await updateRes.json();
  assert.equal(updateJson.success, true);
  assert.equal(updateJson.data.reminder_time_1, 45);
  assert.equal(updateJson.data.reminder_time_2, 10);
});

test('7. Mark as Read and Mark All as Read', async () => {
  // Get an unread notification for student
  const notifsRes = await fetch(`${baseUrl}/api/notifications?category=unread`, {
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  const notifsJson = await notifsRes.json();
  if (notifsJson.data.length > 0) {
    const notifId = notifsJson.data[0].id;
    // Mark single as read
    const readRes = await fetch(`${baseUrl}/api/notifications/${notifId}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert.equal(readRes.status, 200);
  }

  // Mark all as read
  const readAllRes = await fetch(`${baseUrl}/api/notifications/read-all`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  assert.equal(readAllRes.status, 200);

  // Verify unread count is now 0
  const finalCountRes = await fetch(`${baseUrl}/api/notifications/unread-count`, {
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  const finalCountJson = await finalCountRes.json();
  assert.equal(finalCountJson.count, 0);
});
