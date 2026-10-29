import express from 'express';
import * as resourceController from '../controllers/resourceController.js';
import { authenticate, optionalAuthenticate } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { resourceSchema } from '../validators/index.js';

const router = express.Router();

router.get('/', optionalAuthenticate, resourceController.getResources);
router.get('/stats', resourceController.getPlatformStats);
router.get('/owner', authenticate, requireRole('owner', 'admin'), resourceController.getOwnerResources);
router.get('/:id', optionalAuthenticate, resourceController.getResourceById);
router.post('/', authenticate, requireRole('owner', 'admin'), validate(resourceSchema), resourceController.createResource);
router.patch('/:id', authenticate, requireRole('owner', 'admin'), resourceController.updateResource);
router.delete('/:id', authenticate, requireRole('owner', 'admin'), resourceController.deleteResource);

export default router;
