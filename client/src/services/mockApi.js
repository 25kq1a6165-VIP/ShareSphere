// Client-side demonstration store mirroring server/src/utils/mockDb.js
// Provides instant, offline, and static-deployment capability for ShareSphere

const INITIAL_USERS = [
  {
    id: 1,
    full_name: 'System Administrator',
    email: 'admin@sharesphere.edu',
    role: 'admin',
    department: 'Central Administration & IT',
    phone: '+1-555-0100',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    status: 'active',
  },
  {
    id: 2,
    full_name: 'Dr. Sarah Jenkins',
    email: 'owner@sharesphere.edu',
    role: 'owner',
    department: 'Nanotechnology & Materials Lab',
    phone: '+1-555-0102',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
    status: 'active',
  },
  {
    id: 4,
    full_name: 'Alex Rivera',
    email: 'student@sharesphere.edu',
    role: 'student',
    department: 'Biomedical Engineering (Year 3)',
    phone: '+1-555-0104',
    avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&q=80',
    status: 'active',
  },
  {
    id: 5,
    full_name: 'Emma Watson',
    email: 'student2@sharesphere.edu',
    role: 'student',
    department: 'Electrical Engineering (Year 2)',
    phone: '+1-555-0105',
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&q=80',
    status: 'active',
  }
];

const INITIAL_RESOURCES = [
  {
    id: 1,
    owner_id: 2,
    owner_name: 'Dr. Sarah Jenkins',
    title: 'Field Emission Scanning Electron Microscope (FE-SEM)',
    category: 'Laboratory Equipment',
    type: 'equipment',
    description: 'Ultra-high resolution field emission SEM capable of 1.0 nm resolution at 15 kV. Ideal for imaging nanomaterials, biological specimens, and semiconductor thin films.',
    location: 'Materials Science Center, Room 104',
    capacity: 3,
    fee_per_hour: 25.00,
    min_duration_hours: 1,
    max_duration_hours: 4,
    requires_approval: 1,
    requires_training: 1,
    safety_instructions: 'Must wear cleanroom garments. No ferromagnetic or wet samples allowed without prior dehydration approval.',
    booking_rules: 'Book at least 24 hours in advance. Maximum 2 active slots per researcher per week.',
    status: 'active',
    primary_image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80',
    images: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1000&q=80'
    ]
  },
  {
    id: 2,
    owner_id: 2,
    owner_name: 'Dr. Sarah Jenkins',
    title: 'Bio-Rad C1000 Touch Thermal Cycler (PCR)',
    category: 'Biotechnology',
    type: 'equipment',
    description: 'Thermal cycler with dual 48-well fast reaction modules and optical gradient reaction system for DNA/RNA amplification and genetic analysis.',
    location: 'Bioengineering Wing, Lab B-22',
    capacity: 2,
    fee_per_hour: 0.00,
    min_duration_hours: 1,
    max_duration_hours: 6,
    requires_approval: 1,
    requires_training: 0,
    safety_instructions: 'Wear nitrile gloves and lab coat at all times. Dispose of tubes in biohazard bins.',
    booking_rules: 'Free for enrolled university STEM researchers. Clean module upon completion.',
    status: 'active',
    primary_image: 'https://images.unsplash.com/photo-1579165466791-788189255670?auto=format&fit=crop&w=1000&q=80',
    images: ['https://images.unsplash.com/photo-1579165466791-788189255670?auto=format&fit=crop&w=1000&q=80']
  },
  {
    id: 3,
    owner_id: 2,
    owner_name: 'Dr. Sarah Jenkins',
    title: 'Atomic Force Microscope (Park NX10 AFM)',
    category: 'Laboratory Equipment',
    type: 'equipment',
    description: 'High-precision nanoscale surface profiler for atomic-level topography, magnetic force microscopy, and electrical conductivity mapping with true non-contact mode.',
    location: 'Materials Science Center, Room 108',
    capacity: 2,
    fee_per_hour: 20.00,
    min_duration_hours: 1,
    max_duration_hours: 4,
    requires_approval: 1,
    requires_training: 1,
    safety_instructions: 'Acoustic isolation hood must be closed during measurements. Calibrate cantilever resonance before contact engagement.',
    booking_rules: 'Samples must be dry and mounted securely on 12mm magnetic pucks. Maximum 3 bookings per week.',
    status: 'active',
    primary_image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1000&q=80',
    images: ['https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1000&q=80']
  },
  {
    id: 4,
    owner_id: 2,
    owner_name: 'Dr. Sarah Jenkins',
    title: 'Cleanroom Photolithography & Mask Aligner Station',
    category: 'Engineering & Prototyping',
    type: 'equipment',
    description: 'Sub-micron UV contact mask aligner with automated spin coater and precision hotplates for microfluidic device fabrication and wafer patterning.',
    location: 'Nanofabrication Cleanroom, Bay 3',
    capacity: 2,
    fee_per_hour: 30.00,
    min_duration_hours: 2,
    max_duration_hours: 6,
    requires_approval: 1,
    requires_training: 1,
    safety_instructions: 'Full cleanroom gowning (bunny suit, hood, booties, nitrile gloves) required at all times. Yellow room light only.',
    booking_rules: 'Clean exposure chuck with IPA after each session. Dispose of resist pipettes in hazardous waste container.',
    status: 'active',
    primary_image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=80',
    images: ['https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=80']
  },
  {
    id: 5,
    owner_id: 2,
    owner_name: 'Dr. Sarah Jenkins',
    title: 'Confocal Laser Scanning Microscope (Leica Stellaris 5)',
    category: 'Biotechnology',
    type: 'equipment',
    description: 'Spectral confocal imaging system equipped with White Light Laser (440-790 nm) and sensitive HyD detectors for multi-channel live-cell fluorescence and 3D optical sectioning.',
    location: 'Bioimaging Core Facility, Suite 210',
    capacity: 3,
    fee_per_hour: 35.00,
    min_duration_hours: 1,
    max_duration_hours: 4,
    requires_approval: 1,
    requires_training: 1,
    safety_instructions: 'Laser safety interlocks must never be bypassed. Biosafety Level 1 and 2 certified samples only.',
    booking_rules: 'Clean oil-immersion lenses immediately using lens paper and spectrophotometric-grade cleaner.',
    status: 'active',
    primary_image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=1000&q=80',
    images: ['https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=1000&q=80']
  },
  {
    id: 6,
    owner_id: 2,
    owner_name: 'Dr. Sarah Jenkins',
    title: 'X-Ray Powder Diffractometer (XRD - Bruker D8 Advance)',
    category: 'Laboratory Equipment',
    type: 'equipment',
    description: 'High-throughput powder X-ray diffractometer with Cu-Ka source and LynxEye detector for crystal phase identification, crystallite size determination, and thin film stress analysis.',
    location: 'Analytical Chemistry Wing, Room C-14',
    capacity: 2,
    fee_per_hour: 15.00,
    min_duration_hours: 1,
    max_duration_hours: 5,
    requires_approval: 1,
    requires_training: 1,
    safety_instructions: 'Check radiation safety shutter indicator light before opening enclosure. Wear campus radiation dosimeter badge.',
    booking_rules: 'Samples must be finely ground (<10 microns) and packed flush in zero-background sample holders.',
    status: 'active',
    primary_image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1000&q=80',
    images: ['https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1000&q=80']
  },
  {
    id: 7,
    owner_id: 2,
    owner_name: 'Dr. Sarah Jenkins',
    title: 'Materials Characterization Collaboration Lab (Lab 205)',
    category: 'Meeting & Workspaces',
    type: 'space',
    description: 'Multi-disciplinary analytical workstation room with dual-monitor data processing terminals, OriginPro, MATLAB, and ImageJ licenses, whiteboard walls, and presentation screen.',
    location: 'Materials Science Center, 2nd Floor, Room 205',
    capacity: 12,
    fee_per_hour: 0.00,
    min_duration_hours: 1,
    max_duration_hours: 4,
    requires_approval: 0,
    requires_training: 0,
    safety_instructions: 'Keep workstation terminals tidy. Do not disconnect network or display cables.',
    booking_rules: 'Free for university research groups and lab seminar meetings. Leave dry-erase boards clean.',
    status: 'active',
    primary_image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80',
    images: ['https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80']
  },
  {
    id: 8,
    owner_id: 2,
    owner_name: 'Dr. Sarah Jenkins',
    title: 'Smart Seminar Auditorium B',
    category: 'Classrooms & Auditoriums',
    type: 'space',
    description: 'Acoustically treated tiered lecture hall with 85-person seating, laser projection, wireless lapel microphones, and live lecture recording.',
    location: 'Academic Block 2, Ground Floor',
    capacity: 85,
    fee_per_hour: 40.00,
    min_duration_hours: 2,
    max_duration_hours: 8,
    requires_approval: 1,
    requires_training: 0,
    safety_instructions: 'Only authorized personnel may adjust AV amplifier rack.',
    booking_rules: 'Must be reserved at least 3 business days in advance.',
    status: 'active',
    primary_image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1000&q=80',
    images: ['https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1000&q=80']
  }
];

