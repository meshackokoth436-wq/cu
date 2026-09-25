export interface DailyScripture {
  id: string;
  day_slot: number;
  reference: string;
  text: string;
  theme: string | null;
  reflection: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}
