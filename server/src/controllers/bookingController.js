import * as bookingService from '../services/bookingService.js';
import * as adminService from '../services/adminService.js';

export async function createBooking(req, res, next) {
  try {
    const booking = await bookingService.createBookingRequest(req.user.id, req.body, req.ip);
    res.status(201).json({
      success: true,
      message: 'Booking request submitted successfully.',
      data: booking,
    });
  } catch (err) {
    next(err);
  }
}

export async function getMyBookings(req, res, next) {
  try {
    const bookings = await bookingService.getStudentBookings(req.user.id, req.query.status);
    res.json({
      success: true,
      data: bookings,
    });
  } catch (err) {
    next(err);
  }
}

export async function getOwnerRequests(req, res, next) {
  try {
    const requests = await bookingService.getOwnerRequests(req.user.id, req.query.status);
    res.json({
      success: true,
      data: requests,
    });
  } catch (err) {
    next(err);
  }
}

export async function getBookingById(req, res, next) {
  try {
    const booking = await bookingService.getBookingById(req.params.id, req.user.id, req.user.role);
    const conditionReports = await adminService.getConditionReportsForBooking(req.params.id);
    res.json({
      success: true,
      data: {
        ...booking,
        condition_reports: conditionReports,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function approveBooking(req, res, next) {
  try {
    const booking = await bookingService.approveBooking(req.params.id, req.user.id, req.user.role, req.ip);
    res.json({
      success: true,
      message: 'Booking request approved.',
      data: booking,
    });
  } catch (err) {
    next(err);
  }
}

export async function rejectBooking(req, res, next) {
  try {
    const booking = await bookingService.rejectBooking(
      req.params.id,
      req.user.id,
      req.user.role,
      req.body.reason,
      req.ip
    );
    res.json({
      success: true,
      message: 'Booking request rejected.',
      data: booking,
    });
  } catch (err) {
    next(err);
  }
}

export async function cancelBooking(req, res, next) {
  try {
    const booking = await bookingService.cancelBooking(
      req.params.id,
      req.user.id,
      req.user.role,
      req.body.reason,
      req.ip
    );
    res.json({
      success: true,
      message: 'Booking cancelled successfully.',
      data: booking,
    });
  } catch (err) {
    next(err);
  }
}

export async function checkIn(req, res, next) {
  try {
    const booking = await bookingService.checkInBooking(
      req.params.id,
      req.user.id,
      req.user.role,
      req.body,
      req.ip
    );
    res.json({
      success: true,
      message: 'Check-in recorded successfully.',
      data: booking,
    });
  } catch (err) {
    next(err);
  }
}

export async function checkOut(req, res, next) {
  try {
    const booking = await bookingService.checkOutBooking(
      req.params.id,
      req.user.id,
      req.user.role,
      req.body,
      req.ip
    );
    res.json({
      success: true,
      message: 'Check-out recorded and booking completed successfully.',
      data: booking,
    });
  } catch (err) {
    next(err);
  }
}