const INITIAL_VISITS = [
  {
    id: 1,
    resource_id: 1,
    user_id: 4,
    owner_id: 2,
    user_name: 'Alex Rivera',
    user_email: 'student@sharesphere.edu',
    user_phone: '+1-555-0104',
    resource_title: 'Field Emission Scanning Electron Microscope (FE-SEM)',
    resource_location: 'Materials Science Center, Room 104',
    preferred_date: '2026-11-02',
    preferred_time: '10:00',
    notes: 'Requesting physical visit to inspect high-vacuum specimen transfer lock before committing to grant reservation.',
    status: 'visit_completed',
    rescheduled_date: null,
    rescheduled_time: null,
    rescheduled_notes: null,
    rejection_reason: null,
    outcome: 'interested',
    outcome_notes: 'Specimen transfer lock confirmed compatible. Proceeding to reserve slot.',
    created_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
  },
  {
    id: 2,
    resource_id: 3,
    user_id: 5,
    owner_id: 2,
    user_name: 'Emma Watson',
    user_email: 'student2@sharesphere.edu',
    user_phone: '+1-555-0105',
    resource_title: 'Atomic Force Microscope (Park NX10 AFM)',
    resource_location: 'Materials Science Center, Room 108',
    preferred_date: '2026-11-04',
    preferred_time: '14:00',
    notes: 'Would like to verify non-contact cantilever tip mounting compatibility with our graphene specimens.',
    status: 'visit_requested',
    rescheduled_date: null,
    rescheduled_time: null,
    rescheduled_notes: null,
    rejection_reason: null,
    outcome: null,
    outcome_notes: null,
    created_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString()
  },
  {
    id: 3,
    resource_id: 4,
    user_id: 4,
    owner_id: 2,
    user_name: 'Alex Rivera',
    user_email: 'student@sharesphere.edu',
    user_phone: '+1-555-0104',
    resource_title: 'Cleanroom Photolithography & Mask Aligner Station',
    resource_location: 'Nanofabrication Cleanroom, Bay 3',
    preferred_date: '2026-11-05',
    preferred_time: '11:00',
    notes: 'Inspect 4-inch wafer chuck and UV exposure lamp intensity calibration.',
    status: 'visit_approved',
    rescheduled_date: null,
    rescheduled_time: null,
    rescheduled_notes: null,
    rejection_reason: null,
    outcome: null,
    outcome_notes: null,
    created_at: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 3600 * 1000).toISOString()
  }
];

const INITIAL_PAYMENTS = [
  {
    id: 1,
    booking_id: 2,
    user_id: 4,
    payment_type: 'advance_50',
    amount: 1200,
    currency: 'INR',
    status: 'success',
    gateway: 'ShareSphere Verified Test Gateway',
    transaction_id: 'txn_adv_2026_98124',
    receipt_number: 'RCPT-ADV-2026-0002',
    payment_method: 'UPI / NetBanking',
    created_at: new Date(Date.now() - 36 * 3600 * 1000).toISOString()
  },
  {
    id: 2,
    booking_id: 3,
    user_id: 4,
    payment_type: 'advance_50',
    amount: 1750,
    currency: 'INR',
    status: 'success',
    gateway: 'ShareSphere Verified Test Gateway',
    transaction_id: 'txn_adv_2026_88312',
    receipt_number: 'RCPT-ADV-2026-0003',
    payment_method: 'UPI / NetBanking',
    created_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString()
  }
];

const STORAGE_KEY = 'sharesphere_mock_store_v5';

function mockNotifyBookingEvent(store, { eventType, booking, actorName = 'User', reason = null, metadata = {} }) {
  if (!store.notifications) store.notifications = [];
  const bookingId = booking.id;
  const resTitle = booking.resource_title || 'Campus Resource';
  const userId = booking.user_id;
  const ownerId = booking.owner_id || 2;
  const userName = booking.user_name || 'Alex Rivera';
  const now = new Date().toISOString();

  let userTitle = '';
  let userMsg = '';
  let adminTitle = '';
  let adminMsg = '';

  switch (eventType) {
    case 'booking_created':
      userTitle = 'Booking Request Submitted';
      userMsg = `Your booking request for "${resTitle}" (Booking #${bookingId}) has been submitted. Status: ${booking.status}.`;
      adminTitle = 'New Booking Request';
      adminMsg = `${userName} submitted a new booking request for "${resTitle}" (Booking #${bookingId}).`;
      break;
    case 'booking_approved':
      userTitle = 'Booking Approved!';
      userMsg = `Your booking #${bookingId} for "${resTitle}" has been approved!`;
      adminTitle = 'Booking Approved';
      adminMsg = `Booking #${bookingId} for "${resTitle}" (${userName}) was approved.`;
      break;
    case 'booking_rejected':
      userTitle = 'Booking Request Declined';
      userMsg = `Your booking for "${resTitle}" was declined.${reason ? ` Reason: ${reason}` : ''}`;
      adminTitle = 'Booking Request Declined';
      adminMsg = `Booking #${bookingId} for "${resTitle}" (${userName}) was rejected.${reason ? ` Reason: ${reason}` : ''}`;
      break;
    case 'booking_cancelled':
      userTitle = 'Booking Cancelled';
      userMsg = `Booking #${bookingId} for "${resTitle}" was cancelled.${reason ? ` Reason: ${reason}` : ''}`;
      adminTitle = 'Booking Cancelled';
      adminMsg = `Booking #${bookingId} for "${resTitle}" (${userName}) was cancelled.${reason ? ` Reason: ${reason}` : ''}`;
      break;
    case 'reminder_30m':
      userTitle = 'Booking Reminder (30 Minutes)';
      userMsg = `Upcoming Session: Your reservation for "${resTitle}" starts in 30 minutes.`;
      adminTitle = 'Upcoming Booking Session (30m)';
      adminMsg = `Upcoming Booking: Booking #${bookingId} ("${resTitle}", ${userName}) starts in 30 minutes.`;
      break;
    case 'reminder_5m':
      userTitle = 'Starting Soon (5 Minutes)';
      userMsg = `Your booking for "${resTitle}" starts in 5 minutes. Please prepare for access.`;
      adminTitle = 'Starting Soon (5m)';
      adminMsg = `Session Imminent: Booking #${bookingId} ("${resTitle}", ${userName}) starts in 5 minutes.`;
      break;
    case 'booking_started':
      userTitle = 'Booking Session Active';
      userMsg = `Your reserved session for "${resTitle}" has officially commenced.`;
      adminTitle = 'Booking Session Started';
      adminMsg = `Session In Progress: Booking #${bookingId} ("${resTitle}", ${userName}) has started.`;
      break;
    case 'booking_expired':
      userTitle = 'Booking Session Ended';
      userMsg = `Scheduled booking time for "${resTitle}" (Booking #${bookingId}) has concluded.`;
      adminTitle = 'Booking Expired / Concluded';
      adminMsg = `Scheduled time expired for Booking #${bookingId} ("${resTitle}", ${userName}).`;
      break;
    case 'booking_overdue':
      userTitle = 'ACTION REQUIRED: Booking Overdue';
      userMsg = `Your reservation for "${resTitle}" (Booking #${bookingId}) has exceeded scheduled end time. Please check out immediately.`;
      adminTitle = 'ALERT: Resource Usage Overdue';
      adminMsg = `OVERDUE ALERT: Booking #${bookingId} for "${resTitle}" (${userName}) has exceeded scheduled end time without return confirmation.`;
      break;
    case 'payment_success':
      const pAmt = metadata.amount ? `₹${Number(metadata.amount).toLocaleString()}` : '';
      const pType = metadata.paymentType === 'advance_50' ? '50% Advance Payment' : 'Final Settlement';
      userTitle = `${pType} Verified`;
      userMsg = `Your payment of ${pAmt} for Booking #${bookingId} ("${resTitle}") has been verified.`;
      adminTitle = `Payment Received (${pType})`;
      adminMsg = `${pType} of ${pAmt} verified for Booking #${bookingId} ("${resTitle}", ${userName}).`;
      break;
    case 'payment_failed':
      userTitle = 'Payment Attempt Declined';
      userMsg = `Payment transaction for Booking #${bookingId} ("${resTitle}") was declined.`;
      adminTitle = 'Payment Failure Alert';
      adminMsg = `Payment transaction failed for Booking #${bookingId} ("${resTitle}", ${userName}).`;
      break;
    case 'feedback_request':
      userTitle = 'How was your experience?';
      userMsg = `Your booking for "${resTitle}" is complete! Please submit your feedback.`;
      adminTitle = 'Session Completed';
      adminMsg = `Booking #${bookingId} ("${resTitle}", ${userName}) marked completed.`;
      break;
    default:
      userTitle = `Update on Booking #${bookingId}`;
      userMsg = `Event for "${resTitle}".`;
      adminTitle = `Booking Event #${bookingId}`;
      adminMsg = `Event on Booking #${bookingId} for "${resTitle}".`;
  }

  // 1. Add notification for student user
  store.notifications.unshift({
    id: store.notifications.length + 1,
    user_id: userId,
    recipient_role: 'student',
    booking_id: bookingId,
    event_type: eventType,
    type: eventType,
    title: userTitle,
    message: userMsg,
    link_url: `/my-bookings/${bookingId}`,
    is_read: 0,
    created_at: now
  });

  // 2. Add notification for System Admin (user_id: 1)
  if (userId !== 1) {
    store.notifications.unshift({
      id: store.notifications.length + 1,
      user_id: 1,
      recipient_role: 'admin',
      booking_id: bookingId,
      event_type: eventType,
      type: eventType,
      title: adminTitle,
      message: adminMsg,
      link_url: `/admin/bookings`,
      is_read: 0,
      created_at: now
    });
  }

  // 3. Add notification for Owner (user_id: 2) if distinct
  if (ownerId && ownerId !== userId && ownerId !== 1) {
    store.notifications.unshift({
      id: store.notifications.length + 1,
      user_id: ownerId,
      recipient_role: 'owner',
      booking_id: bookingId,
      event_type: eventType,
      type: eventType,
      title: adminTitle,
      message: adminMsg,
      link_url: `/owner/requests`,
      is_read: 0,
      created_at: now
    });
  }
}

