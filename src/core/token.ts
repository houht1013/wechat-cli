import axios from 'axios';
import { AppConfig, TokenCache, DEFAULT_API_BASE_URL } from '../types/config.js';
import { AccessTokenResponse } from '../types/wechat-api.js';
import { loadConfig, loadTokenCache, saveTokenCache } from './config.js';
import { TokenError, WechatApiError } from './error.js';

const TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000; // refresh 5 min before expiry

export async function getAccessToken(configPath?: string): Promise<string> {
  const cached = loadTokenCache();
  if (cached && cached.accessToken && Date.now() < cached.expiresAt - TOKEN_REFRESH_BUFFER_MS) {
    return cached.accessToken;
  }

  return refreshAccessToken(configPath);
}

export async function refreshAccessToken(configPath?: string): Promise<string> {
  const config = loadConfig(configPath);
  return fetchAndCacheToken(config);
}

async function fetchAndCacheToken(config: AppConfig): Promise<string> {
  const baseUrl = config.apiBaseUrl || DEFAULT_API_BASE_URL;
  const url = `${baseUrl}/cgi-bin/token`;

  try {
    const resp = await axios.get<AccessTokenResponse>(url, {
      params: {
        grant_type: 'client_credential',
        appid: config.appId,
        secret: config.appSecret,
      },
    });

    const data = resp.data;

    if (data.errcode && data.errcode !== 0) {
      throw new WechatApiError(data.errcode, data.errmsg || 'Unknown error');
    }

    if (!data.access_token) {
      throw new TokenError('获取 Access Token 失败：响应中无 access_token');
    }

    const tokenCache: TokenCache = {
      accessToken: data.access_token,
      expiresAt: Date.now() + data.expires_in * 1000,
    };

    saveTokenCache(tokenCache);
    return data.access_token;
  } catch (err) {
    if (err instanceof WechatApiError || err instanceof TokenError) {
      throw err;
    }
    throw new TokenError(`获取 Access Token 失败: ${err instanceof Error ? err.message : String(err)}`);
  }
}
