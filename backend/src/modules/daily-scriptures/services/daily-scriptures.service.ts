import { ValidationError } from '../../../utils/errors';
import { DailyScripturesRepository } from '../repositories/daily-scriptures.repository';

export class DailyScripturesService {
  constructor(private readonly repository = new DailyScripturesRepository()) {}

  async list() {
    return this.repository.list();
  }

  async getForToday() {
    // TUMCU operates in Kenya; keep the daily boundary at Africa/Nairobi
    // rather than depending on the server's UTC/local timezone.
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Africa/Nairobi',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(new Date());

    const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
    const year = get('year');
    const month = get('month');
    const day = get('day');

    const utcToday = Date.UTC(year, month - 1, day);
    const epoch = Date.UTC(1970, 0, 1);
    const daysSinceEpoch = Math.floor((utcToday - epoch) / 86400000);
    const daySlot = (daysSinceEpoch % 5) + 1;

    const scripture = await this.repository.findBySlot(daySlot);
    return scripture ? { ...scripture, day_slot: daySlot } : null;
  }

  async upsertSlot(daySlot: number, payload: {
    reference?: unknown;
    text?: unknown;
    theme?: unknown;
    reflection?: unknown;
  }, createdBy: string) {
    if (!Number.isInteger(daySlot) || daySlot < 1 || daySlot > 5) {
      throw new ValidationError('Day slot must be a number from 1 to 5');
    }

    const reference = typeof payload.reference === 'string' ? payload.reference.trim() : '';
    const text = typeof payload.text === 'string' ? payload.text.trim() : '';
    const theme = typeof payload.theme === 'string' ? payload.theme.trim() : '';
    const reflection = typeof payload.reflection === 'string' ? payload.reflection.trim() : '';

    if (!reference) throw new ValidationError('Bible reference is required');
    if (!text) throw new ValidationError('Scripture text is required');
    if (reference.length > 120) throw new ValidationError('Bible reference is too long');
    if (text.length > 10000) throw new ValidationError('Scripture text is too long');

    return this.repository.upsert(daySlot, {
      reference,
      text,
      theme: theme || null,
      reflection: reflection || null,
      createdBy,
    });
  }

  async clearSlot(daySlot: number) {
    if (!Number.isInteger(daySlot) || daySlot < 1 || daySlot > 5) {
      throw new ValidationError('Day slot must be a number from 1 to 5');
    }
    return this.repository.clearSlot(daySlot);
  }
}
