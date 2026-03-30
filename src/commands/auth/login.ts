import { Command } from 'commander';
import { getAccessToken, refreshAccessToken } from '../../core/token.js';
import { loadTokenCache, clearTokenCache } from '../../core/config.js';
import { output, success, info } from '../../core/output.js';
import type { GlobalOptions } from '../../types/common.js';

export function registerAuthCommands(program: Command): void {
  const auth = program
    .command('auth')
    .description('认证管理');

  auth
    .command('login')
    .description('获取并缓存 Access Token')
    .action(async () => {
      const opts = program.opts<GlobalOptions>();
      const token = await refreshAccessToken(opts.config);
      const cached = loadTokenCache()!;

      if (opts.format === 'json' || opts.quiet) {
        output({
          access_token: token,
          expires_at: new Date(cached.expiresAt).toISOString(),
        }, { format: opts.format, quiet: opts.quiet });
      } else {
        success('Access Token 获取成功', opts.quiet);
        info(`Token: ${token.substring(0, 10)}...${token.substring(token.length - 6)}`, opts.quiet);
        info(`过期时间: ${new Date(cached.expiresAt).toLocaleString()}`, opts.quiet);
      }
    });

  auth
    .command('status')
    .description('显示当前认证状态')
    .action(async () => {
      const opts = program.opts<GlobalOptions>();
      const cached = loadTokenCache();

      if (!cached || !cached.accessToken) {
        const status = { authenticated: false, message: '未认证，请运行 wechat-cli auth login' };
        output(status, { format: opts.format, quiet: opts.quiet });
        return;
      }

      const isValid = Date.now() < cached.expiresAt;
      const remainingMs = cached.expiresAt - Date.now();
      const remainingMin = Math.max(0, Math.floor(remainingMs / 60000));

      const status = {
        authenticated: true,
        valid: isValid,
        token_preview: `${cached.accessToken.substring(0, 10)}...`,
        expires_at: new Date(cached.expiresAt).toISOString(),
        remaining_minutes: remainingMin,
      };

      output(status, { format: opts.format, quiet: opts.quiet });
    });

  auth
    .command('logout')
    .description('清除缓存的 Token')
    .action(() => {
      const opts = program.opts<GlobalOptions>();
      clearTokenCache();
      success('Token 缓存已清除', opts.quiet);
    });
}
