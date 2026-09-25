import { v4 as uuidv4 } from 'uuid';
import { query } from '../../../config/database';
import { DailyScripture } from '../interfaces/daily-scriptures.interface';

export class DailyScripturesRepository {
  async list(): Promise<DailyScripture[]> {
    return query<DailyScripture[]>(
      `SELECT * FROM daily_scriptures ORDER BY day_slot ASC`
    );
  }

  async findBySlot(daySlot: number): Promise<DailyScripture | null> {
    const rows = await query<DailyScripture[]>(
      `SELECT * FROM daily_scriptures
       WHERE day_slot = :daySlot AND is_active = TRUE
       LIMIT 1`,
      { daySlot }
    );
    return rows[0] ?? null;
  }

  async upsert(
    daySlot: number,
    data: {
      reference: string;
      text: string;
      theme?: string | null;
      reflection?: string | null;
      createdBy?: string | null;
    }
  ): Promise<DailyScripture> {
    const existing = await query<{ id: string }[]>(
      `SELECT id FROM daily_scriptures WHERE day_slot = :daySlot LIMIT 1`,
      { daySlot }
    );

    if (existing[0]) {
      await query(
        `UPDATE daily_scriptures
            SET reference = :reference,
                text = :text,
                theme = :theme,
                reflection = :reflection,
                is_active = TRUE,
                created_by = COALESCE(:createdBy, created_by),
                updated_at = CURRENT_TIMESTAMP
          WHERE id = :id`,
        {
          id: existing[0].id,
          reference: data.reference,
          text: data.text,
          theme: data.theme ?? null,
          reflection: data.reflection ?? null,
          createdBy: data.createdBy ?? null,
        }
      );
      return this.findById(existing[0].id);
    }

    const id = uuidv4();
    await query(
      `INSERT INTO daily_scriptures
        (id, day_slot, reference, text, theme, reflection, is_active, created_by)
       VALUES
        (:id, :daySlot, :reference, :text, :theme, :reflection, TRUE, :createdBy)`,
      {
        id,
        daySlot,
        reference: data.reference,
        text: data.text,
        theme: data.theme ?? null,
        reflection: data.reflection ?? null,
        createdBy: data.createdBy ?? null,
      }
    );
    return this.findById(id);
  }

  async clearSlot(daySlot: number): Promise<void> {
    await query(
      `DELETE FROM daily_scriptures WHERE day_slot = :daySlot`,
      { daySlot }
    );
  }

  private async findById(id: string): Promise<DailyScripture> {
    const rows = await query<DailyScripture[]>(
      `SELECT * FROM daily_scriptures WHERE id = :id LIMIT 1`,
      { id }
    );
    if (!rows[0]) throw new Error('Daily scripture could not be loaded after saving.');
    return rows[0];
  }
}
