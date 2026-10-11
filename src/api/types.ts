export interface User {
  id: number;
  email: string;
  name: string;
  is_admin: boolean;
}

export interface Me extends User {
  points: number;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user?: User;
}

export interface Shop {
  name: string;
  about: string;
  baht_per_point: number;
}

export interface Reward {
  id: number;
  name: string;
  description: string;
  cost_points: number;
}

export interface LedgerEntry {
  id: number;
  delta: number;
  reason: 'earn' | 'redeem';
  note: string;
  created_at: string;
}

export interface Redemption {
  id: number;
  reward_name: string;
  cost_points: number;
  code: string;
  status: 'active' | 'used';
  created_at: string;
  used_at: string | null;
  customer_name?: string;
}

export interface ClaimResult {
  points: number;
  balance: number;
}

export interface RedeemResult {
  redemption: Redemption;
  balance: number;
}

export interface EarnCode {
  code: string;
  amount_baht: number;
  points: number;
  expires_at: string;
}

export interface Summary {
  members: number;
  points_issued: number;
  active_vouchers: number;
  used_vouchers: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatReply {
  reply: string;
  /** "claude" for real AI answers; "demo" or "demo_fallback" for built-in answers. */
  mode: 'claude' | 'demo' | 'demo_fallback';
}