function mockRunScheduler(store) {
  if (!store || !store.bookings) return;
  const nowMs = Date.now();
  for (const b of store.bookings) {
    const startMs = new Date(b.start_time).getTime();
    const endMs = new Date(b.end_time).getTime();
    const diffStartMs = startMs - nowMs;
    const diffEndMs = nowMs - endMs;
    const isConfirmed = ['approved', 'booking_confirmed'].includes(b.status);
    const isInUse = ['in_use', 'checked_in'].includes(b.status);

    if (isConfirmed && !b.reminder_30m_sent && diffStartMs > 0 && diffStartMs <= 30 * 60 * 1000) {
      mockNotifyBookingEvent(store, { eventType: 'reminder_30m', booking: b });
      b.reminder_30m_sent = 1;
    }
    if (isConfirmed && !b.reminder_5m_sent && diffStartMs > 0 && diffStartMs <= 5 * 60 * 1000) {
      mockNotifyBookingEvent(store, { eventType: 'reminder_5m', booking: b });
      b.reminder_5m_sent = 1;
    }
    if (isConfirmed && !b.started_notified && diffStartMs <= 0 && endMs > nowMs) {
      mockNotifyBookingEvent(store, { eventType: 'booking_started', booking: b });
      b.started_notified = 1;
    }
    if (isConfirmed && diffEndMs >= 0) {
      const newStatus = b.total_amount === 0 || b.final_paid ? 'completed' : 'usage_completed';
      b.status = newStatus;
      if (!b.expired_notified) {
        mockNotifyBookingEvent(store, { eventType: 'booking_expired', booking: b });
        b.expired_notified = 1;
      }
    }
    if (isInUse && diffEndMs > 0 && !b.overdue_notified) {
      mockNotifyBookingEvent(store, { eventType: 'booking_overdue', booking: b });
      b.overdue_notified = 1;
    }
  }
}

