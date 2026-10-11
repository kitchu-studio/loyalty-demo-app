import { api, publicApi } from './client';
import type {
  ChatMessage,
  ChatReply,
  ClaimResult,
  EarnCode,
  LedgerEntry,
  Me,
  Redemption,
  RedeemResult,
  Reward,
  Shop,
  Summary,
  TokenResponse,
} from './types';

export * from './types';
export { errorMessage } from './errors';

export const auth = {
  login: (email: string, password: string) =>
    publicApi.post<TokenResponse>('/auth/login', { email, password }).then((r) => r.data),
  register: (name: string, email: string, password: string) =>
    publicApi.post<TokenResponse>('/auth/register', { name, email, password }).then((r) => r.data),
};

export const getMe = () => api.get<Me>('/me').then((r) => r.data);
export const getShop = () => api.get<Shop>('/shop').then((r) => r.data);
export const getRewards = () => api.get<Reward[]>('/rewards').then((r) => r.data);
export const getHistory = () => api.get<LedgerEntry[]>('/points/history').then((r) => r.data);
export const getRedemptions = () => api.get<Redemption[]>('/redemptions').then((r) => r.data);

export const claimCode = (code: string) =>
  api.post<ClaimResult>('/points/claim', { code }).then((r) => r.data);
export const redeemReward = (id: number) =>
  api.post<RedeemResult>(`/rewards/${id}/redeem`).then((r) => r.data);

export const sendChat = (messages: ChatMessage[]) =>
  api.post<ChatReply>('/chat', { messages }).then((r) => r.data);

// Staff
export const getSummary = () => api.get<Summary>('/admin/summary').then((r) => r.data);
export const createEarnCode = (amountBaht: number) =>
  api.post<EarnCode>('/admin/earn-codes', { amount_baht: amountBaht }).then((r) => r.data);
export const lookupVoucher = (code: string) =>
  api.get<Redemption>(`/admin/redemptions/${encodeURIComponent(code)}`).then((r) => r.data);
export const useVoucher = (code: string) =>
  api.post<Redemption>(`/admin/redemptions/${encodeURIComponent(code)}/use`).then((r) => r.data);
export const saveAbout = (about: string) =>
  api.put<{ about: string }>('/admin/shop-about', { about }).then((r) => r.data);
