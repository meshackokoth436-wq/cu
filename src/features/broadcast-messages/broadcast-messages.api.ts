import { api, type ApiResponse } from '@/services/api';

export interface PublicAnnouncement {
  id: string;
  title: string;
  message?: string | null;
  body?: string | null;
  content?: string | null;
  category?: string | null;
  priority?: string | null;
  status?: string | null;
  published_at?: string | null;
  created_at?: string | null;
  expires_at?: string | null;
  [key: string]: unknown;
}

export async function fetchPublicAnnouncements(): Promise<PublicAnnouncement[]> {
  try {
    const { data } = await api.get<ApiResponse<PublicAnnouncement[]>>(
      '/broadcast-messages/public'
    );

    if (Array.isArray(data?.data)) {
      return data.data;
    }

    return [];
  } catch (error) {
    console.error('Failed to fetch public announcements:', error);
    return [];
  }
}

export async function fetchAnnouncements(): Promise<PublicAnnouncement[]> {
  try {
    const { data } = await api.get<ApiResponse<PublicAnnouncement[]>>(
      '/broadcast-messages'
    );

    if (Array.isArray(data?.data)) {
      return data.data;
    }

    return [];
  } catch (error) {
    console.error('Failed to fetch announcements:', error);
    return [];
  }
}

export async function createAnnouncement(
  payload: Partial<PublicAnnouncement>
): Promise<PublicAnnouncement> {
  const { data } = await api.post<ApiResponse<PublicAnnouncement>>(
    '/broadcast-messages',
    payload
  );

  return data.data;
}

export async function updateAnnouncement(
  id: string,
  payload: Partial<PublicAnnouncement>
): Promise<PublicAnnouncement> {
  const { data } = await api.put<ApiResponse<PublicAnnouncement>>(
    `/broadcast-messages/${id}`,
    payload
  );

  return data.data;
}

export async function deleteAnnouncement(id: string): Promise<void> {
  await api.delete(`/broadcast-messages/${id}`);
}