import { Command } from 'commander';
import { readFileSync } from 'node:fs';
import { apiPost } from '../../core/http.js';
import { output, success, info } from '../../core/output.js';
import type { GlobalOptions } from '../../types/common.js';
import type {
  DraftListResponse,
  DraftCreateResponse,
  WechatApiResponse,
  PublishResponse,
  PublishStatusResponse,
} from '../../types/wechat-api.js';

export function registerDraftCommands(program: Command): void {
  const draft = program
    .command('draft')
    .description('草稿箱管理');

  draft
    .command('list')
    .description('列出草稿列表')
    .option('--offset <n>', '起始位置', '0')
    .option('--count <n>', '获取数量 (最大20)', '20')
    .option('--no-content', '不返回文章内容')
    .action(async (cmdOpts) => {
      const opts = program.opts<GlobalOptions>();
      const resp = await apiPost<DraftListResponse>(
        '/cgi-bin/draft/batchget',
        {
          offset: parseInt(cmdOpts.offset),
          count: parseInt(cmdOpts.count),
          no_content: cmdOpts.content === false ? 1 : 0,
        },
        undefined,
        opts.config,
      );

      output({
        total_count: resp.total_count,
        item_count: resp.item_count,
        items: resp.item?.map(item => ({
          media_id: item.media_id,
          update_time: new Date(item.update_time * 1000).toISOString(),
          articles: item.content?.news_item?.map((a) => ({
            article_type: ('article_type' in a ? a.article_type : 'news') as string,
            title: a.title,
            author: 'author' in a ? a.author : undefined,
            digest: 'digest' in a ? a.digest : undefined,
          })),
        })),
      }, { format: opts.format, outputFile: opts.output, quiet: opts.quiet });
    });

  draft
    .command('get')
    .description('获取草稿详情')
    .argument('<media_id>', '草稿 media_id')
    .action(async (mediaId: string) => {
      const opts = program.opts<GlobalOptions>();
      const resp = await apiPost<DraftListResponse>(
        '/cgi-bin/draft/get',
        { media_id: mediaId },
        undefined,
        opts.config,
      );

      output(resp, { format: opts.format, outputFile: opts.output, quiet: opts.quiet });
    });

  // --- 创建图文消息草稿（传统公众号文章）---
  draft
    .command('create')
    .description('创建图文消息草稿（传统公众号文章）')
    .requiredOption('--title <title>', '文章标题（不超过32字）')
    .requiredOption('--thumb-media-id <id>', '封面图永久素材 media_id')
    .option('--content <html>', '文章内容 (HTML)')
    .option('--content-file <path>', '从文件读取文章内容')
    .option('--author <author>', '作者（不超过16字）')
    .option('--digest <digest>', '摘要（不超过128字）')
    .option('--source-url <url>', '原文链接')
    .option('--open-comment', '打开评论', false)
    .option('--fans-comment-only', '仅粉丝可评论', false)
    .option('--pic-crop-235-1 <coords>', '封面裁剪 2.35:1 坐标 (X1_Y1_X2_Y2)')
    .option('--pic-crop-1-1 <coords>', '封面裁剪 1:1 坐标 (X1_Y1_X2_Y2)')
    .action(async (cmdOpts) => {
      const opts = program.opts<GlobalOptions>();

      let content = cmdOpts.content || '';
      if (cmdOpts.contentFile) {
        content = readFileSync(cmdOpts.contentFile, 'utf-8');
      }

      if (!content) {
        throw new Error('必须通过 --content 或 --content-file 提供文章内容');
      }

      const article: Record<string, unknown> = {
        article_type: 'news',
        title: cmdOpts.title,
        content,
        thumb_media_id: cmdOpts.thumbMediaId,
      };
      if (cmdOpts.author) article.author = cmdOpts.author;
      if (cmdOpts.digest) article.digest = cmdOpts.digest;
      if (cmdOpts.sourceUrl) article.content_source_url = cmdOpts.sourceUrl;
      if (cmdOpts.openComment) article.need_open_comment = 1;
      if (cmdOpts.fansCommentOnly) article.only_fans_can_comment = 1;
      if (cmdOpts.picCrop2351) article.pic_crop_235_1 = cmdOpts.picCrop2351;
      if (cmdOpts.picCrop11) article.pic_crop_1_1 = cmdOpts.picCrop11;

      const resp = await apiPost<DraftCreateResponse>(
        '/cgi-bin/draft/add',
        { articles: [article] },
        undefined,
        opts.config,
      );

      output({ media_id: resp.media_id }, { format: opts.format, outputFile: opts.output, quiet: opts.quiet });
      success(`图文消息草稿创建成功: ${resp.media_id}`, opts.quiet);
    });

  // --- 创建图片消息草稿（小绿书）---
  draft
    .command('create-newspic')
    .description('创建图片消息草稿（公众号小绿书）')
    .requiredOption('--title <title>', '标题（不超过32字）')
    .requiredOption('--images <media_ids...>', '图片永久素材 media_id 列表（最多20张，首张为封面）')
    .option('--content <text>', '纯文本内容')
    .option('--content-file <path>', '从文件读取纯文本内容')
    .option('--open-comment', '打开评论', false)
    .option('--fans-comment-only', '仅粉丝可评论', false)
    .option('--cover-crop <ratio:x1:y1:x2:y2>', '封面裁剪信息 (如 1_1:0.166:0:0.833:1)')
    .action(async (cmdOpts) => {
      const opts = program.opts<GlobalOptions>();

      let content = cmdOpts.content || '';
      if (cmdOpts.contentFile) {
        content = readFileSync(cmdOpts.contentFile, 'utf-8');
      }

      const imageList = (cmdOpts.images as string[]).map(id => ({ image_media_id: id }));

      const article: Record<string, unknown> = {
        article_type: 'newspic',
        title: cmdOpts.title,
        content,
        image_info: {
          image_list: imageList,
        },
      };

      if (cmdOpts.openComment) article.need_open_comment = 1;
      if (cmdOpts.fansCommentOnly) article.only_fans_can_comment = 1;

      if (cmdOpts.coverCrop) {
        const parts = (cmdOpts.coverCrop as string).split(':');
        if (parts.length === 5) {
          article.cover_info = {
            crop_percent_list: [{
              ratio: parts[0],
              x1: parts[1],
              y1: parts[2],
              x2: parts[3],
              y2: parts[4],
            }],
          };
        }
      }

      const resp = await apiPost<DraftCreateResponse>(
        '/cgi-bin/draft/add',
        { articles: [article] },
        undefined,
        opts.config,
      );

      output({ media_id: resp.media_id }, { format: opts.format, outputFile: opts.output, quiet: opts.quiet });
      success(`图片消息草稿（小绿书）创建成功: ${resp.media_id}`, opts.quiet);
    });

  draft
    .command('update')
    .description('更新草稿')
    .argument('<media_id>', '草稿 media_id')
    .requiredOption('--index <n>', '文章在草稿中的位置 (从0开始)', '0')
    .option('--title <title>', '文章标题')
    .option('--content <html>', '文章内容 (HTML)')
    .option('--content-file <path>', '从文件读取文章内容')
    .option('--thumb-media-id <id>', '封面图 media_id')
    .option('--author <author>', '作者')
    .option('--digest <digest>', '摘要')
    .action(async (mediaId: string, cmdOpts) => {
      const opts = program.opts<GlobalOptions>();

      const article: Record<string, unknown> = {};
      if (cmdOpts.title) article.title = cmdOpts.title;
      if (cmdOpts.contentFile) {
        article.content = readFileSync(cmdOpts.contentFile, 'utf-8');
      } else if (cmdOpts.content) {
        article.content = cmdOpts.content;
      }
      if (cmdOpts.thumbMediaId) article.thumb_media_id = cmdOpts.thumbMediaId;
      if (cmdOpts.author) article.author = cmdOpts.author;
      if (cmdOpts.digest) article.digest = cmdOpts.digest;

      await apiPost<WechatApiResponse>(
        '/cgi-bin/draft/update',
        {
          media_id: mediaId,
          index: parseInt(cmdOpts.index),
          articles: article,
        },
        undefined,
        opts.config,
      );

      success(`草稿 ${mediaId} 更新成功`, opts.quiet);
    });

  draft
    .command('delete')
    .description('删除草稿')
    .argument('<media_id>', '草稿 media_id')
    .action(async (mediaId: string) => {
      const opts = program.opts<GlobalOptions>();

      await apiPost<WechatApiResponse>(
        '/cgi-bin/draft/delete',
        { media_id: mediaId },
        undefined,
        opts.config,
      );

      success(`草稿 ${mediaId} 已删除`, opts.quiet);
    });

  draft
    .command('publish')
    .description('发布草稿')
    .argument('<media_id>', '草稿 media_id')
    .action(async (mediaId: string) => {
      const opts = program.opts<GlobalOptions>();

      const resp = await apiPost<PublishResponse>(
        '/cgi-bin/freepublish/submit',
        { media_id: mediaId },
        undefined,
        opts.config,
      );

      output({ publish_id: resp.publish_id }, { format: opts.format, outputFile: opts.output, quiet: opts.quiet });
      success(`发布任务已提交: ${resp.publish_id}`, opts.quiet);
    });

  // publish status as sub-command of draft
  draft
    .command('publish-status')
    .description('查询发布状态')
    .argument('<publish_id>', '发布任务 ID')
    .action(async (publishId: string) => {
      const opts = program.opts<GlobalOptions>();

      const resp = await apiPost<PublishStatusResponse>(
        '/cgi-bin/freepublish/get',
        { publish_id: publishId },
        undefined,
        opts.config,
      );

      const statusMap: Record<number, string> = {
        0: '发布成功',
        1: '发布中',
        2: '已删除（原创审核不通过）',
        3: '发布失败',
      };

      output({
        publish_id: resp.publish_id,
        status: statusMap[resp.publish_status] || `未知(${resp.publish_status})`,
        article_id: resp.article_id,
        article_detail: resp.article_detail,
        fail_idx: resp.fail_idx,
      }, { format: opts.format, outputFile: opts.output, quiet: opts.quiet });
    });
}
