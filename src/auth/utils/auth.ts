import { LoginResponse } from '../models/login-response';
import { User, userLocalStorageKey } from '../models/user';
import { clearAccessToken, setAccessToken } from './token';

export function clearAuth() {
  clearAccessToken();
  localStorage.removeItem(userLocalStorageKey);
  localStorage.clear();
}

export function setAuth(response: LoginResponse) {
  setAccessToken({ token: response.token, expiry: response.expiry });
  localStorage.setItem(userLocalStorageKey, JSON.stringify(response.user));
}

export function getAccessInfo(): User | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const user = localStorage.getItem(userLocalStorageKey);
  return user ? JSON.parse(user) : null;
}
