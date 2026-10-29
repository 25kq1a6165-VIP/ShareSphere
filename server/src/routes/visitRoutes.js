import express from 'express';
import * as visitController from '../controllers/visitController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.post('/', authenticate, visitController.createVisit);
router.get('/my', authenticate, visitController.getMyVisits);
router.get('/owner', authenticate, requireRole('owner', 'admin'), visitController.getOwnerVisits);
router.get('/:id', authenticate, visitController.getVisitById);
router.patch('/:id/approve', authenticate, requireRole('owner', 'admin'), visitController.approveVisit);
router.patch('/:id/reject', authenticate, requireRole('owner', 'admin'), visitController.rejectVisit);
router.patch('/:id/reschedule', authenticate, requireRole('owner', 'admin'), visitController.rescheduleVisit);
router.patch('/:id/complete', authenticate, visitController.completeVisit);
router.patch('/:id/decision', authenticate, visitController.recordDecision);

export default router;

