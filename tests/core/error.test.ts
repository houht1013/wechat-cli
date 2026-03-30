import { describe, it, expect } from 'vitest';
import { WechatCliError, WechatApiError, ConfigError, TokenError } from '../../src/core/error.js';

describe('error classes', () => {
  it('WechatApiError should format message correctly', () => {
    const err = new WechatApiError(40001, 'invalid credential');
    expect(err.message).toBe('WeChat API Error [40001]: invalid credential');
    expect(err.errcode).toBe(40001);
    expect(err.errmsg).toBe('invalid credential');
    expect(err.name).toBe('WechatApiError');
  });

  it('ConfigError should have correct name', () => {
    const err = new ConfigError('config missing');
    expect(err.name).toBe('ConfigError');
    expect(err.message).toBe('config missing');
  });

  it('TokenError should have correct name', () => {
    const err = new TokenError('token expired');
    expect(err.name).toBe('TokenError');
  });

  it('WechatCliError should carry details', () => {
    const err = new WechatCliError('test', 500, { extra: 'info' });
    expect(err.code).toBe(500);
    expect(err.details).toEqual({ extra: 'info' });
  });
});
