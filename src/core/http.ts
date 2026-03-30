import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { DEFAULT_API_BASE_URL } from '../types/config.js';
import type { WechatApiResponse } from '../types/wechat-api.js';
import { getAccessToken } from './token.js';
import { WechatApiError } from './error.js';

export interface RequestOptions {
  method: 'GET' | 'POST';
  path: string;
  params?: Record<string, unknown>;
  data?: unknown;
  configPath?: string;
  /** Skip token injection (e.g. for token fetch itself) */
  skipToken?: boolean;
  /** For file upload with form-data */
  headers?: Record<string, string>;
  responseType?: AxiosRequestConfig['responseType'];
}

export async function request<T extends WechatApiResponse>(
  options: RequestOptions,
): Promise<T> {
  const { method, path, params = {}, data, configPath, skipToken, headers, responseType } = options;

  if (!skipToken) {
    const token = await getAccessToken(configPath);
    params['access_token'] = token;
  }

  const url = path.startsWith('http') ? path : `${DEFAULT_API_BASE_URL}${path}`;

  const axiosConfig: AxiosRequestConfig = {
    method,
    url,
    params,
    data,
    headers,
    responseType,
    timeout: 30000,
  };

  let resp: AxiosResponse<T>;
  try {
    resp = await axios.request<T>(axiosConfig);
  } catch (err) {
    if (axios.isAxiosError(err)) {
      throw new WechatApiError(
        err.response?.status || -1,
        err.message,
      );
    }
    throw err;
  }

  const result = resp.data;

  if (result.errcode && result.errcode !== 0) {
    throw new WechatApiError(result.errcode, result.errmsg || 'Unknown API error');
  }

  return result;
}

export async function apiGet<T extends WechatApiResponse>(
  path: string,
  params?: Record<string, unknown>,
  configPath?: string,
): Promise<T> {
  return request<T>({ method: 'GET', path, params, configPath });
}

export async function apiPost<T extends WechatApiResponse>(
  path: string,
  data?: unknown,
  params?: Record<string, unknown>,
  configPath?: string,
): Promise<T> {
  return request<T>({ method: 'POST', path, params, data, configPath });
}
