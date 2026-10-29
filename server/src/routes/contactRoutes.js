import express from 'express';
import * as adminController from '../controllers/adminController.js';

const router = express.Router();

router.post('/', adminController.submitContact);

export default router;
