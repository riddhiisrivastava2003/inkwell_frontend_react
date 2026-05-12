import { STORAGE_KEYS } from './constants';

export const getStoredToken = () => localStorage.getItem(STORAGE_KEYS.TOKEN) || '';

export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    return raw ? JSON.parse(raw) : null;
  } catch (_error) {
    return null;
  }
};

export const setAuthStorage = ({ token, user }) => {
  localStorage.setItem(STORAGE_KEYS.TOKEN, token || '');
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user || null));
};

export const clearAuthStorage = () => {
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
};

export const parseJwtPayload = (token) => {
  if (!token || !token.includes('.')) return null;
  try {
    const payload = token.split('.')[1];
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(normalized)
        .split('')
        .map((ch) => `%${`00${ch.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join(''),
    );
    return JSON.parse(json);
  } catch (_error) {
    return null;
  }
};


