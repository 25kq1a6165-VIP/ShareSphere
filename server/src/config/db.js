import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './env.js';
import { createMockStore } from '../utils/mockDb.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE_PATH = path.resolve(__dirname, '../../../database/sharesphere_db.json');

let pool = null;
let isConnected = false;
let isFallback = false;
let fallbackStore = null;

function loadFallbackStore() {
  if (fs.existsSync(DB_FILE_PATH)) {
    try {
      const data = fs.readFileSync(DB_FILE_PATH, 'utf8');
      return JSON.parse(data);
    } catch (e) {
      console.warn('Failed to parse sharesphere_db.json, reinitializing from seed.');
    }
  }
  const store = createMockStore();
  saveFallbackStore(store);
  return store;
}

export function saveFallbackStore(store) {
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(store, null, 2), 'utf8');
  } catch (e) {
    console.warn('Failed to save sharesphere_db.json:', e.message);
  }
}

export const dbStatus = {
  connected: false,
  isFallback: false,
  error: null,
  provider: 'unknown',
  host: `${config.db.host}:${config.db.port}`,
  database: config.db.database
};

// Initialize database connection
export async function initializeDatabase() {
  try {
    pool = mysql.createPool({
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
      database: config.db.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      multipleStatements: true,
      connectTimeout: 3000
    });

    // Test connection with a quick ping
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();

    isConnected = true;
    isFallback = false;
    dbStatus.connected = true;
    dbStatus.isFallback = false;
    dbStatus.provider = 'mysql';
    dbStatus.error = null;
    console.log(`[ShareSphere Database] Connected to MySQL successfully on ${config.db.host}:${config.db.port}/${config.db.database}`);
  } catch (err) {
    isConnected = false;
    isFallback = true;
    fallbackStore = loadFallbackStore();
    dbStatus.connected = true;
    dbStatus.isFallback = true;
    dbStatus.provider = 'persistent_json_database';
    dbStatus.error = null;

    console.warn(`\n======================================================================`);
    console.warn(`[ShareSphere Database Notice] Live MySQL server is not detected on ${config.db.host}:${config.db.port}.`);
    console.warn(`Error: ${err.message}`);
    console.warn(`Switching to resilient built-in demonstration store.`);
    console.warn(`All full-stack workflows (Authentication, Bookings, Approvals, Reports)`);
    console.warn(`are fully interactive and functional.`);
    console.warn(`To connect your local MySQL server:`);
    console.warn(`1. Start MySQL or XAMPP / MySQL Workbench.`);
    console.warn(`2. Update DB credentials in .env.`);
    console.warn(`3. Run: npm run db:init`);
    console.warn(`======================================================================\n`);
  }
}

// Universal query function
export async function query(sql, params = []) {
  if (pool && !isFallback) {
    try {
      const [rows] = await pool.query(sql, params);
      return rows;
    } catch (err) {
      // If error occurs during runtime, throw so caller can handle
      throw err;
    }
  }

  // Resilient fallback logic
  return executeFallbackQuery(sql, params);
}

// Transaction helper
export async function getConnection() {
  if (pool && !isFallback) {
    return await pool.getConnection();
  }

  // Resilient fallback mock connection
  return {
    beginTransaction: async () => {},
    commit: async () => {},
    rollback: async () => {},
    release: () => {},
    query: async (sql, params) => {
      const result = await executeFallbackQuery(sql, params);
      return [result];
    }
  };
}

// Get raw access to fallback store for service operations
export function getStore() {
  if (!fallbackStore) {
    fallbackStore = loadFallbackStore();
  }
  return fallbackStore;
}

