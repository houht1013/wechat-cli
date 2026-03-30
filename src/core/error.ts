export class WechatCliError extends Error {
  constructor(
    message: string,
    public code?: number,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'WechatCliError';
  }
}

export class WechatApiError extends WechatCliError {
  constructor(
    public errcode: number,
    public errmsg: string,
  ) {
    super(`WeChat API Error [${errcode}]: ${errmsg}`, errcode);
    this.name = 'WechatApiError';
  }
}

export class ConfigError extends WechatCliError {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigError';
  }
}

export class TokenError extends WechatCliError {
  constructor(message: string) {
    super(message);
    this.name = 'TokenError';
  }
}

export function handleError(err: unknown): never {
  if (err instanceof WechatCliError) {
    process.stderr.write(`Error: ${err.message}\n`);
    if (err.details) {
      process.stderr.write(`Details: ${JSON.stringify(err.details)}\n`);
    }
    process.exit(1);
  }

  if (err instanceof Error) {
    process.stderr.write(`Error: ${err.message}\n`);
    process.exit(1);
  }

  process.stderr.write(`Unknown error: ${String(err)}\n`);
  process.exit(1);
}
