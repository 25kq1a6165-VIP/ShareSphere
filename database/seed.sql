-- =====================================================================
-- ShareSphere Demonstration Seed Data
-- Demo credentials for all accounts: Password123!
-- =====================================================================

USE sharesphere;

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE audit_logs;
TRUNCATE TABLE contact_messages;
TRUNCATE TABLE notifications;
TRUNCATE TABLE incidents;
TRUNCATE TABLE condition_reports;
TRUNCATE TABLE bookings;
TRUNCATE TABLE eligibility_records;
TRUNCATE TABLE eligibility_requirements;
TRUNCATE TABLE resource_blocked_times;
TRUNCATE TABLE resource_availability;
TRUNCATE TABLE resource_images;
TRUNCATE TABLE resources;
TRUNCATE TABLE users;

SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------------------
-- Users Seed Data (Admin, Owners, Students)
-- Password for all: Password123!
-- ---------------------------------------------------------------------
INSERT INTO users (id, full_name, email, password_hash, role, department, phone, avatar_url, status) VALUES
(1, 'System Administrator', 'admin@sharesphere.edu', '$2a$10$E493dGvGY792P9b/Y7pq3eDbZunsJ5mnANE8URtAX5p3E/ctGirP6', 'admin', 'Central Administration & IT', '+1-555-0100', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80', 'active'),
(2, 'Dr. Sarah Jenkins', 'owner@sharesphere.edu', '$2a$10$E493dGvGY792P9b/Y7pq3eDbZunsJ5mnANE8URtAX5p3E/ctGirP6', 'owner', 'Nanotechnology & Materials Lab', '+1-555-0102', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80', 'active'),
(4, 'Alex Rivera', 'student@sharesphere.edu', '$2a$10$E493dGvGY792P9b/Y7pq3eDbZunsJ5mnANE8URtAX5p3E/ctGirP6', 'student', 'Biomedical Engineering (Year 3)', '+1-555-0104', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&q=80', 'active'),
(5, 'Emma Watson', 'student2@sharesphere.edu', '$2a$10$E493dGvGY792P9b/Y7pq3eDbZunsJ5mnANE8URtAX5p3E/ctGirP6', 'student', 'Electrical Engineering (Year 2)', '+1-555-0105', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&q=80', 'active');

-- ---------------------------------------------------------------------
-- Resources Seed Data
-- ---------------------------------------------------------------------
INSERT INTO resources (id, owner_id, title, category, type, description, location, capacity, fee_per_hour, min_duration_hours, max_duration_hours, requires_approval, requires_training, safety_instructions, booking_rules, status) VALUES
(1, 2, 'Field Emission Scanning Electron Microscope (FE-SEM)', 'Laboratory Equipment', 'equipment', 'Ultra-high resolution field emission SEM capable of 1.0 nm resolution at 15 kV. Ideal for imaging nanomaterials, biological specimens, and semiconductor thin films.', 'Materials Science Center, Room 104', 3, 25.00, 1, 4, TRUE, TRUE, 'Must wear cleanroom garments. No ferromagnetic or wet samples allowed without prior dehydration approval.', 'Book at least 24 hours in advance. Maximum 2 active slots per researcher per week.', 'active'),

(2, 2, 'Bio-Rad C1000 Touch Thermal Cycler (PCR)', 'Biotechnology', 'equipment', 'Thermal cycler with dual 48-well fast reaction modules and optical gradient reaction system for DNA/RNA amplification and genetic analysis.', 'Bioengineering Wing, Lab B-22', 2, 0.00, 1, 6, TRUE, FALSE, 'Wear nitrile gloves and lab coat at all times. Dispose of tubes in biohazard bins.', 'Free for enrolled university STEM researchers. Clean module upon completion.', 'active'),

(3, 2, 'Atomic Force Microscope (Park NX10 AFM)', 'Laboratory Equipment', 'equipment', 'High-precision nanoscale surface profiler for atomic-level topography, magnetic force microscopy, and electrical conductivity mapping with true non-contact mode.', 'Materials Science Center, Room 108', 2, 20.00, 1, 4, TRUE, TRUE, 'Acoustic isolation hood must be closed during measurements. Calibrate cantilever resonance before contact engagement.', 'Samples must be dry and mounted securely on 12mm magnetic pucks. Maximum 3 bookings per week.', 'active'),

(4, 2, 'Cleanroom Photolithography & Mask Aligner Station', 'Engineering & Prototyping', 'equipment', 'Sub-micron UV contact mask aligner with automated spin coater and precision hotplates for microfluidic device fabrication and wafer patterning.', 'Nanofabrication Cleanroom, Bay 3', 2, 30.00, 2, 6, TRUE, TRUE, 'Full cleanroom gowning (bunny suit, hood, booties, nitrile gloves) required at all times. Yellow room light only.', 'Clean exposure chuck with IPA after each session. Dispose of resist pipettes in hazardous waste container.', 'active'),

(5, 2, 'Confocal Laser Scanning Microscope (Leica Stellaris 5)', 'Biotechnology', 'equipment', 'Spectral confocal imaging system equipped with White Light Laser (440-790 nm) and sensitive HyD detectors for multi-channel live-cell fluorescence and 3D optical sectioning.', 'Bioimaging Core Facility, Suite 210', 3, 35.00, 1, 4, TRUE, TRUE, 'Laser safety interlocks must never be bypassed. Biosafety Level 1 and 2 certified samples only.', 'Clean oil-immersion lenses immediately using lens paper and spectrophotometric-grade cleaner.', 'active'),

(6, 2, 'X-Ray Powder Diffractometer (XRD - Bruker D8 Advance)', 'Laboratory Equipment', 'equipment', 'High-throughput powder X-ray diffractometer with Cu-Ka source and LynxEye detector for crystal phase identification, crystallite size determination, and thin film stress analysis.', 'Analytical Chemistry Wing, Room C-14', 2, 15.00, 1, 5, TRUE, TRUE, 'Check radiation safety shutter indicator light before opening enclosure. Wear campus radiation dosimeter badge.', 'Samples must be finely ground (<10 microns) and packed flush in zero-background sample holders.', 'active'),

(7, 2, 'Materials Characterization Collaboration Lab (Lab 205)', 'Meeting & Workspaces', 'space', 'Multi-disciplinary analytical workstation room with dual-monitor data processing terminals, OriginPro, MATLAB, and ImageJ licenses, whiteboard walls, and presentation screen.', 'Materials Science Center, 2nd Floor, Room 205', 12, 0.00, 1, 4, FALSE, FALSE, 'Keep workstation terminals tidy. Do not disconnect network or display cables.', 'Free for university research groups and lab seminar meetings. Leave dry-erase boards clean.', 'active'),

(8, 2, 'Smart Seminar Auditorium B', 'Classrooms & Auditoriums', 'space', 'Acoustically treated tiered lecture hall with 85-person seating, laser projection, wireless lapel microphones, and live lecture recording.', 'Academic Block 2, Ground Floor', 85, 40.00, 2, 8, TRUE, FALSE, 'Only authorized personnel may adjust AV amplifier rack.', 'Must be reserved at least 3 business days in advance.', 'active');

-- ---------------------------------------------------------------------
-- Resource Images
-- ---------------------------------------------------------------------
INSERT INTO resource_images (resource_id, image_url, is_primary) VALUES
(1, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80', TRUE),
(1, 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1000&q=80', FALSE),
(2, 'https://images.unsplash.com/photo-1579165466791-788189255670?auto=format&fit=crop&w=1000&q=80', TRUE),
(3, 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1000&q=80', TRUE),
(4, 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=80', TRUE),
(5, 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=1000&q=80', TRUE),
(6, 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1000&q=80', TRUE),
(7, 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80', TRUE),
(8, 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1000&q=80', TRUE);

-- ---------------------------------------------------------------------
-- Resource Availability (Monday to Friday, 8am to 6pm)
-- ---------------------------------------------------------------------
INSERT INTO resource_availability (resource_id, day_of_week, start_time, end_time, is_available) VALUES
-- FE-SEM (Resource 1: Mon-Fri)
(1, 1, '09:00:00', '17:00:00', TRUE),
(1, 2, '09:00:00', '17:00:00', TRUE),
(1, 3, '09:00:00', '17:00:00', TRUE),
(1, 4, '09:00:00', '17:00:00', TRUE),
(1, 5, '09:00:00', '17:00:00', TRUE),
-- PCR Thermal Cycler (Resource 2: Mon-Sat)
(2, 1, '08:00:00', '19:00:00', TRUE),
(2, 2, '08:00:00', '19:00:00', TRUE),
(2, 3, '08:00:00', '19:00:00', TRUE),
(2, 4, '08:00:00', '19:00:00', TRUE),
(2, 5, '08:00:00', '19:00:00', TRUE),
(2, 6, '10:00:00', '16:00:00', TRUE);

-- ---------------------------------------------------------------------
-- Eligibility Requirements
-- ---------------------------------------------------------------------
INSERT INTO eligibility_requirements (id, resource_id, title, description, document_required) VALUES
(1, 1, 'FE-SEM Safety & Ultra-High Vacuum Certification', 'Certification badge showing completion of Nanotech Center Level 2 safety training.', TRUE);

-- ---------------------------------------------------------------------
-- Eligibility Records
-- ---------------------------------------------------------------------
INSERT INTO eligibility_records (user_id, requirement_id, status, document_url, reviewer_notes, reviewed_by, reviewed_at) VALUES
(4, 1, 'approved', 'https://example.com/certs/sem-alex-cert.pdf', 'Certified by Lab Safety Officer.', 2, NOW() - INTERVAL 10 DAY),
(5, 1, 'pending', 'https://example.com/certs/sem-emma-cert.pdf', 'Under review for microscopy session.', NULL, NULL);

-- ---------------------------------------------------------------------
-- Bookings Seed Data
-- ---------------------------------------------------------------------
INSERT INTO bookings (id, resource_id, user_id, start_time, end_time, total_amount, purpose, attendees_count, status, check_in_time, check_out_time, created_at) VALUES
-- 1. Pending request from Student Alex for FE-SEM
(1, 1, 4, DATE_ADD(CURRENT_DATE, INTERVAL 2 DAY) + INTERVAL 10 HOUR, DATE_ADD(CURRENT_DATE, INTERVAL 2 DAY) + INTERVAL 12 HOUR, 50.00, 'Graphene nanoplatelet dispersion thickness characterization', 1, 'pending', NULL, NULL, NOW() - INTERVAL 2 HOUR),

-- 4. Completed historical booking
(4, 2, 4, DATE_SUB(CURRENT_DATE, INTERVAL 3 DAY) + INTERVAL 11 HOUR, DATE_SUB(CURRENT_DATE, INTERVAL 3 DAY) + INTERVAL 14 HOUR, 0.00, 'Gene expression assay amplification samples', 2, 'completed', DATE_SUB(CURRENT_DATE, INTERVAL 3 DAY) + INTERVAL 11 HOUR, DATE_SUB(CURRENT_DATE, INTERVAL 3 DAY) + INTERVAL 13 HOUR + INTERVAL 50 MINUTE, NOW() - INTERVAL 5 DAY);

-- ---------------------------------------------------------------------
-- Condition Reports
-- ---------------------------------------------------------------------
INSERT INTO condition_reports (booking_id, resource_id, reported_by, report_type, condition_status, notes, created_at) VALUES
(4, 2, 4, 'check_in', 'excellent', 'Module cleaned, seals intact, system booted normally.', DATE_SUB(CURRENT_DATE, INTERVAL 3 DAY) + INTERVAL 11 HOUR),
(4, 2, 4, 'check_out', 'excellent', 'Ran 35 cycles, thermal block wiped with ethanol, powered off.', DATE_SUB(CURRENT_DATE, INTERVAL 3 DAY) + INTERVAL 13 HOUR + INTERVAL 50 MINUTE);

-- ---------------------------------------------------------------------
-- Incidents Seed Data
-- ---------------------------------------------------------------------
-- (No active incidents)

-- ---------------------------------------------------------------------
-- Notifications
-- ---------------------------------------------------------------------
INSERT INTO notifications (user_id, title, message, type, link_url, is_read, created_at) VALUES
(2, 'New Booking Request', 'Alex Rivera has requested to book Field Emission Scanning Electron Microscope (FE-SEM).', 'booking_request', '/owner/requests', FALSE, NOW() - INTERVAL 2 HOUR);

-- ---------------------------------------------------------------------
-- Audit Logs
-- ---------------------------------------------------------------------
INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address) VALUES
(1, 'SYSTEM_INIT', 'SYSTEM', NULL, '{"event": "ShareSphere database initialized with seed records"}', '127.0.0.1'),
(2, 'CREATE_RESOURCE', 'RESOURCE', 1, '{"title": "Field Emission Scanning Electron Microscope (FE-SEM)"}', '127.0.0.1'),
(4, 'REQUEST_BOOKING', 'BOOKING', 1, '{"resource_id": 1, "status": "pending"}', '127.0.0.1');

-- ---------------------------------------------------------------------
-- Contact Messages
-- ---------------------------------------------------------------------
INSERT INTO contact_messages (name, email, subject, message, status) VALUES
('Prof. Marcus Brody', 'm.brody@university.edu', 'Department Lab Integration Inquiry', 'Hello, we would like to onboard our Archaeology scanning lab resources onto ShareSphere.', 'unread');
