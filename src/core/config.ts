import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { AppConfig, TokenCache, DEFAULT_CONFIG } from '../types/config.js';
import { ConfigError } from './error.js';

const CONFIG_DIR = join(homedir(), '.wechat-cli');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');
const TOKEN_FILE = join(CONFIG_DIR, 'token.json');

function ensureConfigDir(): void {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

export function getConfigDir(): string {
  return CONFIG_DIR;
}

export function getConfigPath(customPath?: string): string {
  return customPath || CONFIG_FILE;
}

export function loadConfig(customPath?: string): AppConfig {
  const configPath = getConfigPath(customPath);
  if (!existsSync(configPath)) {
    throw new ConfigError(
      `配置文件不存在: ${configPath}\n请先运行 wechat-cli config init 初始化配置`,
    );
  }

  const raw = readFileSync(configPath, 'utf-8');
  const config = JSON.parse(raw) as AppConfig;

  if (!config.appId || !config.appSecret) {
    throw new ConfigError(
      'AppID 或 AppSecret 未配置，请运行 wechat-cli config init',
    );
  }

  return { ...DEFAULT_CONFIG, ...config };
}

export function saveConfig(config: AppConfig, customPath?: string): void {
  ensureConfigDir();
  const configPath = getConfigPath(customPath);
  writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
}

export function loadTokenCache(): TokenCache | null {
  if (!existsSync(TOKEN_FILE)) {
    return null;
  }

  try {
    const raw = readFileSync(TOKEN_FILE, 'utf-8');
    return JSON.parse(raw) as TokenCache;
  } catch {
    return null;
  }
}

export function saveTokenCache(token: TokenCache): void {
  ensureConfigDir();
  writeFileSync(TOKEN_FILE, JSON.stringify(token, null, 2), 'utf-8');
}

export function clearTokenCache(): void {
  if (existsSync(TOKEN_FILE)) {
    writeFileSync(TOKEN_FILE, '', 'utf-8');
  }
}

export function getConfigValue(key: string, customPath?: string): string | undefined {
  const config = loadConfig(customPath);
  return (config as Record<string, unknown>)[key] as string | undefined;
}

export function setConfigValue(key: string, value: string, customPath?: string): void {
  const config = loadConfig(customPath);
  (config as Record<string, unknown>)[key] = value;
  saveConfig(config, customPath);
}