function getStore() {
  // Clear obsolete stores if present
  try {
    localStorage.removeItem('sharesphere_mock_store');
    localStorage.removeItem('sharesphere_mock_store_v2');
    localStorage.removeItem('sharesphere_mock_store_v3');
    localStorage.removeItem('sharesphere_mock_store_v4');
  } catch (e) {}

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      // fallback
    }
  }

  const now = new Date();
  const twoDaysLaterStart = new Date(now.getTime() + 2 * 24 * 3600 * 1000);
  twoDaysLaterStart.setHours(10, 0, 0, 0);
  const twoDaysLaterEnd = new Date(now.getTime() + 2 * 24 * 3600 * 1000);
  twoDaysLaterEnd.setHours(14, 0, 0, 0);

  const initialStore = {
    users: INITIAL_USERS,
    resources: INITIAL_RESOURCES,
    visits: INITIAL_VISITS,
    payments: INITIAL_PAYMENTS,
    bookings: [
      {
        id: 1,
        resource_id: 1,
        user_id: 4,
        visit_id: 1,
        user_name: 'Alex Rivera',
        user_email: 'student@sharesphere.edu',
        resource_title: 'Field Emission Scanning Electron Microscope (FE-SEM)',
        resource_category: 'Laboratory Equipment',
        resource_location: 'Materials Science Center, Room 104',
        resource_image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80',
        owner_id: 2,
        owner_name: 'Dr. Sarah Jenkins',
        start_time: twoDaysLaterStart.toISOString(),
        end_time: twoDaysLaterEnd.toISOString(),
        total_amount: 2000,
        advance_amount: 1000,
        remaining_amount: 1000,
        advance_paid: 0,
        advance_payment_id: null,
        advance_paid_at: null,
        final_paid: 0,
        final_payment_id: null,
        final_paid_at: null,
        handover_confirmed: 0,
        handover_confirmed_at: null,
        refund_status: 'none',
        refund_amount: 0,
        purpose: 'Graphene nanoplatelet dispersion thickness characterization',
        attendees_count: 2,
        status: 'advance_pending',
        check_in_time: null,
        check_out_time: null,
        created_at: new Date(now.getTime() - 2 * 3600 * 1000).toISOString()
      },
      {
        id: 2,
        resource_id: 3,
        user_id: 4,
        visit_id: null,
        user_name: 'Alex Rivera',
        user_email: 'student@sharesphere.edu',
        resource_title: 'Atomic Force Microscope (Park NX10 AFM)',
        resource_category: 'Laboratory Equipment',
        resource_location: 'Materials Science Center, Room 108',
        resource_image: 'https://images.unsplash.com/photo-1514543250559-83867827ecce?auto=format&fit=crop&w=1000&q=80',
        owner_id: 2,
        owner_name: 'Dr. Sarah Jenkins',
        start_time: new Date(now.getTime() + 4 * 24 * 3600 * 1000).toISOString(),
        end_time: new Date(now.getTime() + 4 * 24 * 3600 * 1000 + 3 * 3600 * 1000).toISOString(),
        total_amount: 2400,
        advance_amount: 1200,
        remaining_amount: 1200,
        advance_paid: 1,
        advance_payment_id: 'txn_adv_2026_98124',
        advance_paid_at: new Date(now.getTime() - 36 * 3600 * 1000).toISOString(),
        final_paid: 0,
        final_payment_id: null,
        final_paid_at: null,
        handover_confirmed: 0,
        handover_confirmed_at: null,
        refund_status: 'none',
        refund_amount: 0,
        purpose: 'Nanoscale topological surface scans for thin film coating',
        attendees_count: 1,
        status: 'booking_confirmed',
        check_in_time: null,
        check_out_time: null,
        created_at: new Date(now.getTime() - 38 * 3600 * 1000).toISOString()
      },
      {
        id: 3,
        resource_id: 5,
        user_id: 4,
        visit_id: null,
        user_name: 'Alex Rivera',
        user_email: 'student@sharesphere.edu',
        resource_title: 'Confocal Laser Scanning Microscope (Leica TCS SP8)',
        resource_category: 'Laser & Optical Systems',
        resource_location: 'Advanced Optics Facility, Suite 12',
        resource_image: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=1000&q=80',
        owner_id: 2,
        owner_name: 'Dr. Sarah Jenkins',
        start_time: new Date(now.getTime() - 6 * 3600 * 1000).toISOString(),
        end_time: new Date(now.getTime() - 2 * 3600 * 1000).toISOString(),
        total_amount: 3500,
        advance_amount: 1750,
        remaining_amount: 1750,
        advance_paid: 1,
        advance_payment_id: 'txn_adv_2026_88312',
        advance_paid_at: new Date(now.getTime() - 48 * 3600 * 1000).toISOString(),
        final_paid: 0,
        final_payment_id: null,
        final_paid_at: null,
        handover_confirmed: 1,
        handover_confirmed_at: new Date(now.getTime() - 7 * 3600 * 1000).toISOString(),
        refund_status: 'none',
        refund_amount: 0,
        purpose: '3D confocal live cell fluorescence sectioning analysis',
        attendees_count: 2,
        status: 'usage_completed',
        check_in_time: new Date(now.getTime() - 6 * 3600 * 1000).toISOString(),
        check_out_time: new Date(now.getTime() - 2 * 3600 * 1000).toISOString(),
        created_at: new Date(now.getTime() - 50 * 3600 * 1000).toISOString()
      },
      {
        id: 4,
        resource_id: 2,
        user_id: 4,
        visit_id: null,
        user_name: 'Alex Rivera',
        user_email: 'student@sharesphere.edu',
        resource_title: 'Bio-Rad C1000 Touch Thermal Cycler (PCR)',
        resource_category: 'Biotechnology',
        resource_location: 'Bioengineering Wing, Lab B-22',
        resource_image: 'https://images.unsplash.com/photo-1579165466791-788189255670?auto=format&fit=crop&w=1000&q=80',
        owner_id: 2,
        owner_name: 'Dr. Sarah Jenkins',
        start_time: new Date(now.getTime() - 72 * 3600 * 1000).toISOString(),
        end_time: new Date(now.getTime() - 69 * 3600 * 1000).toISOString(),
        total_amount: 0.00,
        advance_amount: 0.00,
        remaining_amount: 0.00,
        advance_paid: 1,
        advance_payment_id: 'txn_free_grant',
        advance_paid_at: new Date(now.getTime() - 72 * 3600 * 1000).toISOString(),
        final_paid: 1,
        final_payment_id: 'txn_free_grant',
        final_paid_at: new Date(now.getTime() - 69 * 3600 * 1000).toISOString(),
        handover_confirmed: 1,
        handover_confirmed_at: new Date(now.getTime() - 73 * 3600 * 1000).toISOString(),
        refund_status: 'none',
        refund_amount: 0,
        purpose: 'Gene expression assay amplification samples',
        attendees_count: 2,
        status: 'completed',
        check_in_time: new Date(now.getTime() - 72 * 3600 * 1000).toISOString(),
        check_out_time: new Date(now.getTime() - 69 * 3600 * 1000).toISOString(),
        created_at: new Date(now.getTime() - 120 * 3600 * 1000).toISOString()
      }
    ],
    notifications: [
      {
        id: 1,
        user_id: 4,
        recipient_role: 'student',
        booking_id: 2,
        title: '50% Advance Payment Verified',
        message: 'Your payment of ₹1,200 for Booking #2 (FE-SEM) has been verified. Reservation confirmed!',
        event_type: 'payment_success',
        type: 'payment_success',
        link_url: '/my-bookings/2',
        is_read: 0,
        created_at: new Date(now.getTime() - 24 * 3600 * 1000).toISOString()
      },
      {
        id: 2,
        user_id: 1,
        recipient_role: 'admin',
        booking_id: 2,
        title: 'Payment Received (50% Advance)',
        message: '50% Advance Payment of ₹1,200 verified for Booking #2 (FE-SEM, Alex Rivera).',
        event_type: 'payment_success',
        type: 'payment_success',
        link_url: '/admin/bookings',
        is_read: 0,
        created_at: new Date(now.getTime() - 24 * 3600 * 1000).toISOString()
      },
      {
        id: 3,
        user_id: 2,
        recipient_role: 'owner',
        booking_id: 1,
        title: 'New Booking Request',
        message: 'Alex Rivera has requested to book Field Emission Scanning Electron Microscope (FE-SEM).',
        event_type: 'booking_created',
        type: 'booking_request',
        link_url: '/owner/requests',
        is_read: 0,
        created_at: new Date(now.getTime() - 2 * 3600 * 1000).toISOString()
      },
      {
        id: 4,
        user_id: 1,
        recipient_role: 'admin',
        booking_id: 1,
        title: 'New Booking Request',
        message: 'Alex Rivera submitted a new booking request for "Field Emission Scanning Electron Microscope (FE-SEM)" (Booking #1).',
        event_type: 'booking_created',
        type: 'booking_created',
        link_url: '/admin/bookings',
        is_read: 0,
        created_at: new Date(now.getTime() - 2 * 3600 * 1000).toISOString()
      }
    ],
    notification_preferences: [
      {
        user_id: 1,
        booking_updates: 1,
        booking_reminders: 1,
        cancellation_updates: 1,
        payment_updates: 1,
        browser_push: 0,
        reminder_time_1: 30,
        reminder_time_2: 5,
      },
      {
        user_id: 4,
        booking_updates: 1,
        booking_reminders: 1,
        cancellation_updates: 1,
        payment_updates: 1,
        browser_push: 0,
        reminder_time_1: 30,
        reminder_time_2: 5,
      }
    ],
    incidents: [],
    audit_logs: [
      {
        id: 1,
        user_id: 1,
        user_name: 'System Administrator',
        action: 'SYSTEM_INIT',
        entity_type: 'SYSTEM',
        entity_id: null,
        details: JSON.stringify({ event: 'ShareSphere demonstration store active' }),
        ip_address: '127.0.0.1',
        created_at: new Date(now.getTime() - 48 * 3600 * 1000).toISOString()
      },
      {
        id: 2,
        user_id: 2,
        user_name: 'Dr. Sarah Jenkins',
        action: 'CREATE_RESOURCE',
        entity_type: 'RESOURCE',
        entity_id: 1,
        details: JSON.stringify({ title: 'Field Emission Scanning Electron Microscope (FE-SEM)' }),
        ip_address: '127.0.0.1',
        created_at: new Date(now.getTime() - 40 * 3600 * 1000).toISOString()
      },
      {
        id: 3,
        user_id: 4,
        user_name: 'Alex Rivera',
        action: 'REQUEST_BOOKING',
        entity_type: 'BOOKING',
        entity_id: 1,
        details: JSON.stringify({ resource_id: 1, status: 'pending' }),
        ip_address: '127.0.0.1',
        created_at: new Date(now.getTime() - 2 * 3600 * 1000).toISOString()
      }
    ]
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialStore));
  return initialStore;
}

