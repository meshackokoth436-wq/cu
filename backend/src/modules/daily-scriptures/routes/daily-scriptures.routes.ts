import { Router } from 'express';
import { dailyScripturesController } from '../controllers/daily-scriptures.controller';
import { authenticate, loadPermissions, requirePermission } from '../../../middleware/auth.middleware';

const router = Router();

router.get('/public/today', dailyScripturesController.publicToday);

router.get(
  '/',
  authenticate,
  loadPermissions,
  requirePermission('communication.edit'),
  dailyScripturesController.list
);

router.put(
  '/slot/:daySlot',
  authenticate,
  loadPermissions,
  requirePermission('communication.edit'),
  dailyScripturesController.upsert
);

router.delete(
  '/slot/:daySlot',
  authenticate,
  loadPermissions,
  requirePermission('communication.edit'),
  dailyScripturesController.clear
);

export default router;
