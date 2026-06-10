import { AccessToken, accessTokenStorageKey } from '../models/token';

export function getAccessToken(): AccessToken | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const token = localStorage.getItem(accessTokenStorageKey);
  if (!token) {
    return null;
  }

  const parsed: AccessToken = JSON.parse(token);
  if (new Date(parsed.expiry) < new Date()) {
    localStorage.removeItem(accessTokenStorageKey);
    return null;
  }

  return parsed;
}

export function setAccessToken(token: AccessToken) {
  localStorage.setItem(accessTokenStorageKey, JSON.stringify(token));
}

export function clearAccessToken() {
  localStorage.removeItem(accessTokenStorageKey);
}