function saveStore(store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function getCurrentUser() {
  const saved = localStorage.getItem('sharesphere_user');
  return saved ? JSON.parse(saved) : null;
}

export function handleMockRequest(config) {
  const store = getStore();
  const method = (config.method || 'get').toLowerCase();
  const url = config.url.replace(/^\/api/, '');
  const data = typeof config.data === 'string' ? JSON.parse(config.data || '{}') : (config.data || {});
  const currentUser = getCurrentUser();

  // Helper response wrapper
  const respond = (status, payload) => ({
    data: payload,
    status,
    statusText: status >= 200 && status < 300 ? 'OK' : 'Error',
    headers: { 'content-type': 'application/json' },
    config,
  });

  // 1. AUTHENTICATION
  if (url === '/auth/login' && method === 'post') {
    const email = (data.email || '').trim().toLowerCase();
    const user = store.users.find(u => u.email.toLowerCase() === email);
    if (!user) {
      return Promise.reject({
        response: respond(401, { success: false, message: 'Invalid email or password.' })
      });
    }
    const token = `demo_jwt_token_${user.id}_${Date.now()}`;
    return Promise.resolve(respond(200, {
      success: true,
      message: `Welcome back, ${user.full_name}!`,
      data: { user, token }
    }));
  }

  if (url === '/auth/register' && method === 'post') {
    const email = (data.email || '').trim().toLowerCase();
    if (store.users.some(u => u.email.toLowerCase() === email)) {
      return Promise.reject({
        response: respond(409, { success: false, message: 'An account with this email already exists.' })
      });
    }
    const newUser = {
      id: store.users.length + 1,
      full_name: data.full_name,
      email,
      role: data.role || 'student',
      department: data.department || null,
      phone: data.phone || null,
      avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.full_name)}`,
      status: 'active'
    };
    store.users.push(newUser);
    saveStore(store);
    const token = `demo_jwt_token_${newUser.id}_${Date.now()}`;
    return Promise.resolve(respond(201, {
      success: true,
      message: 'Account registered successfully.',
      data: { user: newUser, token }
    }));
  }

  if (url === '/auth/me') {
    if (method === 'get') {
      if (!currentUser) {
        return Promise.reject({ response: respond(401, { success: false, message: 'Unauthorized' }) });
      }
      return Promise.resolve(respond(200, { success: true, data: currentUser }));
    }
    if (method === 'patch') {
      if (!currentUser) {
        return Promise.reject({ response: respond(401, { success: false, message: 'Unauthorized' }) });
      }
      const userIndex = store.users.findIndex(u => u.id === currentUser.id);
      if (userIndex !== -1) {
        store.users[userIndex] = { ...store.users[userIndex], ...data };
        saveStore(store);
      }
      const updated = { ...currentUser, ...data };
      return Promise.resolve(respond(200, { success: true, data: updated }));
    }
  }

  if (url === '/auth/logout' && method === 'post') {
    return Promise.resolve(respond(200, { success: true, message: 'Logged out successfully.' }));
  }

  // 2. RESOURCES
  if (url === '/resources/stats' && method === 'get') {
    return Promise.resolve(respond(200, {
      success: true,
      data: {
        totalResources: store.resources.length,
        activeBookings: store.bookings.filter(b => ['approved', 'checked_in', 'pending'].includes(b.status)).length,
        totalStudents: store.users.filter(u => u.role === 'student').length,
        completedSessions: store.bookings.filter(b => b.status === 'completed').length,
        utilizationRate: 85,
      }
    }));
  }

  if (url === '/resources/owner' && method === 'get') {
    const ownerId = currentUser?.id || 2;
    const list = store.resources.filter(r => r.owner_id === ownerId);
    return Promise.resolve(respond(200, { success: true, data: list }));
  }

  if (url.startsWith('/resources/') && method === 'get') {
    const id = parseInt(url.split('/')[2], 10);
    const resource = store.resources.find(r => r.id === id);
    if (!resource) {
      return Promise.reject({ response: respond(404, { success: false, message: 'Resource not found' }) });
    }
    return Promise.resolve(respond(200, { success: true, data: resource }));
  }

  if (url.startsWith('/resources') && method === 'get') {
    let params = config.params || {};
    if (url.includes('?')) {
      const qs = url.split('?')[1];
      const parsed = Object.fromEntries(new URLSearchParams(qs));
      params = { ...params, ...parsed };
    }

    let list = [...store.resources];
    if (params.status && params.status !== 'all') {
      list = list.filter(r => r.status === params.status);
    }
    if (params.search && params.search.trim()) {
      const s = params.search.toLowerCase().trim();
      list = list.filter(r =>
        (r.title || '').toLowerCase().includes(s) ||
        (r.description || '').toLowerCase().includes(s) ||
        (r.location || '').toLowerCase().includes(s) ||
        (r.category || '').toLowerCase().includes(s)
      );
    }
    if (params.category && params.category !== 'all' && params.category !== 'All Categories') {
      list = list.filter(r => (r.category || '').toLowerCase() === params.category.toLowerCase());
    }
    if (params.type && params.type !== 'all') {
      list = list.filter(r => r.type === params.type);
    }
    if (params.maxPrice !== undefined && params.maxPrice !== '') {
      const max = parseFloat(params.maxPrice);
      if (!isNaN(max)) {
        list = list.filter(r => Number(r.fee_per_hour) <= max);
      }
    }

    if (params.sort === 'price-low') {
      list.sort((a, b) => Number(a.fee_per_hour) - Number(b.fee_per_hour));
    } else if (params.sort === 'price-high') {
      list.sort((a, b) => Number(b.fee_per_hour) - Number(a.fee_per_hour));
    } else if (params.sort === 'capacity') {
      list.sort((a, b) => Number(b.capacity) - Number(a.capacity));
    } else {
      list.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    }

    const total = list.length;
    const page = parseInt(params.page || 1, 10);
    const limit = parseInt(params.limit || 50, 10);
    const paged = list.slice((page - 1) * limit, page * limit);

    return Promise.resolve(respond(200, {
      success: true,
      data: paged,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      }
    }));
  }

  if (url === '/resources' && method === 'post') {
    const newRes = {
      id: store.resources.length + 1,
      owner_id: currentUser?.id || 2,
      owner_name: currentUser?.full_name || 'Owner',
      status: 'active',
      primary_image: data.images?.[0] || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80',
      ...data
    };
    store.resources.push(newRes);
    saveStore(store);
    return Promise.resolve(respond(201, { success: true, data: newRes }));
  }

  if (url.startsWith('/resources/') && method === 'patch') {
    const id = parseInt(url.split('/')[2], 10);
    const idx = store.resources.findIndex(r => r.id === id);
    if (idx !== -1) {
      store.resources[idx] = { ...store.resources[idx], ...data };
      saveStore(store);
      return Promise.resolve(respond(200, { success: true, data: store.resources[idx] }));
    }
  }

  if (url.startsWith('/resources/') && method === 'delete') {
    const id = parseInt(url.split('/')[2], 10);
    store.resources = store.resources.filter(r => r.id !== id);
    saveStore(store);
    return Promise.resolve(respond(200, { success: true, message: 'Resource deleted' }));
  }

  // 3. BOOKINGS
  if (url.startsWith('/bookings/my') && method === 'get') {
    const userId = currentUser?.id || 4;
    const list = store.bookings.filter(b => b.user_id === userId);
    return Promise.resolve(respond(200, { success: true, data: list }));
  }

  if (url.startsWith('/bookings/requests') && method === 'get') {
    const ownerId = currentUser?.id || 2;
    const list = store.bookings.filter(b => b.owner_id === ownerId);
    return Promise.resolve(respond(200, { success: true, data: list }));
  }

  if (url.startsWith('/bookings/') && method === 'get') {
    const id = parseInt(url.split('/')[2], 10);
    const booking = store.bookings.find(b => b.id === id);
    return Promise.resolve(respond(200, {
      success: true,
      data: { ...(booking || store.bookings[0]), condition_reports: [] }
    }));
  }

  if (url === '/bookings' && method === 'post') {
    const resId = parseInt(data.resource_id, 10);
    const resObj = store.resources.find(r => r.id === resId);

    // Overlap prevention:
    const newStart = new Date(data.start_time).getTime();
    const newEnd = new Date(data.end_time).getTime();
    const hasConflict = store.bookings.some(b => {
      if (b.resource_id !== resId) return false;
      if (['rejected', 'cancelled', 'cancelled_after_visit'].includes(b.status)) return false;
      const bStart = new Date(b.start_time).getTime();
      const bEnd = new Date(b.end_time).getTime();
      return (newStart < bEnd && newEnd > bStart);
    });

    if (hasConflict) {
      return Promise.reject({
        response: respond(409, {
          success: false,
          message: 'This resource is already booked for the selected time window. Please choose another slot.'
        })
      });
    }

    const durationHours = Math.max(0, (newEnd - newStart) / (1000 * 3600));
    const hourlyFee = Number(resObj?.fee_per_hour || 0);
    const totalAmount = Math.round(durationHours * hourlyFee * 100) / 100;
    const advanceAmount = Math.round(totalAmount * 50) / 100;
    const remainingAmount = Math.round((totalAmount - advanceAmount) * 100) / 100;

    let initialStatus = 'advance_pending';
    let advPaid = 0;
    let finPaid = 0;
    if (totalAmount === 0) {
      initialStatus = resObj?.requires_approval ? 'pending' : 'approved';
      advPaid = 1;
      finPaid = 1;
    }

    const newBooking = {
      id: store.bookings.length + 1,
      resource_id: resId,
      visit_id: data.visit_id ? parseInt(data.visit_id, 10) : null,
      resource_title: resObj?.title || 'Resource',
      resource_category: resObj?.category || 'General',
      resource_location: resObj?.location || 'Campus',
      resource_image: resObj?.primary_image || null,
      user_id: currentUser?.id || 4,
      user_name: currentUser?.full_name || 'Alex Rivera',
      user_email: currentUser?.email || 'student@sharesphere.edu',
      owner_id: resObj?.owner_id || 2,
      owner_name: resObj?.owner_name || 'Owner',
      start_time: data.start_time,
      end_time: data.end_time,
      total_amount: totalAmount,
      advance_amount: advanceAmount,
      remaining_amount: remainingAmount,
      advance_paid: advPaid,
      advance_payment_id: null,
      advance_paid_at: null,
      final_paid: finPaid,
      final_payment_id: null,
      final_paid_at: null,
      handover_confirmed: 0,
      handover_confirmed_at: null,
      refund_status: 'none',
      refund_amount: 0,
      purpose: data.purpose,
      attendees_count: data.attendees_count || 1,
      status: initialStatus,
      check_in_time: null,
      check_out_time: null,
      created_at: new Date().toISOString()
    };
    store.bookings.unshift(newBooking);
    mockNotifyBookingEvent(store, { eventType: 'booking_created', booking: newBooking, actorName: currentUser?.full_name || 'Alex Rivera' });
    saveStore(store);
    return Promise.resolve(respond(201, {
      success: true,
      data: newBooking,
      message: totalAmount > 0
        ? 'Booking slot reserved. Please pay the 50% advance to confirm your reservation.'
        : 'Booking submitted successfully.'
    }));
  }

  if (url.includes('/approve') && method === 'patch' && !url.includes('/visits/')) {
    const id = parseInt(url.split('/')[2], 10);
    const b = store.bookings.find(bk => bk.id === id);
    if (b) {
      b.status = 'approved';
      mockNotifyBookingEvent(store, { eventType: 'booking_approved', booking: b, actorName: currentUser?.full_name || 'Admin' });
      saveStore(store);
    }
    return Promise.resolve(respond(200, { success: true, data: b }));
  }

  if (url.includes('/reject') && method === 'patch' && !url.includes('/visits/')) {
    const id = parseInt(url.split('/')[2], 10);
    const b = store.bookings.find(bk => bk.id === id);
    if (b) {
      b.status = 'rejected';
      b.rejection_reason = data.reason || 'Declined by facility owner';
      mockNotifyBookingEvent(store, { eventType: 'booking_rejected', booking: b, reason: data.reason, actorName: currentUser?.full_name || 'Admin' });
      saveStore(store);
    }
    return Promise.resolve(respond(200, { success: true, data: b }));
  }

  if (url.includes('/cancel') && method === 'patch' && !url.includes('/visits/')) {
    const id = parseInt(url.split('/')[2], 10);
    const b = store.bookings.find(bk => bk.id === id);
    if (b) {
      b.status = 'cancelled';
      b.cancellation_reason = data.reason || 'Student cancelled booking';
      mockNotifyBookingEvent(store, { eventType: 'booking_cancelled', booking: b, reason: data.reason, actorName: currentUser?.full_name || 'Student' });
      saveStore(store);
    }
    return Promise.resolve(respond(200, { success: true, data: b }));
  }

  if (url.includes('/check-in') && method === 'patch') {
    const id = parseInt(url.split('/')[2], 10);
    const b = store.bookings.find(bk => bk.id === id);
    if (b) { b.status = 'in_use'; b.check_in_time = new Date().toISOString(); saveStore(store); }
    return Promise.resolve(respond(200, { success: true, data: b }));
  }

  if (url.includes('/check-out') && method === 'patch') {
    const id = parseInt(url.split('/')[2], 10);
    const b = store.bookings.find(bk => bk.id === id);
    if (b) {
      b.status = b.final_paid ? 'completed' : 'usage_completed';
      b.check_out_time = new Date().toISOString();
      saveStore(store);
    }
    return Promise.resolve(respond(200, { success: true, data: b }));
  }

  // 4. PHYSICAL VISITS
  if (url === '/visits' && method === 'post') {
    const resId = parseInt(data.resource_id, 10);
    const resObj = store.resources.find(r => r.id === resId);
    const pDate = data.preferred_date;
    const pTime = data.preferred_time;

    const conflict = (store.visits || []).some(v =>
      v.resource_id === resId &&
      ['visit_requested', 'visit_approved', 'visit_rescheduled'].includes(v.status) &&
      v.preferred_date === pDate &&
      v.preferred_time === pTime
    );

    if (conflict) {
      return Promise.reject({
        response: respond(409, {
          success: false,
          message: 'A physical inspection visit is already scheduled for this resource at that time. Please pick another time slot.'
        })
      });
    }

    const newVisit = {
      id: (store.visits?.length || 0) + 1,
      resource_id: resId,
      user_id: currentUser?.id || 4,
      owner_id: resObj?.owner_id || 2,
      user_name: currentUser?.full_name || 'Alex Rivera',
      user_email: currentUser?.email || 'student@sharesphere.edu',
      user_phone: currentUser?.phone || '+1-555-0104',
      resource_title: resObj?.title || 'Resource',
      resource_location: resObj?.location || 'Campus Center',
      preferred_date: pDate,
      preferred_time: pTime,
      notes: data.notes || '',
      status: 'visit_requested',
      rescheduled_date: null,
      rescheduled_time: null,
      rescheduled_notes: null,
      rejection_reason: null,
      outcome: null,
      outcome_notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (!store.visits) store.visits = [];
    store.visits.unshift(newVisit);

    // Notify owner
    store.notifications.unshift({
      id: store.notifications.length + 1,
      user_id: resObj?.owner_id || 2,
      title: 'Physical Visit Requested',
      message: `${currentUser?.full_name || 'A student'} requested a physical inspection for ${resObj?.title || 'your resource'} on ${pDate} at ${pTime}.`,
      type: 'visit_request',
      link_url: '/owner/requests',
      is_read: 0,
      created_at: new Date().toISOString()
    });

    saveStore(store);
    return Promise.resolve(respond(201, {
      success: true,
      data: newVisit,
      message: 'Physical visit request submitted. Facility owner will review your appointment.'
    }));
  }

  if (url === '/visits/my' && method === 'get') {
    const userId = currentUser?.id || 4;
    const list = (store.visits || []).filter(v => v.user_id === userId);
    return Promise.resolve(respond(200, { success: true, data: list }));
  }

  if (url === '/visits/owner' && method === 'get') {
    const ownerId = currentUser?.id || 2;
    const list = (store.visits || []).filter(v => v.owner_id === ownerId);
    return Promise.resolve(respond(200, { success: true, data: list }));
  }

  if (url.startsWith('/visits/') && method === 'get') {
    const id = parseInt(url.split('/')[2], 10);
    const v = (store.visits || []).find(x => x.id === id);
    if (!v) {
      return Promise.reject({ response: respond(404, { success: false, message: 'Visit not found' }) });
    }
    return Promise.resolve(respond(200, { success: true, data: v }));
  }

  if (url.includes('/visits/') && url.includes('/approve') && method === 'patch') {
    const id = parseInt(url.split('/')[2], 10);
    const v = (store.visits || []).find(x => x.id === id);
    if (v) {
      v.status = 'visit_approved';
      v.updated_at = new Date().toISOString();
      saveStore(store);
      return Promise.resolve(respond(200, { success: true, data: v, message: 'Physical visit approved.' }));
    }
  }

  if (url.includes('/visits/') && url.includes('/reject') && method === 'patch') {
    const id = parseInt(url.split('/')[2], 10);
    const v = (store.visits || []).find(x => x.id === id);
    if (v) {
      v.status = 'visit_rejected';
      v.rejection_reason = data.reason || 'Proposed time slot is unavailable';
      v.updated_at = new Date().toISOString();
      saveStore(store);
      return Promise.resolve(respond(200, { success: true, data: v, message: 'Physical visit declined.' }));
    }
  }

  if (url.includes('/visits/') && url.includes('/reschedule') && method === 'patch') {
    const id = parseInt(url.split('/')[2], 10);
    const v = (store.visits || []).find(x => x.id === id);
    if (v) {
      v.status = 'visit_rescheduled';
      v.rescheduled_date = data.rescheduled_date;
      v.rescheduled_time = data.rescheduled_time;
      v.rescheduled_notes = data.rescheduled_notes || '';
      v.preferred_date = data.rescheduled_date;
      v.preferred_time = data.rescheduled_time;
      v.updated_at = new Date().toISOString();
      saveStore(store);
      return Promise.resolve(respond(200, { success: true, data: v, message: 'New visit date/time proposed.' }));
    }
  }

  if (url.includes('/visits/') && url.includes('/complete') && method === 'patch') {
    const id = parseInt(url.split('/')[2], 10);
    const v = (store.visits || []).find(x => x.id === id);
    if (v) {
      v.status = 'visit_completed';
      v.updated_at = new Date().toISOString();
      saveStore(store);
      return Promise.resolve(respond(200, { success: true, data: v, message: 'Physical inspection completed.' }));
    }
  }

  if (url.includes('/visits/') && url.includes('/decision') && method === 'patch') {
    const id = parseInt(url.split('/')[2], 10);
    const v = (store.visits || []).find(x => x.id === id);
    if (v) {
      const decision = data.decision;
      if (decision === 'not_interested') {
        v.status = 'cancelled_after_visit';
        v.outcome = 'not_interested';
        v.outcome_notes = data.notes || 'User decided not to proceed after physical inspection.';
        v.updated_at = new Date().toISOString();
        saveStore(store);
        return Promise.resolve(respond(200, {
          success: true,
          data: v,
          message: 'Visit request closed. No advance fee charged, record preserved.'
        }));
      } else {
        v.outcome = 'interested';
        v.outcome_notes = data.notes || 'User confirmed interest after physical inspection.';
        v.status = 'visit_completed';
        v.updated_at = new Date().toISOString();
        saveStore(store);
        return Promise.resolve(respond(200, {
          success: true,
          data: v,
          message: 'Interest confirmed. You may now proceed to booking and pay the 50% advance.'
        }));
      }
    }
  }

  // 5. PAYMENTS (50/50 SECURE TEST GATEWAY)
  if (url === '/payments/calculate' && method === 'post') {
    const resObj = store.resources.find(r => r.id === parseInt(data.resource_id, 10));
    const hourlyRate = Number(resObj?.fee_per_hour || 0);
    const start = new Date(data.start_time);
    const end = new Date(data.end_time);
    const durationHours = Math.max(0, (end - start) / (1000 * 3600));
    const basePrice = Math.round(durationHours * hourlyRate * 100) / 100;
    const taxes = 0;
    const totalAmount = basePrice + taxes;
    const advanceAmount = Math.round(totalAmount * 50) / 100;
    const remainingAmount = Math.round((totalAmount - advanceAmount) * 100) / 100;

    return Promise.resolve(respond(200, {
      success: true,
      data: {
        duration_hours: durationHours,
        rate_per_hour: hourlyRate,
        base_price: basePrice,
        taxes,
        total_amount: totalAmount,
        advance_amount: advanceAmount,
        remaining_amount: remainingAmount,
        advance_percentage: 50,
        remaining_percentage: 50,
        currency: 'INR'
      }
    }));
  }

  if (url === '/payments/advance' && method === 'post') {
    const bookingId = parseInt(data.booking_id, 10);
    const b = store.bookings.find(bk => bk.id === bookingId);
    if (!b) return Promise.reject({ response: respond(404, { success: false, message: 'Booking not found' }) });
    if (b.advance_paid === 1) {
      return Promise.reject({ response: respond(400, { success: false, message: '50% advance payment has already been verified for this booking.' }) });
    }
    if (data.simulate_failure) {
      return Promise.reject({ response: respond(402, { success: false, message: 'Payment authorization declined by gateway (Simulated Test Mode Failure).' }) });
    }

    const nowIso = new Date().toISOString();
    const txnId = `txn_adv_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    const receiptNo = `RCPT-ADV-${new Date().getFullYear()}-${String(b.id).padStart(4, '0')}`;

    b.advance_paid = 1;
    b.advance_payment_id = txnId;
    b.advance_paid_at = nowIso;
    b.status = 'booking_confirmed';

    if (!store.payments) store.payments = [];
    const paymentRecord = {
      id: store.payments.length + 1,
      booking_id: b.id,
      user_id: b.user_id,
      payment_type: 'advance_50',
      amount: b.advance_amount,
      currency: 'INR',
      status: 'success',
      gateway: data.gateway || 'ShareSphere Verified Test Gateway',
      transaction_id: txnId,
      receipt_number: receiptNo,
      payment_method: data.payment_method || 'UPI / NetBanking',
      created_at: nowIso
    };
    store.payments.push(paymentRecord);
    mockNotifyBookingEvent(store, { eventType: 'payment_success', booking: b, metadata: { amount: b.advance_amount, paymentType: 'advance_50' } });
    saveStore(store);

    return Promise.resolve(respond(200, {
      success: true,
      message: '50% advance payment verified. Reservation officially confirmed!',
      data: {
        payment: paymentRecord,
        booking: b,
        receipt: {
          receipt_number: receiptNo,
          transaction_id: txnId,
          date: nowIso,
          amount_paid: b.advance_amount,
          remaining_balance: b.remaining_amount,
          payment_type: '50% Advance Reservation Payment',
          status: 'PAID'
        }
      }
    }));
  }

  if (url === '/payments/remaining' && method === 'post') {
    const bookingId = parseInt(data.booking_id, 10);
    const b = store.bookings.find(bk => bk.id === bookingId);
    if (!b) return Promise.reject({ response: respond(404, { success: false, message: 'Booking not found' }) });
    if (b.advance_paid !== 1) {
      return Promise.reject({ response: respond(400, { success: false, message: '50% advance payment must be verified before remaining payment can be collected.' }) });
    }
    if (b.final_paid === 1) {
      return Promise.reject({ response: respond(400, { success: false, message: 'Remaining balance has already been fully paid.' }) });
    }
    if (data.simulate_failure) {
      return Promise.reject({ response: respond(402, { success: false, message: 'Payment authorization declined by gateway (Simulated Test Mode Failure).' }) });
    }

    const nowIso = new Date().toISOString();
    const txnId = `txn_fin_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    const receiptNo = `RCPT-FIN-${new Date().getFullYear()}-${String(b.id).padStart(4, '0')}`;

    b.final_paid = 1;
    b.final_payment_id = txnId;
    b.final_paid_at = nowIso;
    b.status = 'completed';

    if (!store.payments) store.payments = [];
    const paymentRecord = {
      id: store.payments.length + 1,
      booking_id: b.id,
      user_id: b.user_id,
      payment_type: 'final_50',
      amount: b.remaining_amount,
      currency: 'INR',
      status: 'success',
      gateway: data.gateway || 'ShareSphere Verified Test Gateway',
      transaction_id: txnId,
      receipt_number: receiptNo,
      payment_method: data.payment_method || 'UPI / NetBanking',
      created_at: nowIso
    };
    store.payments.push(paymentRecord);
    mockNotifyBookingEvent(store, { eventType: 'payment_success', booking: b, metadata: { amount: b.remaining_amount, paymentType: 'final_50' } });
    saveStore(store);

    return Promise.resolve(respond(200, {
      success: true,
      message: 'Remaining 50% balance verified. Booking fully paid and completed!',
      data: {
        payment: paymentRecord,
        booking: b,
        receipt: {
          receipt_number: receiptNo,
          transaction_id: txnId,
          date: nowIso,
          amount_paid: b.remaining_amount,
          remaining_balance: 0,
          payment_type: 'Final 50% Settlement Payment',
          status: 'FULLY PAID'
        }
      }
    }));
  }

  if (url.includes('/payments/bookings/') && url.includes('/handover') && method === 'patch') {
    const id = parseInt(url.split('/')[3], 10);
    const b = store.bookings.find(bk => bk.id === id);
    if (b) {
      b.handover_confirmed = 1;
      b.handover_confirmed_at = new Date().toISOString();
      b.status = 'resource_ready';
      saveStore(store);
      return Promise.resolve(respond(200, {
        success: true,
        data: b,
        message: 'Resource preparation and handover confirmed. Ready for user access.'
      }));
    }
  }

  if (url.includes('/payments/bookings/') && url.includes('/start-use') && method === 'patch') {
    const id = parseInt(url.split('/')[3], 10);
    const b = store.bookings.find(bk => bk.id === id);
    if (b) {
      b.status = 'in_use';
      b.check_in_time = new Date().toISOString();
      saveStore(store);
      return Promise.resolve(respond(200, {
        success: true,
        data: b,
        message: 'Resource usage started.'
      }));
    }
  }

  if (url.includes('/payments/bookings/') && url.includes('/complete-use') && method === 'patch') {
    const id = parseInt(url.split('/')[3], 10);
    const b = store.bookings.find(bk => bk.id === id);
    if (b) {
      b.status = 'usage_completed';
      b.check_out_time = new Date().toISOString();
      saveStore(store);
      return Promise.resolve(respond(200, {
        success: true,
        data: b,
        message: 'Resource usage marked completed. Remaining 50% balance is now payable.'
      }));
    }
  }

  if (url.includes('/payments/bookings/') && url.includes('/refund') && method === 'patch') {
    const id = parseInt(url.split('/')[3], 10);
    const b = store.bookings.find(bk => bk.id === id);
    if (b) {
      const hoursNotice = Math.max(0, (new Date(b.start_time) - new Date()) / (1000 * 3600));
      let refundPercentage = 0;
      if (hoursNotice >= 24) refundPercentage = 100;
      else if (hoursNotice >= 2) refundPercentage = 50;
      else refundPercentage = 0;

      const refundAmount = Math.round(Number(b.advance_amount || 0) * (refundPercentage / 100) * 100) / 100;
      b.status = 'cancelled';
      b.refund_status = refundAmount > 0 ? 'processed' : 'none';
      b.refund_amount = refundAmount;
      b.cancellation_reason = data.reason || 'User cancelled booking';

      if (refundAmount > 0) {
        if (!store.payments) store.payments = [];
        store.payments.push({
          id: store.payments.length + 1,
          booking_id: b.id,
          user_id: b.user_id,
          payment_type: 'refund',
          amount: refundAmount,
          currency: 'INR',
          status: 'success',
          gateway: 'ShareSphere Verified Test Gateway',
          transaction_id: `txn_ref_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
          receipt_number: `RCPT-REF-${new Date().getFullYear()}-${String(b.id).padStart(4, '0')}`,
          payment_method: 'Original Payment Method',
          created_at: new Date().toISOString()
        });
      }
      saveStore(store);
      return Promise.resolve(respond(200, {
        success: true,
        data: b,
        message: `Reservation cancelled. Refund: ₹${refundAmount} (${refundPercentage}% per cancellation terms).`
      }));
    }
  }

  if (url === '/payments/my' && method === 'get') {
    const userId = currentUser?.id || 4;
    const list = (store.payments || []).filter(p => p.user_id === userId);
    return Promise.resolve(respond(200, { success: true, data: list }));
  }

  if (url === '/payments/owner/earnings' && method === 'get') {
    const ownerId = currentUser?.id || 2;
    const ownerBookings = store.bookings.filter(b => b.owner_id === ownerId);
    const totalEarned = ownerBookings
      .filter(b => b.advance_paid === 1)
      .reduce((sum, b) => sum + Number(b.advance_amount || 0) + (b.final_paid === 1 ? Number(b.remaining_amount || 0) : 0), 0);
    const pendingRemaining = ownerBookings
      .filter(b => b.advance_paid === 1 && b.final_paid === 0 && !['cancelled', 'rejected'].includes(b.status))
      .reduce((sum, b) => sum + Number(b.remaining_amount || 0), 0);
    return Promise.resolve(respond(200, {
      success: true,
      data: {
        total_earned: totalEarned,
        pending_remaining: pendingRemaining,
        total_bookings: ownerBookings.length,
        confirmed_bookings: ownerBookings.filter(b => b.advance_paid === 1).length
      }
    }));
  }

  // 4. NOTIFICATIONS & REAL-TIME EVENT STREAM
  if (url === '/notifications/unread-count' && method === 'get') {
    mockRunScheduler(store);
    saveStore(store);
    const uid = currentUser?.id || 4;
    const count = (store.notifications || []).filter(n => n.user_id === uid && !n.is_read).length;
    return Promise.resolve(respond(200, { success: true, count }));
  }

  if (url === '/notifications/preferences' && method === 'get') {
    const uid = currentUser?.id || 4;
    if (!store.notification_preferences) store.notification_preferences = [];
    let pref = store.notification_preferences.find(p => p.user_id === uid);
    if (!pref) {
      pref = {
        user_id: uid,
        booking_updates: 1,
        booking_reminders: 1,
        cancellation_updates: 1,
        payment_updates: 1,
        browser_push: 0,
        reminder_time_1: 30,
        reminder_time_2: 5,
      };
      store.notification_preferences.push(pref);
      saveStore(store);
    }
    return Promise.resolve(respond(200, { success: true, data: pref }));
  }

  if (url === '/notifications/preferences' && (method === 'patch' || method === 'put')) {
    const uid = currentUser?.id || 4;
    if (!store.notification_preferences) store.notification_preferences = [];
    let pref = store.notification_preferences.find(p => p.user_id === uid);
    if (!pref) {
      pref = { user_id: uid };
      store.notification_preferences.push(pref);
    }
    Object.assign(pref, data);
    saveStore(store);
    return Promise.resolve(respond(200, { success: true, message: 'Preferences updated', data: pref }));
  }

  if (url === '/notifications/scheduler/run' && method === 'post') {
    mockRunScheduler(store);
    saveStore(store);
    return Promise.resolve(respond(200, {
      success: true,
      message: 'Booking scheduler execution completed.',
      summary: {
        reminders30mSent: 1,
        reminders5mSent: 0,
        startedSent: 0,
        expiredUpdated: 0,
        overdueSent: 0,
        timestamp: new Date().toISOString()
      }
    }));
  }

  if (url.startsWith('/notifications') && method === 'get') {
    mockRunScheduler(store);
    saveStore(store);

    let params = config.params || {};
    if (url.includes('?')) {
      const qs = url.split('?')[1];
      const parsed = Object.fromEntries(new URLSearchParams(qs));
      params = { ...params, ...parsed };
    }

    const uid = currentUser?.id || 4;
    let list = (store.notifications || []).filter(n => n.user_id === uid);

    if (params.category && params.category !== 'all') {
      if (params.category === 'unread') {
        list = list.filter(n => !n.is_read);
      } else if (params.category === 'bookings') {
        list = list.filter(n =>
          ['booking_created', 'booking_approved', 'booking_rejected', 'booking_cancelled', 'booking_rescheduled'].includes(n.event_type) ||
          ['booking_request', 'booking_approved', 'booking_rejected', 'booking_cancelled'].includes(n.type)
        );
      } else if (params.category === 'reminders') {
        list = list.filter(n =>
          ['reminder_30m', 'reminder_5m', 'booking_started', 'booking_expired', 'booking_overdue'].includes(n.event_type)
        );
      } else if (params.category === 'payments') {
        list = list.filter(n =>
          ['payment_success', 'payment_failed', 'payment_received'].includes(n.event_type) ||
          ['payment_success', 'payment_failed', 'payment_received'].includes(n.type)
        );
      } else if (params.category === 'system') {
        list = list.filter(n =>
          ['system', 'feedback_request', 'incident_reported', 'visit_request', 'visit_approved', 'visit_rejected'].includes(n.event_type)
        );
      }
    }

    if (params.search && params.search.trim()) {
      const s = params.search.toLowerCase().trim();
      list = list.filter(n =>
        (n.title && n.title.toLowerCase().includes(s)) ||
        (n.message && n.message.toLowerCase().includes(s))
      );
    }

    const unreadCount = (store.notifications || []).filter(n => n.user_id === uid && !n.is_read).length;
    return Promise.resolve(respond(200, {
      success: true,
      data: list,
      unreadCount,
      pagination: {
        total: list.length,
        page: 1,
        limit: 50,
        totalPages: 1
      }
    }));
  }

  if (url.includes('/read-all') && method === 'patch') {
    const uid = currentUser?.id || 4;
    (store.notifications || []).filter(n => n.user_id === uid).forEach(n => { n.is_read = 1; });
    saveStore(store);
    return Promise.resolve(respond(200, { success: true }));
  }

  if (url.startsWith('/notifications/') && method === 'patch') {
    const id = parseInt(url.split('/')[2], 10);
    const n = (store.notifications || []).find(nt => nt.id === id);
    if (n) { n.is_read = 1; saveStore(store); }
    return Promise.resolve(respond(200, { success: true }));
  }

  // 5. INCIDENTS
  if (url === '/incidents' && method === 'get') {
    return Promise.resolve(respond(200, { success: true, data: store.incidents }));
  }
  if (url === '/incidents' && method === 'post') {
    const inc = {
      id: store.incidents.length + 1,
      reporter_name: currentUser?.full_name || 'Alex Rivera',
      status: 'open',
      created_at: new Date().toISOString(),
      ...data
    };
    store.incidents.push(inc);

    // Notify user & admin
    store.notifications.unshift({
      id: store.notifications.length + 1,
      user_id: currentUser?.id || 4,
      recipient_role: 'student',
      title: 'Incident Report Received',
      message: `Your report regarding "${data.title || 'Resource'}" has been submitted for administrative review.`,
      event_type: 'incident_reported',
      type: 'incident_reported',
      link_url: '/dashboard',
      is_read: 0,
      created_at: new Date().toISOString()
    });

    store.notifications.unshift({
      id: store.notifications.length + 1,
      user_id: 1,
      recipient_role: 'admin',
      title: 'New Incident Reported',
      message: `${currentUser?.full_name || 'Alex Rivera'} reported an incident: "${data.title || 'Resource'}" (${data.severity || 'medium'} severity).`,
      event_type: 'incident_reported',
      type: 'incident_reported',
      link_url: '/admin/incidents',
      is_read: 0,
      created_at: new Date().toISOString()
    });

    saveStore(store);
    return Promise.resolve(respond(201, { success: true, data: inc }));
  }
  if (url.includes('/resolve') && method === 'patch') {
    const id = parseInt(url.split('/')[2], 10);
    const inc = store.incidents.find(i => i.id === id);
    if (inc) { inc.status = 'resolved'; saveStore(store); }
    return Promise.resolve(respond(200, { success: true, data: inc }));
  }

  // 6. ADMIN
  if (url.startsWith('/admin/users') && method === 'get') {
    return Promise.resolve(respond(200, { success: true, data: store.users }));
  }
  if (url.startsWith('/admin/users/') && method === 'patch') {
    const id = parseInt(url.split('/')[3], 10);
    const u = store.users.find(usr => usr.id === id);
    if (u) { u.status = data.status || u.status; saveStore(store); }
    return Promise.resolve(respond(200, { success: true, data: u }));
  }
  if (url.startsWith('/admin/bookings') && method === 'get') {
    return Promise.resolve(respond(200, { success: true, data: store.bookings }));
  }
  if (url.startsWith('/admin/audit-logs') && method === 'get') {
    return Promise.resolve(respond(200, { success: true, data: store.audit_logs }));
  }

  // 7. HEALTH
  if (url === '/health' && method === 'get') {
    return Promise.resolve(respond(200, {
      status: 'healthy',
      application: 'ShareSphere API (Demonstration Store)',
      version: '1.0.0',
      database: { connected: true, provider: 'resilient_mock_store' }
    }));
  }

  // 8. CONTACT
  if (url === '/contact' && method === 'post') {
    return Promise.resolve(respond(201, { success: true, message: 'Message sent successfully.' }));
  }

  // Fallback
  return Promise.resolve(respond(200, { success: true, data: [] }));
}