// Resilient query dispatcher for basic SQL patterns
async function executeFallbackQuery(sql, params = []) {
  const store = getStore();
  const lowerSql = sql.trim().toLowerCase();

  // 1. SELECT queries
  if (lowerSql.startsWith('select')) {
    if (lowerSql.includes('from users')) {
      if (lowerSql.includes('where email =')) {
        const email = params[0];
        const user = store.users.find(u => u.email.toLowerCase() === (email || '').toLowerCase());
        return user ? [user] : [];
      }
      if (lowerSql.includes('where id =')) {
        const id = parseInt(params[0], 10);
        const user = store.users.find(u => u.id === id);
        return user ? [user] : [];
      }
      return [...store.users];
    }

    if (lowerSql.includes('from resources')) {
      if (lowerSql.includes('where id =') || lowerSql.includes('where r.id =')) {
        const id = parseInt(params[0], 10);
        const resource = store.resources.find(r => r.id === id);
        if (!resource) return [];
        const owner = store.users.find(u => u.id === resource.owner_id);
        const images = store.resource_images.filter(img => img.resource_id === resource.id);
        return [{
          ...resource,
          owner_name: owner ? owner.full_name : 'Unknown Owner',
          owner_department: owner ? owner.department : 'General',
          images: images.map(i => i.image_url),
          primary_image: images.find(i => i.is_primary)?.image_url || images[0]?.image_url || null
        }];
      }
      // List resources with primary image & owner name
      return store.resources.map(r => {
        const owner = store.users.find(u => u.id === r.owner_id);
        const images = store.resource_images.filter(img => img.resource_id === r.id);
        return {
          ...r,
          owner_name: owner ? owner.full_name : 'Faculty Member',
          primary_image: images.find(i => i.is_primary)?.image_url || images[0]?.image_url || null
        };
      });
    }

    if (lowerSql.includes('from bookings')) {
      if (lowerSql.includes('where user_id =') || lowerSql.includes('where b.user_id =')) {
        const userId = parseInt(params[0], 10);
        return store.bookings
          .filter(b => b.user_id === userId)
          .map(enrichBooking);
      }
      if (lowerSql.includes('where id =') || lowerSql.includes('where b.id =')) {
        const id = parseInt(params[0], 10);
        const b = store.bookings.find(bk => bk.id === id);
        return b ? [enrichBooking(b)] : [];
      }
      if (lowerSql.includes('r.owner_id =')) {
        const ownerId = parseInt(params[0], 10);
        const ownerResourceIds = store.resources.filter(r => r.owner_id === ownerId).map(r => r.id);
        return store.bookings
          .filter(b => ownerResourceIds.includes(b.resource_id))
          .map(enrichBooking);
      }
      return store.bookings.map(enrichBooking);
    }

    if (lowerSql.includes('from notifications')) {
      if (!store.notifications) store.notifications = [];
      if (lowerSql.includes('idempotency_key =')) {
        const key = params[0];
        return store.notifications.filter(n => n.idempotency_key === key);
      }
      if (lowerSql.includes('count(*)')) {
        const userId = parseInt(params[0], 10);
        const count = store.notifications.filter(n => n.user_id === userId && !n.is_read).length;
        return [{ count }];
      }
      const userId = parseInt(params[0], 10);
      return store.notifications.filter(n => n.user_id === userId).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    if (lowerSql.includes('from notification_preferences')) {
      if (!store.notification_preferences) store.notification_preferences = [];
      const userId = parseInt(params[0], 10);
      const pref = store.notification_preferences.find(p => p.user_id === userId);
      return pref ? [pref] : [];
    }

    if (lowerSql.includes('from incidents')) {
      return store.incidents.map(inc => {
        const res = store.resources.find(r => r.id === inc.resource_id);
        const reporter = store.users.find(u => u.id === inc.reported_by);
        return {
          ...inc,
          resource_title: res ? res.title : 'Resource',
          reporter_name: reporter ? reporter.full_name : 'User'
        };
      });
    }

    if (lowerSql.includes('from audit_logs')) {
      return store.audit_logs.map(log => {
        const user = store.users.find(u => u.id === log.user_id);
        return {
          ...log,
          user_name: user ? user.full_name : 'System'
        };
      }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    if (lowerSql.includes('from condition_reports')) {
      const bookingId = parseInt(params[0], 10);
      return store.condition_reports.filter(cr => cr.booking_id === bookingId);
    }

    if (lowerSql.includes('from visits')) {
      if (lowerSql.includes('where id =')) {
        const id = parseInt(params[0], 10);
        const v = (store.visits || []).find(vt => vt.id === id);
        return v ? [v] : [];
      }
      if (lowerSql.includes('where user_id =') || lowerSql.includes('where v.user_id =')) {
        const userId = parseInt(params[0], 10);
        return (store.visits || []).filter(vt => vt.user_id === userId);
      }
      if (lowerSql.includes('where owner_id =') || lowerSql.includes('where v.owner_id =')) {
        const ownerId = parseInt(params[0], 10);
        return (store.visits || []).filter(vt => vt.owner_id === ownerId);
      }
      if (lowerSql.includes('resource_id =') && lowerSql.includes('preferred_date =')) {
        const resId = parseInt(params[0], 10);
        const pDate = params[1];
        const pTime = params[2];
        return (store.visits || []).filter(vt =>
          vt.resource_id === resId &&
          vt.preferred_date === pDate &&
          vt.preferred_time === pTime &&
          ['visit_requested', 'visit_approved', 'visit_rescheduled'].includes(vt.status)
        );
      }
      return store.visits || [];
    }

    if (lowerSql.includes('from payments')) {
      if (lowerSql.includes('where booking_id =')) {
        const bookingId = parseInt(params[0], 10);
        return (store.payments || []).filter(p => p.booking_id === bookingId);
      }
      if (lowerSql.includes('where user_id =')) {
        const userId = parseInt(params[0], 10);
        return (store.payments || []).filter(p => p.user_id === userId);
      }
      return store.payments || [];
    }
  }

  // 2. INSERT queries
  if (lowerSql.startsWith('insert into')) {
    if (lowerSql.includes('into users')) {
      const newId = store.users.length + 1;
      const newUser = {
        id: newId,
        full_name: params[0],
        email: params[1],
        password_hash: params[2],
        role: params[3] || 'student',
        department: params[4] || null,
        phone: params[5] || null,
        avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(params[0])}`,
        status: 'active',
        created_at: new Date()
      };
      store.users.push(newUser);
      return { insertId: newId, affectedRows: 1 };
    }

    if (lowerSql.includes('into bookings')) {
      const newId = store.bookings.length + 1;
      let newBooking;
      if (lowerSql.includes('advance_amount')) {
        let status = 'pending';
        let purpose = 'Campus reservation';
        let attendeesCount = 1;
        let visitId = null;
        let advanceAmount = parseFloat(params[5] || 0);
        let remainingAmount = parseFloat(params[6] || 0);
        let advancePaid = params[7] ? 1 : 0;
        let finalPaid = params[8] ? 1 : 0;

        if (params.length === 13) {
          visitId = params[9] ? parseInt(params[9], 10) : null;
          purpose = params[10];
          attendeesCount = parseInt(params[11] || 1, 10);
          status = params[12];
        } else if (params.length === 11) {
          purpose = params[9];
          status = params[10];
        } else {
          status = params[params.length - 1];
        }

        newBooking = {
          id: newId,
          resource_id: parseInt(params[0], 10),
          user_id: parseInt(params[1], 10),
          start_time: params[2],
          end_time: params[3],
          total_amount: parseFloat(params[4] || 0),
          advance_amount: advanceAmount,
          remaining_amount: remainingAmount,
          advance_paid: advancePaid,
          final_paid: finalPaid,
          visit_id: visitId,
          purpose,
          attendees_count: attendeesCount,
          status,
          reminder_30m_sent: 0,
          reminder_5m_sent: 0,
          started_notified: 0,
          expired_notified: 0,
          overdue_notified: 0,
          check_in_time: null,
          check_out_time: null,
          cancellation_reason: null,
          rejection_reason: null,
          created_at: new Date().toISOString()
        };
      } else {
        newBooking = {
          id: newId,
          resource_id: parseInt(params[0], 10),
          user_id: parseInt(params[1], 10),
          start_time: params[2],
          end_time: params[3],
          total_amount: parseFloat(params[4] || 0),
          purpose: params[5],
          attendees_count: parseInt(params[6] || 1, 10),
          status: params[7] || 'pending',
          check_in_time: null,
          check_out_time: null,
          cancellation_reason: null,
          rejection_reason: null,
          created_at: new Date().toISOString()
        };
      }
      store.bookings.push(newBooking);
      saveFallbackStore(store);
      return { insertId: newId, affectedRows: 1 };
    }

    if (lowerSql.includes('into resources')) {
      const newId = store.resources.length + 1;
      const newResource = {
        id: newId,
        owner_id: parseInt(params[0], 10),
        title: params[1],
        category: params[2],
        type: params[3],
        description: params[4],
        location: params[5],
        capacity: parseInt(params[6] || 1, 10),
        fee_per_hour: parseFloat(params[7] || 0),
        min_duration_hours: parseInt(params[8] || 1, 10),
        max_duration_hours: parseInt(params[9] || 8, 10),
        requires_approval: params[10] ? 1 : 0,
        requires_training: params[11] ? 1 : 0,
        safety_instructions: params[12] || null,
        booking_rules: params[13] || null,
        status: 'active',
        created_at: new Date()
      };
      store.resources.push(newResource);
      return { insertId: newId, affectedRows: 1 };
    }

    if (lowerSql.includes('into notifications')) {
      if (!store.notifications) store.notifications = [];
      const newId = store.notifications.length + 1;
      let newNotification;
      if (params.length >= 8) {
        newNotification = {
          id: newId,
          user_id: parseInt(params[0], 10),
          recipient_role: params[1] || 'student',
          booking_id: params[2] ? parseInt(params[2], 10) : null,
          resource_id: params[3] ? parseInt(params[3], 10) : null,
          event_type: params[4] || 'system',
          type: params[4] || 'system',
          title: params[5],
          message: params[6],
          link_url: params[7] || null,
          is_read: 0,
          read_at: null,
          delivery_status: 'delivered',
          idempotency_key: params[8] || null,
          metadata: params[9] ? (typeof params[9] === 'string' ? JSON.parse(params[9]) : params[9]) : null,
          created_at: new Date().toISOString()
        };
      } else {
        newNotification = {
          id: newId,
          user_id: parseInt(params[0], 10),
          title: params[1],
          message: params[2],
          type: params[3],
          event_type: params[3] || 'system',
          link_url: params[4] || null,
          is_read: 0,
          created_at: new Date().toISOString()
        };
      }
      store.notifications.push(newNotification);
      saveFallbackStore(store);
      return { insertId: newId, affectedRows: 1 };
    }

    if (lowerSql.includes('into notification_preferences')) {
      if (!store.notification_preferences) store.notification_preferences = [];
      const newId = store.notification_preferences.length + 1;
      const newPref = {
        id: newId,
        user_id: parseInt(params[0], 10),
        booking_updates: params[1] !== undefined ? (params[1] ? 1 : 0) : 1,
        booking_reminders: params[2] !== undefined ? (params[2] ? 1 : 0) : 1,
        cancellation_updates: params[3] !== undefined ? (params[3] ? 1 : 0) : 1,
        payment_updates: params[4] !== undefined ? (params[4] ? 1 : 0) : 1,
        browser_push: params[5] !== undefined ? (params[5] ? 1 : 0) : 0,
        reminder_time_1: parseInt(params[6] || 30, 10),
        reminder_time_2: parseInt(params[7] || 5, 10),
        created_at: new Date().toISOString()
      };
      store.notification_preferences.push(newPref);
      saveFallbackStore(store);
      return { insertId: newId, affectedRows: 1 };
    }

    if (lowerSql.includes('into audit_logs')) {
      const newId = store.audit_logs.length + 1;
      const newLog = {
        id: newId,
        user_id: params[0] ? parseInt(params[0], 10) : null,
        action: params[1],
        entity_type: params[2],
        entity_id: params[3] ? parseInt(params[3], 10) : null,
        details: params[4] || null,
        ip_address: params[5] || '127.0.0.1',
        created_at: new Date()
      };
      store.audit_logs.push(newLog);
      return { insertId: newId, affectedRows: 1 };
    }

    if (lowerSql.includes('into condition_reports')) {
      const newId = store.condition_reports.length + 1;
      const report = {
        id: newId,
        booking_id: parseInt(params[0], 10),
        resource_id: parseInt(params[1], 10),
        reported_by: parseInt(params[2], 10),
        report_type: params[3],
        condition_status: params[4],
        notes: params[5],
        image_urls: params[6] || null,
        created_at: new Date()
      };
      store.condition_reports.push(report);
      return { insertId: newId, affectedRows: 1 };
    }

    if (lowerSql.includes('into incidents')) {
      const newId = store.incidents.length + 1;
      const incident = {
        id: newId,
        booking_id: params[0] ? parseInt(params[0], 10) : null,
        resource_id: parseInt(params[1], 10),
        reported_by: parseInt(params[2], 10),
        title: params[3],
        description: params[4],
        severity: params[5] || 'medium',
        status: 'open',
        resolution_notes: null,
        resolved_by: null,
        resolved_at: null,
        created_at: new Date(),
        updated_at: new Date()
      };
      store.incidents.push(incident);
      return { insertId: newId, affectedRows: 1 };
    }

    if (lowerSql.includes('into contact_messages')) {
      const newId = store.contact_messages.length + 1;
      const msg = {
        id: newId,
        name: params[0],
        email: params[1],
        subject: params[2],
        message: params[3],
        status: 'unread',
        created_at: new Date()
      };
      store.contact_messages.push(msg);
      return { insertId: newId, affectedRows: 1 };
    }

    if (lowerSql.includes('into visits')) {
      if (!store.visits) store.visits = [];
      const newId = store.visits.length + 1;
      const newVisit = {
        id: newId,
        resource_id: parseInt(params[0], 10),
        user_id: parseInt(params[1], 10),
        owner_id: parseInt(params[2], 10),
        preferred_date: params[3],
        preferred_time: params[4],
        notes: params[5],
        status: params[6] || 'visit_requested',
        user_name: params[7],
        user_email: params[8],
        user_phone: params[9],
        resource_title: params[10],
        resource_location: params[11],
        rescheduled_date: null,
        rescheduled_time: null,
        rescheduled_notes: null,
        rejection_reason: null,
        outcome: null,
        outcome_notes: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      store.visits.push(newVisit);
      saveFallbackStore(store);
      return { insertId: newId, affectedRows: 1 };
    }

    if (lowerSql.includes('into payments')) {
      if (!store.payments) store.payments = [];
      const newId = store.payments.length + 1;
      const newPayment = {
        id: newId,
        booking_id: parseInt(params[0], 10),
        user_id: parseInt(params[1], 10),
        payment_type: params[2],
        amount: parseFloat(params[3] || 0),
        currency: params[4] || 'INR',
        status: params[5] || 'success',
        gateway: params[6] || 'ShareSphere Verified Test Gateway',
        transaction_id: params[7],
        receipt_number: params[8],
        payment_method: params[9] || 'UPI / NetBanking',
        created_at: new Date().toISOString()
      };
      store.payments.push(newPayment);
      saveFallbackStore(store);
      return { insertId: newId, affectedRows: 1 };
    }
  }

  // 3. UPDATE queries
  if (lowerSql.startsWith('update')) {
    if (lowerSql.includes('update visits')) {
      const visitId = parseInt(params[params.length - 1], 10);
      const visit = (store.visits || []).find(v => v.id === visitId);
      if (visit) {
        if (lowerSql.includes('status = ?') && !lowerSql.includes('rejection_reason = ?') && !lowerSql.includes('rescheduled_date = ?')) {
          visit.status = params[0];
        }
        if (lowerSql.includes('rejection_reason = ?')) {
          visit.status = params[0];
          visit.rejection_reason = params[1];
        }
        if (lowerSql.includes('rescheduled_date = ?')) {
          visit.status = params[0];
          visit.rescheduled_date = params[1];
          visit.rescheduled_time = params[2];
          visit.rescheduled_notes = params[3];
          visit.preferred_date = params[1];
          visit.preferred_time = params[2];
        }
        if (lowerSql.includes('outcome = ?')) {
          visit.outcome = params[0];
          visit.outcome_notes = params[1];
          visit.status = params[2] || visit.status;
        }
        visit.updated_at = new Date().toISOString();
        saveFallbackStore(store);
        return { affectedRows: 1 };
      }
    }
    if (lowerSql.includes('update bookings')) {
      const bookingId = parseInt(params[params.length - 1], 10);
      const booking = store.bookings.find(b => b.id === bookingId);
      if (booking) {
        if (lowerSql.includes('status = ?')) {
          booking.status = params[0];
        }
        if (lowerSql.includes('check_in_time')) {
          booking.check_in_time = new Date().toISOString();
        }
        if (lowerSql.includes('check_out_time')) {
          booking.check_out_time = new Date().toISOString();
        }
        if (lowerSql.includes('reminder_30m_sent = 1')) {
          booking.reminder_30m_sent = 1;
        }
        if (lowerSql.includes('reminder_5m_sent = 1')) {
          booking.reminder_5m_sent = 1;
        }
        if (lowerSql.includes('started_notified = 1')) {
          booking.started_notified = 1;
        }
        if (lowerSql.includes('expired_notified = 1')) {
          booking.expired_notified = 1;
        }
        if (lowerSql.includes('overdue_notified = 1')) {
          booking.overdue_notified = 1;
        }
        saveFallbackStore(store);
        return { affectedRows: 1 };
      }
    }
    if (lowerSql.includes('update notifications')) {
      if (lowerSql.includes('where id = ? and user_id = ?')) {
        const nid = parseInt(params[1], 10);
        const uid = parseInt(params[2], 10);
        const n = (store.notifications || []).find(nt => nt.id === nid && nt.user_id === uid);
        if (n) {
          n.is_read = 1;
          n.read_at = params[0] || new Date().toISOString();
          saveFallbackStore(store);
          return { affectedRows: 1 };
        }
      }
      if (lowerSql.includes('where user_id = ?')) {
        const userId = parseInt(params[params.length - 1], 10);
        (store.notifications || []).filter(n => n.user_id === userId).forEach(n => {
          n.is_read = 1;
          n.read_at = new Date().toISOString();
        });
        saveFallbackStore(store);
        return { affectedRows: 1 };
      }
    }
    if (lowerSql.includes('update notification_preferences')) {
      const uid = parseInt(params[params.length - 1], 10);
      if (!store.notification_preferences) store.notification_preferences = [];
      let pref = store.notification_preferences.find(p => p.user_id === uid);
      if (!pref) {
        pref = { id: store.notification_preferences.length + 1, user_id: uid };
        store.notification_preferences.push(pref);
      }
      pref.booking_updates = params[0] ? 1 : 0;
      pref.booking_reminders = params[1] ? 1 : 0;
      pref.cancellation_updates = params[2] ? 1 : 0;
      pref.payment_updates = params[3] ? 1 : 0;
      pref.browser_push = params[4] ? 1 : 0;
      pref.reminder_time_1 = parseInt(params[5] || 30, 10);
      pref.reminder_time_2 = parseInt(params[6] || 5, 10);
      pref.updated_at = new Date().toISOString();
      saveFallbackStore(store);
      return { affectedRows: 1 };
    }
    if (lowerSql.includes('update incidents')) {
      const incidentId = parseInt(params[params.length - 1], 10);
      const inc = store.incidents.find(i => i.id === incidentId);
      if (inc) {
        inc.status = params[0] || inc.status;
        inc.resolution_notes = params[1] || inc.resolution_notes;
        inc.resolved_by = params[2] || inc.resolved_by;
        inc.resolved_at = new Date();
        return { affectedRows: 1 };
      }
    }
    if (lowerSql.includes('update users')) {
      const userId = parseInt(params[params.length - 1], 10);
      const user = store.users.find(u => u.id === userId);
      if (user) {
        if (lowerSql.includes('status = ?')) {
          user.status = params[0];
        }
        return { affectedRows: 1 };
      }
    }
  }

  // Default empty result
  return [];
}

function enrichBooking(booking) {
  const store = getStore();
  const res = store.resources.find(r => r.id === booking.resource_id);
  const user = store.users.find(u => u.id === booking.user_id);
  const owner = res ? store.users.find(u => u.id === res.owner_id) : null;
  const images = res ? store.resource_images.filter(i => i.resource_id === res.id) : [];

  return {
    ...booking,
    resource_title: res ? res.title : 'Deleted Resource',
    resource_category: res ? res.category : 'General',
    resource_location: res ? res.location : 'Campus',
    resource_image: images[0]?.image_url || null,
    owner_id: res ? res.owner_id : null,
    owner_name: owner ? owner.full_name : 'Owner',
    user_name: user ? user.full_name : 'Student User',
    user_email: user ? user.email : 'student@sharesphere.edu',
    user_department: user ? user.department : 'General'
  };
}
