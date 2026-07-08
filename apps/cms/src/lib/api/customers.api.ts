import type { Customer } from '@luxe-maison/shared';
import { apiClient } from '@/lib/api/client';

export interface CreateCustomerPayload {
  name: string;
  email: string;
  phone: string;
  address: string;
  avatar?: string;
}

export interface UpdateCustomerPayload {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  avatar?: string;
}

export const customersApi = {
  list() {
    return apiClient.get<Customer[]>('/api/customers').then((res) => res.data);
  },

  getById(id: string) {
    return apiClient.get<Customer>(`/api/customers/${id}`).then((res) => res.data);
  },

  create(payload: CreateCustomerPayload) {
    return apiClient.post<Customer>('/api/customers', payload).then((res) => res.data);
  },

  update(id: string, payload: UpdateCustomerPayload) {
    return apiClient.put<Customer>(`/api/customers/${id}`, payload).then((res) => res.data);
  },

  setStatus(id: string, status: Customer['status']) {
    return apiClient
      .patch<Customer>(`/api/customers/${id}/status`, { status })
      .then((res) => res.data);
  },

  delete(id: string) {
    return apiClient.delete<{ status: 'ok' }>(`/api/customers/${id}`).then((res) => res.data);
  },
};
