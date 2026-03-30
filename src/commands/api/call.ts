import { Command } from 'commander';
import { readFileSync } from 'node:fs';
import { request } from '../../core/http.js';
import { output } from '../../core/output.js';
import type { GlobalOptions } from '../../types/common.js';
import type { WechatApiResponse } from '../../types/wechat-api.js';

export function registerApiCommands(program: Command): void {
  const api = program
    .command('api')
    .description('原始 API 调用（自动注入 Access Token）');

  api
    .command('get')
    .description('发送 GET 请求')
    .argument('<path>', 'API 路径，如 /cgi-bin/user/info')
    .option('--query <pairs...>', '查询参数 (key=value 格式)')
    .action(async (path: string, cmdOpts) => {
      const opts = program.opts<GlobalOptions>();
      const params = parseQueryPairs(cmdOpts.query);

      const resp = await request<WechatApiResponse & Record<string, unknown>>({
        method: 'GET',
        path,
        params,
        configPath: opts.config,
      });

      output(resp, { format: opts.format, outputFile: opts.output, quiet: opts.quiet });
    });

  api
    .command('post')
    .description('发送 POST 请求')
    .argument('<path>', 'API 路径，如 /cgi-bin/draft/batchget')
    .option('--body <json>', '请求体 (JSON 字符串)')
    .option('--body-file <path>', '从文件读取请求体')
    .option('--query <pairs...>', '查询参数 (key=value 格式)')
    .action(async (path: string, cmdOpts) => {
      const opts = program.opts<GlobalOptions>();
      const params = parseQueryPairs(cmdOpts.query);

      let data: unknown;
      if (cmdOpts.bodyFile) {
        const raw = readFileSync(cmdOpts.bodyFile, 'utf-8');
        data = JSON.parse(raw);
      } else if (cmdOpts.body) {
        data = JSON.parse(cmdOpts.body);
      }

      const resp = await request<WechatApiResponse & Record<string, unknown>>({
        method: 'POST',
        path,
        params,
        data,
        configPath: opts.config,
      });

      output(resp, { format: opts.format, outputFile: opts.output, quiet: opts.quiet });
    });
}

function parseQueryPairs(pairs?: string[]): Record<string, unknown> {
  if (!pairs) return {};
  const result: Record<string, unknown> = {};
  for (const pair of pairs) {
    const eqIdx = pair.indexOf('=');
    if (eqIdx > 0) {
      result[pair.substring(0, eqIdx)] = pair.substring(eqIdx + 1);
    }
  }
  return result;
}
