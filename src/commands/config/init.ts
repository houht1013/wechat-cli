import { Command } from 'commander';
import inquirer from 'inquirer';
import { loadConfig, saveConfig, getConfigPath } from '../../core/config.js';
import { output, success, info } from '../../core/output.js';
import type { AppConfig, AccountType } from '../../types/config.js';
import { DEFAULT_CONFIG } from '../../types/config.js';
import type { GlobalOptions } from '../../types/common.js';

export function registerConfigCommands(program: Command): void {
  const config = program
    .command('config')
    .description('配置管理');

  config
    .command('init')
    .description('交互式初始化配置')
    .action(async () => {
      const opts = program.opts<GlobalOptions>();

      let existing: Partial<AppConfig> = {};
      try {
        existing = loadConfig(opts.config);
      } catch {
        // No existing config, that's fine
      }

      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'appId',
          message: 'AppID:',
          default: existing.appId || '',
          validate: (input: string) => input.trim() ? true : 'AppID 不能为空',
        },
        {
          type: 'input',
          name: 'appSecret',
          message: 'AppSecret:',
          default: existing.appSecret || '',
          validate: (input: string) => input.trim() ? true : 'AppSecret 不能为空',
        },
        {
          type: 'list',
          name: 'accountType',
          message: '账号类型:',
          choices: [
            { name: '服务号 (Service)', value: 'service' },
            { name: '订阅号 (Subscription)', value: 'subscription' },
          ],
          default: existing.accountType || 'service',
        },
      ]);

      const appConfig: AppConfig = {
        ...DEFAULT_CONFIG,
        appId: answers.appId.trim(),
        appSecret: answers.appSecret.trim(),
        accountType: answers.accountType as AccountType,
      };

      saveConfig(appConfig, opts.config);
      success(`配置已保存到 ${getConfigPath(opts.config)}`, opts.quiet);
    });

  config
    .command('get')
    .description('查看配置项')
    .argument('<key>', '配置项名称')
    .action((key: string) => {
      const opts = program.opts<GlobalOptions>();
      const cfg = loadConfig(opts.config);
      const value = (cfg as Record<string, unknown>)[key];
      if (value === undefined) {
        info(`配置项 "${key}" 不存在`, opts.quiet);
      } else {
        output({ [key]: value }, { format: opts.format, quiet: opts.quiet });
      }
    });

  config
    .command('set')
    .description('设置配置项')
    .argument('<key>', '配置项名称')
    .argument('<value>', '配置值')
    .action((key: string, value: string) => {
      const opts = program.opts<GlobalOptions>();
      const cfg = loadConfig(opts.config);
      (cfg as Record<string, unknown>)[key] = value;
      saveConfig(cfg, opts.config);
      success(`已设置 ${key} = ${value}`, opts.quiet);
    });

  config
    .command('show')
    .description('显示所有配置')
    .action(() => {
      const opts = program.opts<GlobalOptions>();
      const cfg = loadConfig(opts.config);
      // Hide secret in display
      const display = {
        ...cfg,
        appSecret: cfg.appSecret ? cfg.appSecret.substring(0, 4) + '****' : '',
      };
      output(display, { format: opts.format, quiet: opts.quiet });
    });
}
