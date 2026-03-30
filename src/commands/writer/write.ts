import { Command } from 'commander';
import { readFileSync } from 'node:fs';
import { buildWritePrompt, getStyles } from '../../writer/index.js';
import { output } from '../../core/output.js';
import type { GlobalOptions } from '../../types/common.js';
import type { InputType, ArticleLength } from '../../writer/styles/types.js';

export function registerWriteCommands(program: Command): void {
  const write = program
    .command('write')
    .description('AI 风格化文章写作（输出写作 prompt，由 Agent 执行）');

  write
    .option('--list-styles', '列出所有可用写作风格')
    .option('--style <id>', '写作风格', 'tech-tutorial')
    .option('--idea <text>', '文章想法或观点')
    .option('--input <file>', '从文件读取输入内容')
    .option('--input-type <type>', '输入类型: idea | fragment | outline | title', 'idea')
    .option('--length <length>', '文章长度: short | medium | long', 'medium')
    .option('--output <file>', '输出 prompt 到文件')
    .action(async (cmdOpts) => {
      const opts = program.opts<GlobalOptions>();

      if (cmdOpts.listStyles) {
        const styles = getStyles().map(s => ({
          id: s.id,
          name: s.name,
          description: s.description,
        }));
        output(styles, { format: opts.format, outputFile: opts.output, quiet: opts.quiet });
        return;
      }

      // Get input content
      let inputText: string;
      if (cmdOpts.input) {
        inputText = readFileSync(cmdOpts.input, 'utf-8');
      } else if (cmdOpts.idea) {
        inputText = cmdOpts.idea;
      } else {
        throw new Error('请通过 --idea 或 --input 提供写作内容');
      }

      const result = buildWritePrompt({
        styleId: cmdOpts.style,
        input: inputText,
        inputType: cmdOpts.inputType as InputType,
        length: cmdOpts.length as ArticleLength,
      });

      if (cmdOpts.output) {
        const { writeFileSync } = await import('node:fs');
        writeFileSync(cmdOpts.output, result.prompt, 'utf-8');
        output({ style: result.style, output: cmdOpts.output, metadata: result.metadata },
          { format: opts.format, quiet: opts.quiet });
      } else {
        output(result, { format: opts.format, quiet: opts.quiet });
      }
    });
}
