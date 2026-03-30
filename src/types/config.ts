export type AccountType = 'subscription' | 'service';

export interface AppConfig {
  appId: string;
  appSecret: string;
  accountType: AccountType;
  apiBaseUrl: string;
  [key: string]: unknown;
}

export interface TokenCache {
  accessToken: string;
  expiresAt: number; // Unix timestamp in ms
}

export const DEFAULT_API_BASE_URL = 'https://api.weixin.qq.com';

export const DEFAULT_CONFIG: AppConfig = {
  appId: '',
  appSecret: '',
  accountType: 'service',
  apiBaseUrl: DEFAULT_API_BASE_URL,
};
