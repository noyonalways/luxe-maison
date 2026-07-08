import type { PopupConfig } from '@luxe-maison/shared';
import { apiClient } from '@/lib/api/client';

export type CreatePopupPayload = Omit<PopupConfig, 'id'> & { id?: string };

export type UpdatePopupPayload = Partial<
  Pick<
    PopupConfig,
    | 'enabled'
    | 'title'
    | 'message'
    | 'discountCode'
    | 'ctaText'
    | 'ctaLink'
    | 'trigger'
    | 'priority'
  >
>;

export const popupsApi = {
  list() {
    return apiClient.get<PopupConfig[]>('/api/popups').then((res) => res.data);
  },

  getById(id: string) {
    return apiClient.get<PopupConfig>(`/api/popups/${id}`).then((res) => res.data);
  },

  create(popup: CreatePopupPayload) {
    return apiClient.post<PopupConfig>('/api/popups', popup).then((res) => res.data);
  },

  update(id: string, popup: UpdatePopupPayload) {
    return apiClient.put<PopupConfig>(`/api/popups/${id}`, popup).then((res) => res.data);
  },

  setEnabled(id: string, enabled: boolean) {
    return apiClient
      .patch<PopupConfig>(`/api/popups/${id}/enabled`, { enabled })
      .then((res) => res.data);
  },

  delete(id: string) {
    return apiClient.delete<{ status: 'ok' }>(`/api/popups/${id}`).then((res) => res.data);
  },
};
