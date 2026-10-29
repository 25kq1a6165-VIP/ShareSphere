import { z } from 'zod';

export const registerSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Za-z]/, 'Password must contain at least one letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  role: z.enum(['student', 'owner'], {
    errorMap: () => ({ message: 'Public registration allows only Student or Resource Owner roles' }),
  }),
  department: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const resourceSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  category: z.string().min(2, 'Category is required'),
  type: z.enum(['equipment', 'space']),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  location: z.string().min(2, 'Location is required'),
  capacity: z.coerce.number().int().min(1).default(1),
  fee_per_hour: z.coerce.number().min(0).default(0),
  min_duration_hours: z.coerce.number().int().min(1).default(1),
  max_duration_hours: z.coerce.number().int().min(1).default(8),
  requires_approval: z.boolean().default(true),
  requires_training: z.boolean().default(false),
  safety_instructions: z.string().optional().nullable(),
  booking_rules: z.string().optional().nullable(),
  image_url: z.string().url().optional().nullable(),
}).refine(data => data.max_duration_hours >= data.min_duration_hours, {
  message: 'Maximum duration must be greater than or equal to minimum duration',
  path: ['max_duration_hours'],
});

export const bookingSchema = z.object({
  resource_id: z.coerce.number().int().positive('Valid resource ID required'),
  start_time: z.string().datetime({ message: 'Valid start date/time required' }),
  end_time: z.string().datetime({ message: 'Valid end date/time required' }),
  purpose: z.string().min(5, 'Please provide a clear purpose for the booking (min 5 characters)'),
  attendees_count: z.coerce.number().int().min(1).default(1),
}).refine(data => new Date(data.end_time) > new Date(data.start_time), {
  message: 'End time must be after start time',
  path: ['end_time'],
});

export const incidentSchema = z.object({
  resource_id: z.coerce.number().int().positive(),
  booking_id: z.coerce.number().int().positive().optional().nullable(),
  title: z.string().min(5, 'Title must be at least 5 characters').max(150),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  severity: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
});

export const conditionReportSchema = z.object({
  booking_id: z.coerce.number().int().positive(),
  resource_id: z.coerce.number().int().positive(),
  report_type: z.enum(['check_in', 'check_out', 'damage']),
  condition_status: z.enum(['excellent', 'good', 'fair', 'damaged', 'missing_parts']),
  notes: z.string().min(5, 'Please provide condition notes'),
  image_urls: z.string().optional().nullable(),
});
