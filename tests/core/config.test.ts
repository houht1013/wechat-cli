import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

// We test config functions with a custom config path
import { saveConfig, loadConfig } from '../../src/core/config.js';
import type { AppConfig } from '../../src/types/config.js';

const TEST_DIR = join(tmpdir(), 'wechat-cli-test-' + Date.now());
const TEST_CONFIG = join(TEST_DIR, 'config.json');

describe('config', () => {
  beforeEach(() => {
    mkdirSync(TEST_DIR, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  it('should save and load config', () => {
    const config: AppConfig = {
      appId: 'test-app-id',
      appSecret: 'test-app-secret',
      accountType: 'service',
      apiBaseUrl: 'https://api.weixin.qq.com',
    };

    saveConfig(config, TEST_CONFIG);
    const loaded = loadConfig(TEST_CONFIG);

    expect(loaded.appId).toBe('test-app-id');
    expect(loaded.appSecret).toBe('test-app-secret');
    expect(loaded.accountType).toBe('service');
  });

  it('should throw on missing config file', () => {
    expect(() => loadConfig(join(TEST_DIR, 'nonexistent.json'))).toThrow('配置文件不存在');
  });

  it('should throw on empty appId', () => {
    const config = {
      appId: '',
      appSecret: 'secret',
      accountType: 'service',
      apiBaseUrl: 'https://api.weixin.qq.com',
    };
    writeFileSync(TEST_CONFIG, JSON.stringify(config), 'utf-8');

    expect(() => loadConfig(TEST_CONFIG)).toThrow('AppID 或 AppSecret 未配置');
  });
});
