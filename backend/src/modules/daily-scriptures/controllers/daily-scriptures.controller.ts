import { Request, Response } from 'express';
import { asyncHandler } from '../../../utils/asyncHandler';
import { sendSuccess } from '../../../utils/response';
import { DailyScripturesService } from '../services/daily-scriptures.service';

const service = new DailyScripturesService();

export const dailyScripturesController = {
  publicToday: asyncHandler(async (_req: Request, res: Response) => {
    const scripture = await service.getForToday();
    return sendSuccess(res, scripture, scripture ? 'Daily scripture retrieved' : 'No daily scripture has been configured');
  }),

  list: asyncHandler(async (_req: Request, res: Response) => {
    const scriptures = await service.list();
    return sendSuccess(res, scriptures, 'Daily scriptures retrieved');
  }),

  upsert: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.sub) throw new Error('Authenticated user is required');
    const daySlot = Number(req.params.daySlot);
    const scripture = await service.upsertSlot(daySlot, req.body, req.user.sub);
    return sendSuccess(res, scripture, `Day ${daySlot} scripture saved`, 200);
  }),

  clear: asyncHandler(async (req: Request, res: Response) => {
    const daySlot = Number(req.params.daySlot);
    await service.clearSlot(daySlot);
    return sendSuccess(res, null, `Day ${daySlot} scripture cleared`);
  }),
};
