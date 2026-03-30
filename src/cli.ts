import { Command } from 'commander';
import { registerConfigCommands } from './commands/config/init.js';
import { registerAuthCommands } from './commands/auth/login.js';
import { registerDraftCommands } from './commands/draft/list.js';
import { registerMediaCommands } from './commands/media/upload.js';
import { registerStatsCommands } from './commands/stats/user.js';
import { registerApiCommands } from './commands/api/call.js';
import { registerMd2htmlCommands } from './commands/md2html/convert.js';
import { registerWriteCommands } from './commands/writer/write.js';
import { registerHumanizeCommands } from './commands/humanize/humanize.js';

export function createCli(): Command {
  const program = new Command();

  program
    .name('wechat-cli')
    .description('微信公众号 CLI - 面向 AI Agent 的命令行工具')
    .version('0.1.0')
    .option('-f, --format <format>', '输出格式: json | pretty | table | csv', 'pretty')
    .option('-o, --output <file>', '输出到文件')
    .option('-q, --quiet', '静默模式', false)
    .option('--verbose', '详细模式', false)
    .option('--config <path>', '指定配置文件路径');

  registerConfigCommands(program);
  registerAuthCommands(program);
  registerDraftCommands(program);
  registerMediaCommands(program);
  registerStatsCommands(program);
  registerApiCommands(program);
  registerMd2htmlCommands(program);
  registerWriteCommands(program);
  registerHumanizeCommands(program);

  return program;
}
