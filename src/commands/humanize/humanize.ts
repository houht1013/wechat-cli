import { Command } from 'commander';
import { readFileSync } from 'node:fs';
import { buildHumanizePrompt } from '../../humanize/index.js';
import { output } from '../../core/output.js';
import type { GlobalOptions } from '../../types/common.js';
import type { Intensity, PatternCategory } from '../../humanize/patterns.js';

export function registerHumanizeCommands(program: Command): void {
  const humanize = program
    .command('humanize')
    .description('AI 文章去痕（输出改写 prompt，由 Agent 执行）');

  humanize
    .requiredOption('--input <file>', 'Markdown 文章文件路径')
    .option('--intensity <level>', '改写强度: gentle | medium | aggressive', 'medium')
    .option('--focus <categories>', '聚焦模式类别（逗号分隔）: content,language,style,filler,collaboration')
    .option('--preserve-style <style>', '保留写作风格（配合 writer 使用）')
    .option('--score', '在输出中包含 5 维质量评分要求', false)
    .option('--output <file>', '输出 prompt 到文件')
    .action(async (cmdOpts) => {
      const opts = program.opts<GlobalOptions>();

      const content = readFileSync(cmdOpts.input, 'utf-8');
      if (!content.trim()) {
        throw new Error('文章内容为空');
      }

      const focusCategories = cmdOpts.focus
        ? (cmdOpts.focus as string).split(',').map(s => s.trim()) as PatternCategory[]
        : undefined;

      const result = buildHumanizePrompt({
        content,
        intensity: cmdOpts.intensity as Intensity,
        focusCategories,
        preserveStyle: cmdOpts.preserveStyle,
        includeScore: cmdOpts.score,
      });

      if (cmdOpts.output) {
        const { writeFileSync } = await import('node:fs');
        writeFileSync(cmdOpts.output, result.prompt, 'utf-8');
        output({ intensity: result.intensity, focus_patterns: result.focus_patterns, output: cmdOpts.output },
          { format: opts.format, quiet: opts.quiet });
      } else {
        output(result, { format: opts.format, quiet: opts.quiet });
      }
    });
}
