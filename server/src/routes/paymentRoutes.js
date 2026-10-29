import express from 'express';
import * as paymentController from '../controllers/paymentController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.post('/calculate', paymentController.calculateBreakdown);
router.post('/advance', authenticate, paymentController.payAdvance);
router.post('/remaining', authenticate, paymentController.payRemaining);
router.patch('/bookings/:id/handover', authenticate, requireRole('owner', 'admin'), paymentController.confirmHandover);
router.patch('/bookings/:id/start-use', authenticate, paymentController.startUsage);
router.patch('/bookings/:id/complete-use', authenticate, paymentController.completeUsage);
router.patch('/bookings/:id/refund', authenticate, paymentController.requestRefund);
router.get('/my', authenticate, paymentController.getMyPayments);
router.get('/owner/earnings', authenticate, requireRole('owner', 'admin'), paymentController.getOwnerEarnings);

export default router;

