import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';
import { initializeDatabase } from '../src/config/db.js';

let server;
let baseUrl;

test.before(async () => {
  await initializeDatabase();
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

test.after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('GET /api/health should return healthy status and database info', async () => {
  const res = await fetch(`${baseUrl}/api/health`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.status, 'healthy');
  assert.ok(data.database);
});

test('POST /api/auth/login with valid demo student credentials', async () => {
  const res = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'student@sharesphere.edu',
      password: 'Password123!',
    }),
  });
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.success, true);
  assert.equal(json.data.user.role, 'student');
  assert.ok(json.data.token);
});

test('POST /api/auth/login with invalid password should fail (401)', async () => {
  const res = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'student@sharesphere.edu',
      password: 'WrongPassword123!',
    }),
  });
  assert.equal(res.status, 401);
  const json = await res.json();
  assert.equal(json.success, false);
});

test('POST /api/auth/register prevents admin role selection during public registration', async () => {
  const res = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      full_name: 'Hacker User',
      email: 'hacker@test.edu',
      password: 'Password123!',
      role: 'admin', // Forbidden!
    }),
  });
  assert.equal(res.status, 400);
  const json = await res.json();
  assert.equal(json.success, false);
});

test('GET /api/resources returns active resources with search and filter capability', async () => {
  const res = await fetch(`${baseUrl}/api/resources?category=Laboratory+Equipment`);
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.success, true);
  assert.ok(Array.isArray(json.data));
  assert.ok(json.data.length > 0);
  assert.ok(json.data.some(r => r.title.includes('Microscope')));
});

test('GET /api/resources/:id returns single resource with full details', async () => {
  const res = await fetch(`${baseUrl}/api/resources/1`);
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.success, true);
  assert.equal(json.data.id, 1);
  assert.ok(json.data.owner_name);
});

test('Protected route GET /api/auth/me rejects unauthenticated request', async () => {
  const res = await fetch(`${baseUrl}/api/auth/me`);
  assert.equal(res.status, 401);
});

test('Full booking workflow: Request -> Owner Approval -> Overlap Prevention', async () => {
  // 1. Login as student
  const studentLogin = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'student@sharesphere.edu', password: 'Password123!' }),
  });
  const { data: { token: studentToken } } = await studentLogin.json();

  // 2. Login as owner
  const ownerLogin = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'owner@sharesphere.edu', password: 'Password123!' }),
  });
  const { data: { token: ownerToken } } = await ownerLogin.json();

  // 3. Request a new booking for Resource 1 (FE-SEM)
  const offsetDays = 14 + Math.floor(Math.random() * 80);
  const futureStart = new Date(Date.now() + offsetDays * 24 * 3600 * 1000);
  futureStart.setHours(10, 0, 0, 0);
  const futureEnd = new Date(futureStart.getTime() + 2 * 3600 * 1000);

  const bookRes = await fetch(`${baseUrl}/api/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentToken}`,
    },
    body: JSON.stringify({
      resource_id: 1,
      start_time: futureStart.toISOString(),
      end_time: futureEnd.toISOString(),
      purpose: 'Nanoparticle surface cross-section scan',
      attendees_count: 1,
    }),
  });
  assert.equal(bookRes.status, 201);
  const bookJson = await bookRes.json();
  const newBookingId = bookJson.data.id;
  assert.ok(newBookingId);

  // 4. Owner approves booking
  const approveRes = await fetch(`${baseUrl}/api/bookings/${newBookingId}/approve`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${ownerToken}` },
  });
  assert.equal(approveRes.status, 200);
  const approveJson = await approveRes.json();
  assert.equal(approveJson.data.status, 'approved');

  // 5. Overlap Prevention: Attempt to book the EXACT SAME time slot should be rejected
  const conflictRes = await fetch(`${baseUrl}/api/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentToken}`,
    },
    body: JSON.stringify({
      resource_id: 1,
      start_time: futureStart.toISOString(),
      end_time: futureEnd.toISOString(),
      purpose: 'Conflicting simultaneous reservation test',
      attendees_count: 1,
    }),
  });
  assert.equal(conflictRes.status, 409);
  const conflictJson = await conflictRes.json();
  assert.equal(conflictJson.success, false);
});

test('Physical visit request, conflict check, and 50/50 payment calculation workflow', async () => {
  // 1. Authenticate student & owner
  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'student@sharesphere.edu', password: 'Password123!' }),
  });
  const studentToken = (await loginRes.json()).data.token;

  const ownerLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'owner@sharesphere.edu', password: 'Password123!' }),
  });
  const ownerToken = (await ownerLoginRes.json()).data.token;

  const testVisitDate = new Date(Date.now() + (30 + Math.floor(Math.random() * 80)) * 24 * 3600 * 1000).toISOString().split('T')[0];
  const testVisitTime = `${10 + Math.floor(Math.random() * 6)}:00`;

  // 2. Student requests physical visit
  const visitRes = await fetch(`${baseUrl}/api/visits`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentToken}`,
    },
    body: JSON.stringify({
      resource_id: 1,
      preferred_date: testVisitDate,
      preferred_time: testVisitTime,
      notes: 'Verifying sample holder dimensions before booking'
    }),
  });
  assert.equal(visitRes.status, 201);
  const visitJson = await visitRes.json();
  assert.equal(visitJson.success, true);
  const visitId = visitJson.data.id;
  assert.ok(visitId);

  // 3. Prevent duplicate visit at exact same time slot
  const duplicateVisitRes = await fetch(`${baseUrl}/api/visits`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentToken}`,
    },
    body: JSON.stringify({
      resource_id: 1,
      preferred_date: testVisitDate,
      preferred_time: testVisitTime,
      notes: 'Second simultaneous request'
    }),
  });
  assert.equal(duplicateVisitRes.status, 409);

  // 4. Owner approves physical visit
  const approveVisitRes = await fetch(`${baseUrl}/api/visits/${visitId}/approve`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${ownerToken}` },
  });
  assert.equal(approveVisitRes.status, 200);

  // 5. Test 50/50 server-side calculation (₹2,000 -> ₹1,000 advance + ₹1,000 remaining)
  const calcRes = await fetch(`${baseUrl}/api/payments/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      resource_id: 1,
      start_time: '2026-12-20T10:00:00.000Z',
      end_time: '2026-12-20T12:00:00.000Z',
    }),
  });
  assert.equal(calcRes.status, 200);
  const calcJson = await calcRes.json();
  assert.equal(calcJson.data.advance_percentage, 50);
  assert.equal(calcJson.data.remaining_percentage, 50);
  assert.equal(calcJson.data.advance_amount + calcJson.data.remaining_amount, calcJson.data.total_amount);
});
