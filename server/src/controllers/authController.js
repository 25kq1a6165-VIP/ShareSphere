import * as authService from '../services/authService.js';
import { config } from '../config/env.js';

export async function register(req, res, next) {
  try {
    const { user, token } = await authService.registerUser(req.body, req.ip);

    // Set secure HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: config.nodeEnv === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      data: { user, token },
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { user, token } = await authService.loginUser(req.body, req.ip);

    res.cookie('token', token, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: config.nodeEnv === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      message: `Welcome back, ${user.full_name}!`,
      data: { user, token },
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res) {
  res.clearCookie('token');
  res.json({
    success: true,
    message: 'Logged out successfully.',
  });
}

export async function getMe(req, res, next) {
  try {
    const profile = await authService.getUserProfile(req.user.id);
    res.json({
      success: true,
      data: profile,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateMe(req, res, next) {
  try {
    const updated = await authService.updateUserProfile(req.user.id, req.body);
    res.json({
      success: true,
      message: 'Profile updated successfully.',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}
