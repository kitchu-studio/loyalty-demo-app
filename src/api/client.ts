import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';

import { API_URL } from '../config';
import type { TokenResponse } from './types';

const ACCESS_KEY = 'loyalty.access';
const REFRESH_KEY = 'loyalty.refresh';

let accessToken: string | null = null;
let onSessionExpired: (() => void) | null = null;

export const tokenStore = {
  /** Loads saved tokens into memory. Returns true when a session may exist. */
  async load(): Promise<boolean> {
    try {
      accessToken = await SecureStore.getItemAsync(ACCESS_KEY);
      const refresh = await SecureStore.getItemAsync(REFRESH_KEY);
      return Boolean(accessToken && refresh);
    } catch {
      return false;
    }
  },
  async save(access: string, refresh: string): Promise<void> {
    accessToken = access;
    await SecureStore.setItemAsync(ACCESS_KEY, access);
    await SecureStore.setItemAsync(REFRESH_KEY, refresh);
  },
  async clear(): Promise<void> {
    accessToken = null;
    try {
      await SecureStore.deleteItemAsync(ACCESS_KEY);
      await SecureStore.deleteItemAsync(REFRESH_KEY);
    } catch {
      // nothing else to do: the in-memory token is already gone
    }
  },
};

export function setSessionExpiredHandler(fn: (() => void) | null): void {
  onSessionExpired = fn;
}

/** No auth header and no refresh logic: used for login, register and refresh itself. */
export const publicApi = axios.create({ baseURL: `${API_URL}/api/v1`, timeout: 15000 });

export const api = axios.create({ baseURL: `${API_URL}/api/v1`, timeout: 30000 });

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

// Several requests can fail with 401 at the same moment; they all wait for one refresh.
let refreshing: Promise<boolean> | null = null;

async function refreshTokens(): Promise<boolean> {
  try {
    const refresh = await SecureStore.getItemAsync(REFRESH_KEY);
    if (!refresh) return false;
    const res = await publicApi.post<TokenResponse>('/auth/refresh', { refresh_token: refresh });
    await tokenStore.save(res.data.access_token, res.data.refresh_token);
    return true;
  } catch {
    return false;
  }
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;
    if (error.response?.status !== 401 || !original || original._retried) {
      throw error;
    }
    original._retried = true;

    refreshing ??= refreshTokens().finally(() => {
      refreshing = null;
    });
    const ok = await refreshing;
    if (!ok) {
      onSessionExpired?.();
      throw error;
    }
    original.headers.Authorization = `Bearer ${accessToken}`;
    return api(original);
  },
);
