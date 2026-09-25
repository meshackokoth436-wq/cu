import { api, type ApiResponse } from '@/services/api';

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

export async function fetchTodayScripture(): Promise<DailyScripture | null> {
  const { data } = await api.get<ApiResponse<DailyScripture | null>>('/daily-scriptures/public/today');
  return data.data ?? null;
}

export async function fetchDailyScriptures(): Promise<DailyScripture[]> {
  const { data } = await api.get<ApiResponse<DailyScripture[]>>('/daily-scriptures');
  return data.data ?? [];
}

export async function saveDailyScripture(
  daySlot: number,
  payload: {
    reference: string;
    text: string;
    theme?: string;
    reflection?: string;
  }
): Promise<DailyScripture> {
  const { data } = await api.put<ApiResponse<DailyScripture>>(
    `/daily-scriptures/slot/${daySlot}`,
    payload
  );
  return data.data;
}

export async function clearDailyScripture(daySlot: number): Promise<void> {
  await api.delete(`/daily-scriptures/slot/${daySlot}`);
}
