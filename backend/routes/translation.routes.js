
import express from 'express';
import { requireAuth } from '../middlewares/requireAuth.js';
import { requireRole } from '../middlewares/requireRole.js';
import { translateContent } from '../controllers/translation.controller.js';

const router = express.Router();

router.post(
  '/translate',
  requireAuth,
  requireRole('admin'),
  translateContent,
);

export default router;
