import { Command } from 'commander';
import { readFileSync } from 'node:fs';
import { convertMarkdown } from '../../md2html/converter.js';
import { getBuiltinThemes } from '../../md2html/themes/index.js';
import { apiPost } from '../../core/http.js';
import { output, success } from '../../core/output.js';
import type { GlobalOptions } from '../../types/common.js';
import type { DraftCreateResponse } from '../../types/wechat-api.js';

export function registerMd2htmlCommands(program: Command): void {
  const md2html = program
    .command('md2html')
    .description('Markdown 转微信公众号 HTML（支持 29 种排版主题）');

  md2html
    .option('--input <file>', 'Markdown 文件路径（不指定则从 stdin 读取）')
    .option('--output <file>', '输出 HTML 文件路径（不指定则输出到 stdout）')
    .option('--theme <id>', '主题 ID（默认 wechat）', 'wechat')
    .option('--list-themes', '列出所有可用主题')
    .option('--draft', '转换后直接创建草稿')
    .option('--title <title>', '草稿标题（配合 --draft 使用）')
    .option('--thumb-media-id <id>', '封面图 media_id（配合 --draft 使用）')
    .action(async (cmdOpts) => {
      const opts = program.opts<GlobalOptions>();

      // List themes
      if (cmdOpts.listThemes) {
        const themes = getBuiltinThemes().map(t => ({
          id: t.id,
          name: t.name,
          description: t.description,
        }));

        output(themes, { format: opts.format, outputFile: opts.output, quiet: opts.quiet });
        return;
      }

      // Read markdown input
      let markdown: string;
      if (cmdOpts.input) {
        markdown = readFileSync(cmdOpts.input, 'utf-8');
      } else {
        // Read from stdin
        const chunks: Buffer[] = [];
        for await (const chunk of process.stdin) {
          chunks.push(chunk as Buffer);
        }
        markdown = Buffer.concat(chunks).toString('utf-8');
      }

      if (!markdown.trim()) {
        throw new Error('Markdown 内容为空');
      }

      // Convert
      const themeId = cmdOpts.theme as string;
      const html = convertMarkdown(markdown, { theme: themeId });

      // Create draft if requested
      if (cmdOpts.draft) {
        const title = cmdOpts.title;
        if (!title) {
          throw new Error('创建草稿需要 --title 参数');
        }

        const article: Record<string, unknown> = {
          article_type: 'news',
          title,
          content: html,
          thumb_media_id: cmdOpts.thumbMediaId || '',
        };

        const resp = await apiPost<DraftCreateResponse>(
          '/cgi-bin/draft/add',
          { articles: [article] },
          undefined,
          opts.config,
        );

        output({
          media_id: resp.media_id,
          theme: themeId,
        }, { format: opts.format, quiet: opts.quiet });
        success(`草稿创建成功: ${resp.media_id}`, opts.quiet);
        return;
      }

      // Output HTML
      if (cmdOpts.output) {
        const { writeFileSync } = await import('node:fs');
        writeFileSync(cmdOpts.output, html, 'utf-8');
        success(`已输出到 ${cmdOpts.output}`, opts.quiet);
      } else {
        process.stdout.write(html);
        if (!opts.quiet) {
          process.stdout.write('\n');
        }
      }
    });
}
