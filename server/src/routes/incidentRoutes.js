import express from 'express';
import * as adminController from '../controllers/adminController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { incidentSchema } from '../validators/index.js';

const router = express.Router();

router.post('/', authenticate, validate(incidentSchema), adminController.createIncident);
router.get('/', authenticate, adminController.getIncidents);
router.patch('/:id/resolve', authenticate, requireRole('owner', 'admin'), adminController.resolveIncident);

export default router;
