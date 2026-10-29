import * as paymentService from '../services/paymentService.js';

export function calculateBreakdown(req, res, next) {
  try {
    const { duration_hours, fee_per_hour } = req.body;
    const breakdown = paymentService.calculate5050Breakdown(duration_hours, fee_per_hour);
    res.json({ success: true, data: breakdown });
  } catch (err) {
    next(err);
  }
}

export async function payAdvance(req, res, next) {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const result = await paymentService.processAdvancePayment(req.body.booking_id, req.user.id, req.body, ipAddress);
    res.json({ success: true, message: '50% Advance payment verified successfully.', data: result });
  } catch (err) {
    next(err);
  }
}

export async function payRemaining(req, res, next) {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const result = await paymentService.processRemainingPayment(req.body.booking_id, req.user.id, req.body, ipAddress);
    res.json({ success: true, message: 'Remaining balance settled successfully. Booking complete.', data: result });
  } catch (err) {
    next(err);
  }
}

export async function confirmHandover(req, res, next) {
  try {
    const result = await paymentService.confirmHandover(req.params.id, req.user.id);
    res.json({ success: true, message: 'Resource preparation and handover confirmed.', data: result });
  } catch (err) {
    next(err);
  }
}

export async function startUsage(req, res, next) {
  try {
    const result = await paymentService.markUsageStarted(req.params.id, req.user.id);
    res.json({ success: true, message: 'Resource usage commenced.', data: result });
  } catch (err) {
    next(err);
  }
}

export async function completeUsage(req, res, next) {
  try {
    const result = await paymentService.markUsageCompleted(req.params.id, req.user.id);
    res.json({ success: true, message: 'Resource usage completed. Final payment pending.', data: result });
  } catch (err) {
    next(err);
  }
}

export async function requestRefund(req, res, next) {
  try {
    const result = await paymentService.requestRefund(req.params.id, req.user.id, req.body.reason);
    res.json({ success: true, message: 'Cancellation and refund request recorded.', data: result });
  } catch (err) {
    next(err);
  }
}

export async function getMyPayments(req, res, next) {
  try {
    const payments = await paymentService.getPaymentsByUser(req.user.id);
    res.json({ success: true, count: payments.length, data: payments });
  } catch (err) {
    next(err);
  }
}

export async function getOwnerEarnings(req, res, next) {
  try {
    const earnings = await paymentService.getOwnerEarnings(req.user.id);
    res.json({ success: true, data: earnings });
  } catch (err) {
    next(err);
  }
}

