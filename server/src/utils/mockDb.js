// In-memory relational demo store that mirrors MySQL schema for demonstration and testing
// when a live MySQL server is not yet started by the user.

export function createMockStore() {
  const users = [
    {
      id: 1,
      full_name: 'System Administrator',
      email: 'admin@sharesphere.edu',
      password_hash: '$2a$10$E493dGvGY792P9b/Y7pq3eDbZunsJ5mnANE8URtAX5p3E/ctGirP6', // Password123!
      role: 'admin',
      department: 'Central Administration & IT',
      phone: '+1-555-0100',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
      status: 'active',
      created_at: new Date('2026-01-01T08:00:00Z')
    },
    {
      id: 2,
      full_name: 'Dr. Sarah Jenkins',
      email: 'owner@sharesphere.edu',
      password_hash: '$2a$10$E493dGvGY792P9b/Y7pq3eDbZunsJ5mnANE8URtAX5p3E/ctGirP6',
      role: 'owner',
      department: 'Nanotechnology & Materials Lab',
      phone: '+1-555-0102',
      avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
      status: 'active',
      created_at: new Date('2026-01-05T09:00:00Z')
    },
    {
      id: 4,
      full_name: 'Alex Rivera',
      email: 'student@sharesphere.edu',
      password_hash: '$2a$10$E493dGvGY792P9b/Y7pq3eDbZunsJ5mnANE8URtAX5p3E/ctGirP6',
      role: 'student',
      department: 'Biomedical Engineering (Year 3)',
      phone: '+1-555-0104',
      avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&q=80',
      status: 'active',
      created_at: new Date('2026-01-10T10:00:00Z')
    },
    {
      id: 5,
      full_name: 'Emma Watson',
      email: 'student2@sharesphere.edu',
      password_hash: '$2a$10$E493dGvGY792P9b/Y7pq3eDbZunsJ5mnANE8URtAX5p3E/ctGirP6',
      role: 'student',
      department: 'Electrical Engineering (Year 2)',
      phone: '+1-555-0105',
      avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&q=80',
      status: 'active',
      created_at: new Date('2026-01-12T11:00:00Z')
    }
  ];

  const resources = [
    {
      id: 1,
      owner_id: 2,
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
      created_at: new Date('2026-01-15T09:00:00Z')
    },
    {
      id: 2,
      owner_id: 2,
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
      created_at: new Date('2026-01-16T10:00:00Z')
    },
    {
      id: 3,
      owner_id: 2,
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
      created_at: new Date('2026-01-18T11:00:00Z')
    },
    {
      id: 4,
      owner_id: 2,
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
      created_at: new Date('2026-01-20T12:00:00Z')
    },
    {
      id: 5,
      owner_id: 2,
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
      created_at: new Date('2026-01-22T13:00:00Z')
    },
    {
      id: 6,
      owner_id: 2,
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
      created_at: new Date('2026-01-25T14:00:00Z')
    },
    {
      id: 7,
      owner_id: 2,
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
      created_at: new Date('2026-01-26T15:00:00Z')
    },
    {
      id: 8,
      owner_id: 2,
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
      created_at: new Date('2026-01-28T16:00:00Z')
    }
  ];

  const resource_images = [
    { id: 1, resource_id: 1, image_url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80', is_primary: 1 },
    { id: 2, resource_id: 1, image_url: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1000&q=80', is_primary: 0 },
    { id: 3, resource_id: 2, image_url: 'https://images.unsplash.com/photo-1579165466791-788189255670?auto=format&fit=crop&w=1000&q=80', is_primary: 1 },
    { id: 4, resource_id: 3, image_url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1000&q=80', is_primary: 1 },
    { id: 5, resource_id: 4, image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=80', is_primary: 1 },
    { id: 6, resource_id: 5, image_url: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=1000&q=80', is_primary: 1 },
    { id: 7, resource_id: 6, image_url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1000&q=80', is_primary: 1 },
    { id: 8, resource_id: 7, image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80', is_primary: 1 },
    { id: 9, resource_id: 8, image_url: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1000&q=80', is_primary: 1 }
  ];

  const resource_availability = [
    { id: 1, resource_id: 1, day_of_week: 1, start_time: '09:00:00', end_time: '17:00:00', is_available: 1 },
    { id: 2, resource_id: 1, day_of_week: 2, start_time: '09:00:00', end_time: '17:00:00', is_available: 1 },
    { id: 3, resource_id: 1, day_of_week: 3, start_time: '09:00:00', end_time: '17:00:00', is_available: 1 },
    { id: 4, resource_id: 1, day_of_week: 4, start_time: '09:00:00', end_time: '17:00:00', is_available: 1 },
    { id: 5, resource_id: 1, day_of_week: 5, start_time: '09:00:00', end_time: '17:00:00', is_available: 1 }
  ];

  const eligibility_requirements = [
    { id: 1, resource_id: 1, title: 'FE-SEM Safety & Ultra-High Vacuum Certification', description: 'Certification badge showing completion of Nanotech Center Level 2 safety training.', document_required: 1 },
    { id: 2, resource_id: 3, title: 'AFM Non-Contact Mode & Cantilever Handling Certification', description: 'Certification badge showing completion of Nanoscale Profiling Level 1 training.', document_required: 1 },
    { id: 3, resource_id: 4, title: 'Cleanroom Safety & Photolithography Wafer Processing Credential', description: 'Cleanroom entry clearance and chemical hygiene plan authorization.', document_required: 1 }
  ];

  const eligibility_records = [
    { id: 1, user_id: 4, requirement_id: 1, status: 'approved', document_url: 'https://example.com/certs/sem-alex-cert.pdf', reviewer_notes: 'Certified by Lab Safety Officer.', reviewed_by: 2, reviewed_at: new Date('2026-02-10T12:00:00Z') },
    { id: 3, user_id: 5, requirement_id: 1, status: 'pending', document_url: 'https://example.com/certs/sem-emma-cert.pdf', reviewer_notes: 'Under review.', reviewed_by: null, reviewed_at: null }
  ];

  const now = new Date();
  const twoDaysLaterStart = new Date(now.getTime() + 2 * 24 * 3600 * 1000);
  twoDaysLaterStart.setHours(10, 0, 0, 0);
  const twoDaysLaterEnd = new Date(now.getTime() + 2 * 24 * 3600 * 1000);
  twoDaysLaterEnd.setHours(12, 0, 0, 0);

  const visits = [
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
      outcome: null,
      outcome_notes: null,
      created_at: new Date(now.getTime() - 24 * 3600 * 1000),
      updated_at: new Date(now.getTime() - 2 * 3600 * 1000)
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
      created_at: new Date(now.getTime() - 4 * 3600 * 1000),
      updated_at: new Date(now.getTime() - 4 * 3600 * 1000)
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
      created_at: new Date(now.getTime() - 18 * 3600 * 1000),
      updated_at: new Date(now.getTime() - 12 * 3600 * 1000)
    }
  ];

  const bookings = [
    {
      id: 1,
      resource_id: 1,
      user_id: 4,
      visit_id: 1,
      start_time: twoDaysLaterStart.toISOString(),
      end_time: twoDaysLaterEnd.toISOString(),
      total_amount: 2000.00,
      advance_amount: 1000.00,
      remaining_amount: 1000.00,
      advance_paid: 0,
      advance_payment_id: null,
      advance_paid_at: null,
      final_paid: 0,
      final_payment_id: null,
      final_paid_at: null,
      handover_confirmed: 0,
      handover_confirmed_at: null,
      purpose: 'Graphene nanoplatelet dispersion thickness characterization',
      attendees_count: 2,
      status: 'advance_pending',
      check_in_time: null,
      check_out_time: null,
      cancellation_reason: null,
      rejection_reason: null,
      created_at: new Date(now.getTime() - 2 * 3600 * 1000)
    },
    {
      id: 2,
      resource_id: 3,
      user_id: 4,
      visit_id: null,
      start_time: new Date(now.getTime() + 3 * 24 * 3600 * 1000).toISOString(),
      end_time: new Date(now.getTime() + 3 * 24 * 3600 * 1000 + 4 * 3600 * 1000).toISOString(),
      total_amount: 2400.00,
      advance_amount: 1200.00,
      remaining_amount: 1200.00,
      advance_paid: 1,
      advance_payment_id: 'txn_adv_2026_98124',
      advance_paid_at: new Date(now.getTime() - 24 * 3600 * 1000).toISOString(),
      final_paid: 0,
      final_payment_id: null,
      final_paid_at: null,
      handover_confirmed: 0,
      handover_confirmed_at: null,
      purpose: 'Nanoscale topological surface scans for thin film coating',
      attendees_count: 1,
      status: 'booking_confirmed',
      check_in_time: null,
      check_out_time: null,
      cancellation_reason: null,
      rejection_reason: null,
      created_at: new Date(now.getTime() - 26 * 3600 * 1000)
    },
    {
      id: 3,
      resource_id: 5,
      user_id: 4,
      visit_id: null,
      start_time: new Date(now.getTime() - 4 * 3600 * 1000).toISOString(),
      end_time: new Date(now.getTime() - 1 * 3600 * 1000).toISOString(),
      total_amount: 3500.00,
      advance_amount: 1750.00,
      remaining_amount: 1750.00,
      advance_paid: 1,
      advance_payment_id: 'txn_adv_2026_88312',
      advance_paid_at: new Date(now.getTime() - 28 * 3600 * 1000).toISOString(),
      final_paid: 0,
      final_payment_id: null,
      final_paid_at: null,
      handover_confirmed: 1,
      handover_confirmed_at: new Date(now.getTime() - 5 * 3600 * 1000).toISOString(),
      purpose: '3D confocal live cell fluorescence sectioning analysis',
      attendees_count: 2,
      status: 'usage_completed',
      check_in_time: new Date(now.getTime() - 4 * 3600 * 1000).toISOString(),
      check_out_time: new Date(now.getTime() - 1 * 3600 * 1000).toISOString(),
      cancellation_reason: null,
      rejection_reason: null,
      created_at: new Date(now.getTime() - 30 * 3600 * 1000)
    },
    {
      id: 4,
      resource_id: 2,
      user_id: 4,
      visit_id: null,
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
      handover_confirmed_at: new Date(now.getTime() - 72 * 3600 * 1000).toISOString(),
      purpose: 'Gene expression assay amplification samples',
      attendees_count: 2,
      status: 'completed',
      check_in_time: new Date(now.getTime() - 72 * 3600 * 1000).toISOString(),
      check_out_time: new Date(now.getTime() - 69 * 3600 * 1000).toISOString(),
      cancellation_reason: null,
      rejection_reason: null,
      created_at: new Date(now.getTime() - 120 * 3600 * 1000)
    }
  ];

  const payments = [
    {
      id: 1,
      booking_id: 2,
      user_id: 4,
      payment_type: 'advance_50',
      amount: 1200.00,
      currency: 'INR',
      status: 'success',
      gateway: 'ShareSphere Verified Test Gateway',
      transaction_id: 'txn_adv_2026_98124',
      receipt_number: 'RCPT-ADV-2026-0002',
      payment_method: 'UPI / NetBanking',
      created_at: new Date(now.getTime() - 24 * 3600 * 1000)
    },
    {
      id: 2,
      booking_id: 3,
      user_id: 4,
      payment_type: 'advance_50',
      amount: 1750.00,
      currency: 'INR',
      status: 'success',
      gateway: 'ShareSphere Verified Test Gateway',
      transaction_id: 'txn_adv_2026_88312',
      receipt_number: 'RCPT-ADV-2026-0003',
      payment_method: 'UPI / NetBanking',
      created_at: new Date(now.getTime() - 28 * 3600 * 1000)
    }
  ];

  const condition_reports = [
    {
      id: 1,
      booking_id: 4,
      resource_id: 2,
      reported_by: 4,
      report_type: 'check_in',
      condition_status: 'excellent',
      notes: 'Module cleaned, seals intact, system booted normally.',
      image_urls: null,
      created_at: new Date(now.getTime() - 72 * 3600 * 1000)
    },
    {
      id: 2,
      booking_id: 4,
      resource_id: 2,
      reported_by: 4,
      report_type: 'check_out',
      condition_status: 'excellent',
      notes: 'Ran 35 cycles, thermal block wiped with ethanol, powered off.',
      image_urls: null,
      created_at: new Date(now.getTime() - 69 * 3600 * 1000)
    }
  ];

  const incidents = [];

  const notifications = [
    {
      id: 1,
      user_id: 2,
      title: 'New Booking Request',
      message: 'Alex Rivera has requested to book Field Emission Scanning Electron Microscope (FE-SEM).',
      type: 'booking_request',
      link_url: '/owner/requests',
      is_read: 0,
      created_at: new Date(now.getTime() - 2 * 3600 * 1000)
    }
  ];

  const contact_messages = [
    {
      id: 1,
      name: 'Prof. Marcus Brody',
      email: 'm.brody@university.edu',
      subject: 'Department Lab Integration Inquiry',
      message: 'Hello, we would like to onboard our Archaeology scanning lab resources onto ShareSphere.',
      status: 'unread',
      created_at: new Date(now.getTime() - 12 * 3600 * 1000)
    }
  ];

  const audit_logs = [
    {
      id: 1,
      user_id: 1,
      action: 'SYSTEM_INIT',
      entity_type: 'SYSTEM',
      entity_id: null,
      details: JSON.stringify({ event: 'ShareSphere database initialized with seed records' }),
      ip_address: '127.0.0.1',
      created_at: new Date(now.getTime() - 48 * 3600 * 1000)
    },
    {
      id: 2,
      user_id: 2,
      action: 'CREATE_RESOURCE',
      entity_type: 'RESOURCE',
      entity_id: 1,
      details: JSON.stringify({ title: 'Field Emission Scanning Electron Microscope (FE-SEM)' }),
      ip_address: '127.0.0.1',
      created_at: new Date(now.getTime() - 40 * 3600 * 1000)
    },
    {
      id: 3,
      user_id: 4,
      action: 'REQUEST_BOOKING',
      entity_type: 'BOOKING',
      entity_id: 1,
      details: JSON.stringify({ resource_id: 1, status: 'pending' }),
      ip_address: '127.0.0.1',
      created_at: new Date(now.getTime() - 2 * 3600 * 1000)
    }
  ];

  return {
    users,
    resources,
    resource_images,
    resource_availability,
    eligibility_requirements,
    eligibility_records,
    visits,
    bookings,
    payments,
    condition_reports,
    incidents,
    notifications,
    contact_messages,
    audit_logs
  };
}
