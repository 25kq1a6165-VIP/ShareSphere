-- =====================================================================
-- ShareSphere Database Schema
-- "Share Resources. Unlock Possibilities."
-- Compatible with MySQL 8.0+, MariaDB, and MySQL Workbench
-- =====================================================================

CREATE DATABASE IF NOT EXISTS sharesphere CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sharesphere;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS contact_messages;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS incidents;
DROP TABLE IF EXISTS condition_reports;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS eligibility_records;
DROP TABLE IF EXISTS eligibility_requirements;
DROP TABLE IF EXISTS resource_blocked_times;
DROP TABLE IF EXISTS resource_availability;
DROP TABLE IF EXISTS resource_images;
DROP TABLE IF EXISTS resources;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------------------
-- 1. Users Table
-- ---------------------------------------------------------------------
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(191) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('student', 'owner', 'admin') NOT NULL DEFAULT 'student',
  department VARCHAR(100) DEFAULT NULL,
  phone VARCHAR(30) DEFAULT NULL,
  avatar_url VARCHAR(500) DEFAULT NULL,
  status ENUM('active', 'suspended', 'pending') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_role (role),
  INDEX idx_users_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 2. Resources Table
-- ---------------------------------------------------------------------
CREATE TABLE resources (
  id INT AUTO_INCREMENT PRIMARY KEY,
  owner_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  category VARCHAR(80) NOT NULL,
  type ENUM('equipment', 'space') NOT NULL DEFAULT 'equipment',
  description TEXT NOT NULL,
  location VARCHAR(200) NOT NULL,
  capacity INT DEFAULT 1,
  fee_per_hour DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  min_duration_hours INT NOT NULL DEFAULT 1,
  max_duration_hours INT NOT NULL DEFAULT 8,
  requires_approval BOOLEAN NOT NULL DEFAULT TRUE,
  requires_training BOOLEAN NOT NULL DEFAULT FALSE,
  safety_instructions TEXT DEFAULT NULL,
  booking_rules TEXT DEFAULT NULL,
  status ENUM('active', 'pending_approval', 'suspended', 'inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_resources_category (category),
  INDEX idx_resources_status (status),
  INDEX idx_resources_type (type),
  INDEX idx_resources_owner (owner_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 3. Resource Images Table
-- ---------------------------------------------------------------------
CREATE TABLE resource_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  resource_id INT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
  INDEX idx_resource_images_resource (resource_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 4. Resource Availability Schedule Table (Days 0=Sun..6=Sat)
-- ---------------------------------------------------------------------
CREATE TABLE resource_availability (
  id INT AUTO_INCREMENT PRIMARY KEY,
  resource_id INT NOT NULL,
  day_of_week TINYINT NOT NULL COMMENT '0=Sun, 1=Mon, ..., 6=Sat',
  start_time TIME NOT NULL DEFAULT '08:00:00',
  end_time TIME NOT NULL DEFAULT '18:00:00',
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
  UNIQUE KEY uq_resource_day (resource_id, day_of_week)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 5. Resource Blocked Times (Maintenance, Holidays, Reserved Blocks)
-- ---------------------------------------------------------------------
CREATE TABLE resource_blocked_times (
  id INT AUTO_INCREMENT PRIMARY KEY,
  resource_id INT NOT NULL,
  start_datetime DATETIME NOT NULL,
  end_datetime DATETIME NOT NULL,
  reason VARCHAR(255) DEFAULT 'Routine Maintenance',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
  INDEX idx_blocked_times (resource_id, start_datetime, end_datetime)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 6. Eligibility Requirements
-- ---------------------------------------------------------------------
CREATE TABLE eligibility_requirements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  resource_id INT NOT NULL,
  title VARCHAR(150) NOT NULL,
  description TEXT,
  document_required BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 7. Eligibility Records (Submissions & Verification)
-- ---------------------------------------------------------------------
CREATE TABLE eligibility_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  requirement_id INT NOT NULL,
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  document_url VARCHAR(500) DEFAULT NULL,
  reviewer_notes TEXT DEFAULT NULL,
  reviewed_by INT DEFAULT NULL,
  reviewed_at DATETIME DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (requirement_id) REFERENCES eligibility_requirements(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE KEY uq_user_requirement (user_id, requirement_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 7.5. Physical Visits Table (Pre-Reservation In-Person Inspections)
-- ---------------------------------------------------------------------
CREATE TABLE visits (
  id INT AUTO_INCREMENT PRIMARY KEY,
  resource_id INT NOT NULL,
  user_id INT NOT NULL,
  owner_id INT NOT NULL,
  user_name VARCHAR(120) NOT NULL,
  user_email VARCHAR(191) NOT NULL,
  user_phone VARCHAR(30) DEFAULT NULL,
  resource_title VARCHAR(200) NOT NULL,
  resource_location VARCHAR(200) NOT NULL,
  preferred_date DATE NOT NULL,
  preferred_time VARCHAR(20) NOT NULL,
  notes TEXT DEFAULT NULL,
  status ENUM(
    'visit_requested',
    'visit_approved',
    'visit_rescheduled',
    'visit_rejected',
    'visit_completed',
    'cancelled_after_visit'
  ) NOT NULL DEFAULT 'visit_requested',
  rescheduled_date DATE DEFAULT NULL,
  rescheduled_time VARCHAR(20) DEFAULT NULL,
  rescheduled_notes TEXT DEFAULT NULL,
  rejection_reason VARCHAR(255) DEFAULT NULL,
  outcome ENUM('interested', 'not_interested') DEFAULT NULL,
  outcome_notes TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_visits_resource (resource_id),
  INDEX idx_visits_user (user_id),
  INDEX idx_visits_owner (owner_id),
  INDEX idx_visits_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 8. Bookings Table (Core transaction entity with 50/50 payment model)
-- ---------------------------------------------------------------------
CREATE TABLE bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  resource_id INT NOT NULL,
  user_id INT NOT NULL,
  visit_id INT DEFAULT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  advance_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  remaining_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  advance_paid BOOLEAN NOT NULL DEFAULT FALSE,
  advance_payment_id VARCHAR(100) DEFAULT NULL,
  advance_paid_at DATETIME DEFAULT NULL,
  final_paid BOOLEAN NOT NULL DEFAULT FALSE,
  final_payment_id VARCHAR(100) DEFAULT NULL,
  final_paid_at DATETIME DEFAULT NULL,
  handover_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
  handover_confirmed_at DATETIME DEFAULT NULL,
  purpose VARCHAR(255) NOT NULL,
  attendees_count INT NOT NULL DEFAULT 1,
  status ENUM(
    'visit_completed',
    'interest_confirmed',
    'advance_pending',
    'advance_verified',
    'booking_confirmed',
    'resource_ready',
    'in_use',
    'usage_completed',
    'final_payment_pending',
    'completed',
    'cancelled',
    'cancelled_after_visit'
  ) NOT NULL DEFAULT 'advance_pending',
  check_in_time DATETIME DEFAULT NULL,
  check_out_time DATETIME DEFAULT NULL,
  cancellation_reason VARCHAR(255) DEFAULT NULL,
  rejection_reason VARCHAR(255) DEFAULT NULL,
  refund_status ENUM('none', 'requested', 'approved', 'processed', 'rejected') NOT NULL DEFAULT 'none',
  refund_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  refund_reason VARCHAR(255) DEFAULT NULL,
  reminder_30m_sent BOOLEAN NOT NULL DEFAULT FALSE,
  reminder_5m_sent BOOLEAN NOT NULL DEFAULT FALSE,
  started_notified BOOLEAN NOT NULL DEFAULT FALSE,
  expired_notified BOOLEAN NOT NULL DEFAULT FALSE,
  overdue_notified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE RESTRICT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (visit_id) REFERENCES visits(id) ON DELETE SET NULL,
  INDEX idx_bookings_resource_dates (resource_id, start_time, end_time),
  INDEX idx_bookings_user (user_id),
  INDEX idx_bookings_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 8.5. Payments & Receipts Table (50% Advance & Final Settlements)
-- ---------------------------------------------------------------------
CREATE TABLE payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  user_id INT NOT NULL,
  payment_type ENUM('advance_50', 'final_50', 'full', 'refund') NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'INR',
  status ENUM('success', 'pending', 'failed', 'refunded') NOT NULL DEFAULT 'success',
  gateway VARCHAR(80) NOT NULL DEFAULT 'ShareSphere Verified Test Gateway',
  transaction_id VARCHAR(100) NOT NULL UNIQUE,
  receipt_number VARCHAR(100) NOT NULL UNIQUE,
  payment_method VARCHAR(80) NOT NULL DEFAULT 'UPI / NetBanking',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_payments_booking (booking_id),
  INDEX idx_payments_user (user_id),
  INDEX idx_payments_txn (transaction_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 9. Condition Reports Table (Pre & Post usage inspection)
-- ---------------------------------------------------------------------
CREATE TABLE condition_reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  resource_id INT NOT NULL,
  reported_by INT NOT NULL,
  report_type ENUM('check_in', 'check_out', 'damage') NOT NULL,
  condition_status ENUM('excellent', 'good', 'fair', 'damaged', 'missing_parts') NOT NULL DEFAULT 'good',
  notes TEXT NOT NULL,
  image_urls TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
  FOREIGN KEY (reported_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_condition_booking (booking_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 10. Incidents Table
-- ---------------------------------------------------------------------
CREATE TABLE incidents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT DEFAULT NULL,
  resource_id INT NOT NULL,
  reported_by INT NOT NULL,
  title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  severity ENUM('low', 'medium', 'high', 'critical') NOT NULL DEFAULT 'medium',
  status ENUM('open', 'under_review', 'resolved', 'dismissed') NOT NULL DEFAULT 'open',
  resolution_notes TEXT DEFAULT NULL,
  resolved_by INT DEFAULT NULL,
  resolved_at DATETIME DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
  FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
  FOREIGN KEY (reported_by) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_incidents_status (status),
  INDEX idx_incidents_severity (severity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 11. Notifications Table (Real-Time Notification System)
-- ---------------------------------------------------------------------
CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  recipient_role ENUM('student', 'owner', 'admin') NOT NULL DEFAULT 'student',
  booking_id INT DEFAULT NULL,
  resource_id INT DEFAULT NULL,
  event_type ENUM(
    'booking_created',
    'booking_approved',
    'booking_rejected',
    'booking_cancelled',
    'reminder_30m',
    'reminder_5m',
    'booking_started',
    'booking_expired',
    'booking_overdue',
    'booking_rescheduled',
    'payment_success',
    'payment_failed',
    'feedback_request',
    'incident_reported',
    'visit_request',
    'visit_approved',
    'visit_rescheduled',
    'visit_rejected',
    'visit_completed',
    'system'
  ) NOT NULL DEFAULT 'system',
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  link_url VARCHAR(255) DEFAULT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at DATETIME DEFAULT NULL,
  delivery_status ENUM('pending', 'delivered', 'failed') NOT NULL DEFAULT 'delivered',
  idempotency_key VARCHAR(150) DEFAULT NULL UNIQUE,
  metadata JSON DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
  FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE SET NULL,
  INDEX idx_notifications_user_read (user_id, is_read),
  INDEX idx_notifications_event (event_type),
  INDEX idx_notifications_idempotency (idempotency_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 11.5. Notification Preferences Table
-- ---------------------------------------------------------------------
CREATE TABLE notification_preferences (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  booking_updates BOOLEAN NOT NULL DEFAULT TRUE,
  booking_reminders BOOLEAN NOT NULL DEFAULT TRUE,
  cancellation_updates BOOLEAN NOT NULL DEFAULT TRUE,
  payment_updates BOOLEAN NOT NULL DEFAULT TRUE,
  browser_push BOOLEAN NOT NULL DEFAULT FALSE,
  reminder_time_1 INT NOT NULL DEFAULT 30,
  reminder_time_2 INT NOT NULL DEFAULT 5,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 12. Contact Messages Table
-- ---------------------------------------------------------------------
CREATE TABLE contact_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(191) NOT NULL,
  subject VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  status ENUM('unread', 'read', 'responded') NOT NULL DEFAULT 'unread',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 13. Audit Logs Table
-- ---------------------------------------------------------------------
CREATE TABLE audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT DEFAULT NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(60) NOT NULL,
  entity_id INT DEFAULT NULL,
  details JSON DEFAULT NULL,
  ip_address VARCHAR(45) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_audit_action (action),
  INDEX idx_audit_entity (entity_type, entity_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
