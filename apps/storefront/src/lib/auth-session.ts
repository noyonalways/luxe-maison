const TOKEN_KEY = 'maison-customer-token';
const USER_KEY = 'maison-customer-user';

export interface StoredCustomerUser {
  id: string;
  name: string;
  email: string;
  role: 'customer';
  avatar?: string;
}

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): StoredCustomerUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as StoredCustomerUser) : null;
  } catch {
    return null;
  }
}

export function setAuthSession(user: StoredCustomerUser, token: string) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
