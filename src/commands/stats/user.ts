import { Command } from 'commander';
import { apiPost } from '../../core/http.js';
import { output } from '../../core/output.js';
import type { GlobalOptions } from '../../types/common.js';
import type { StatsResponse } from '../../types/wechat-api.js';

function formatDateParam(date: string): string {
  // Accept YYYY-MM-DD, return as-is
  return date;
}

export function registerStatsCommands(program: Command): void {
  const stats = program
    .command('stats')
    .description('数据统计');

  // --- User stats ---
  stats
    .command('user')
    .description('用户增减数据')
    .requiredOption('--begin-date <date>', '开始日期 (YYYY-MM-DD)')
    .requiredOption('--end-date <date>', '结束日期 (YYYY-MM-DD)')
    .option('--type <type>', '统计类型: summary | cumulate', 'summary')
    .action(async (cmdOpts) => {
      const opts = program.opts<GlobalOptions>();

      const pathMap: Record<string, string> = {
        summary: '/datacube/getusersummary',
        cumulate: '/datacube/getusercumulate',
      };
      const path = pathMap[cmdOpts.type] || pathMap.summary;

      const resp = await apiPost<StatsResponse<unknown>>(
        path,
        {
          begin_date: formatDateParam(cmdOpts.beginDate),
          end_date: formatDateParam(cmdOpts.endDate),
        },
        undefined,
        opts.config,
      );

      output(resp.list, { format: opts.format, outputFile: opts.output, quiet: opts.quiet });
    });

  // --- Article stats ---
  stats
    .command('article')
    .description('图文分析数据')
    .requiredOption('--begin-date <date>', '开始日期 (YYYY-MM-DD)')
    .requiredOption('--end-date <date>', '结束日期 (YYYY-MM-DD)')
    .option('--type <type>', '统计类型: summary | total | read | share', 'summary')
    .action(async (cmdOpts) => {
      const opts = program.opts<GlobalOptions>();

      const pathMap: Record<string, string> = {
        summary: '/datacube/getarticlesummary',
        total: '/datacube/getarticletotal',
        read: '/datacube/getuserread',
        share: '/datacube/getusershare',
      };
      const path = pathMap[cmdOpts.type] || pathMap.summary;

      const resp = await apiPost<StatsResponse<unknown>>(
        path,
        {
          begin_date: formatDateParam(cmdOpts.beginDate),
          end_date: formatDateParam(cmdOpts.endDate),
        },
        undefined,
        opts.config,
      );

      output(resp.list, { format: opts.format, outputFile: opts.output, quiet: opts.quiet });
    });

  // --- Message stats ---
  stats
    .command('message')
    .description('消息分析数据')
    .requiredOption('--begin-date <date>', '开始日期 (YYYY-MM-DD)')
    .requiredOption('--end-date <date>', '结束日期 (YYYY-MM-DD)')
    .option('--type <type>', '统计类型: summary | hour | week | month | dist', 'summary')
    .action(async (cmdOpts) => {
      const opts = program.opts<GlobalOptions>();

      const pathMap: Record<string, string> = {
        summary: '/datacube/getupstreammsg',
        hour: '/datacube/getupstreammsghour',
        week: '/datacube/getupstreammsgweek',
        month: '/datacube/getupstreammsgmonth',
        dist: '/datacube/getupstreammsgdist',
      };
      const path = pathMap[cmdOpts.type] || pathMap.summary;

      const resp = await apiPost<StatsResponse<unknown>>(
        path,
        {
          begin_date: formatDateParam(cmdOpts.beginDate),
          end_date: formatDateParam(cmdOpts.endDate),
        },
        undefined,
        opts.config,
      );

      output(resp.list, { format: opts.format, outputFile: opts.output, quiet: opts.quiet });
    });
}
