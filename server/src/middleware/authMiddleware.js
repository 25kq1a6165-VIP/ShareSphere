import { verifyToken } from '../utils/jwt.js';
import { query } from '../config/db.js';

export async function authenticate(req, res, next) {
  try {
    let token = null;

    // 1. Check Bearer Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // 2. Check HTTP-only cookie
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in to continue.',
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session. Please log in again.',
      });
    }

    // Fetch user from db to confirm they exist and are active
    const rows = await query('SELECT id, full_name, email, role, department, phone, avatar_url, status FROM users WHERE id = ?', [decoded.id]);
    const user = rows[0];

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Account no longer exists.',
      });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact administrator.',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

export function optionalAuthenticate(req, res, next) {
  let token = null;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = verifyToken(token);
    query('SELECT id, full_name, email, role, department, phone, avatar_url, status FROM users WHERE id = ?', [decoded.id])
      .then(rows => {
        req.user = rows[0] || null;
        next();
      })
      .catch(() => {
        req.user = null;
        next();
      });
  } catch (e) {
    req.user = null;
    next();
  }
}
