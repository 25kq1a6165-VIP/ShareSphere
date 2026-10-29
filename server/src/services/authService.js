import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';
import { signToken } from '../utils/jwt.js';
import { logAudit } from './auditService.js';

export async function registerUser({ full_name, email, password, role = 'student', department, phone }, ipAddress) {
  const normalizedEmail = email.trim().toLowerCase();

  // 1. Check if email already exists
  const existing = await query('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
  if (existing.length > 0) {
    const error = new Error('An account with this email address already exists.');
    error.statusCode = 409;
    throw error;
  }

  // 2. Hash password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  // 3. Generate initial avatar
  const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(full_name)}`;

  // 4. Insert user
  const result = await query(
    `INSERT INTO users (full_name, email, password_hash, role, department, phone, avatar_url, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'active')`,
    [full_name.trim(), normalizedEmail, passwordHash, role, department || null, phone || null, avatarUrl]
  );

  const userId = result.insertId;

  // 5. Audit log
  await logAudit({
    userId,
    action: 'USER_REGISTERED',
    entityType: 'USER',
    entityId: userId,
    details: { email: normalizedEmail, role },
    ipAddress,
  });

  // 6. Generate token
  const token = signToken({ id: userId, email: normalizedEmail, role });

  return {
    user: {
      id: userId,
      full_name: full_name.trim(),
      email: normalizedEmail,
      role,
      department: department || null,
      phone: phone || null,
      avatar_url: avatarUrl,
      status: 'active',
    },
    token,
  };
}

export async function loginUser({ email, password }, ipAddress) {
  const normalizedEmail = email.trim().toLowerCase();

  // 1. Fetch user by email
  const rows = await query(
    `SELECT id, full_name, email, password_hash, role, department, phone, avatar_url, status
     FROM users WHERE email = ?`,
    [normalizedEmail]
  );

  const user = rows[0];
  if (!user) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  // 2. Verify account status
  if (user.status === 'suspended') {
    const error = new Error('Your account has been suspended. Please contact campus IT administration.');
    error.statusCode = 403;
    throw error;
  }

  // 3. Compare password
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  // 4. Sign JWT
  const token = signToken({ id: user.id, email: user.email, role: user.role });

  // 5. Audit log
  await logAudit({
    userId: user.id,
    action: 'USER_LOGIN',
    entityType: 'USER',
    entityId: user.id,
    details: { email: user.email },
    ipAddress,
  });

  // Return sanitized user
  const sanitizedUser = {
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    role: user.role,
    department: user.department,
    phone: user.phone,
    avatar_url: user.avatar_url,
    status: user.status,
  };

  return { user: sanitizedUser, token };
}

export async function getUserProfile(userId) {
  const rows = await query(
    `SELECT id, full_name, email, role, department, phone, avatar_url, status, created_at
     FROM users WHERE id = ?`,
    [userId]
  );

  if (!rows[0]) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  return rows[0];
}

export async function updateUserProfile(userId, { full_name, department, phone, avatar_url }) {
  await query(
    `UPDATE users
     SET full_name = COALESCE(?, full_name),
         department = COALESCE(?, department),
         phone = COALESCE(?, phone),
         avatar_url = COALESCE(?, avatar_url)
     WHERE id = ?`,
    [full_name, department, phone, avatar_url, userId]
  );

  return getUserProfile(userId);
}
