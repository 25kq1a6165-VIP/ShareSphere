import express from 'express';
import * as bookingController from '../controllers/bookingController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { bookingSchema } from '../validators/index.js';

const router = express.Router();

router.post('/', authenticate, validate(bookingSchema), bookingController.createBooking);
router.get('/my', authenticate, bookingController.getMyBookings);
router.get('/requests', authenticate, requireRole('owner', 'admin'), bookingController.getOwnerRequests);
router.get('/:id', authenticate, bookingController.getBookingById);
router.patch('/:id/approve', authenticate, requireRole('owner', 'admin'), bookingController.approveBooking);
router.patch('/:id/reject', authenticate, requireRole('owner', 'admin'), bookingController.rejectBooking);
router.patch('/:id/cancel', authenticate, bookingController.cancelBooking);
router.patch('/:id/check-in', authenticate, bookingController.checkIn);
router.patch('/:id/check-out', authenticate, bookingController.checkOut);

export default router;
