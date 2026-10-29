import express from 'express';
import * as notificationController from '../controllers/notificationController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// Real-time SSE Stream (authenticates via query parameter or header)
router.get('/stream', notificationController.getStream);

// Notification retrieval & badges
router.get('/', authenticate, notificationController.getMyNotifications);
router.get('/unread-count', authenticate, notificationController.getUnreadCount);

// Notification read state management
router.patch('/read-all', authenticate, notificationController.markAllAsRead);
router.patch('/:id/read', authenticate, notificationController.markAsRead);

// Preferences management
router.get('/preferences', authenticate, notificationController.getPreferences);
router.put('/preferences', authenticate, notificationController.updatePreferences);
router.patch('/preferences', authenticate, notificationController.updatePreferences);

// Manual scheduler trigger
router.post('/scheduler/run', authenticate, notificationController.triggerScheduler);

export default router;
