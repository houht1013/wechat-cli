import { Command } from 'commander';
import { createReadStream } from 'node:fs';
import { basename } from 'node:path';
import FormData from 'form-data';
import { request, apiPost, apiGet } from '../../core/http.js';
import { output, success } from '../../core/output.js';
import type { GlobalOptions } from '../../types/common.js';
import type {
  MediaUploadResponse,
  PermanentMediaUploadResponse,
  MediaCountResponse,
  MediaListResponse,
  UploadImgResponse,
  WechatApiResponse,
} from '../../types/wechat-api.js';

export function registerMediaCommands(program: Command): void {
  const media = program
    .command('media')
    .description('素材管理');

  media
    .command('upload')
    .description('上传临时素材')
    .requiredOption('--type <type>', '素材类型: image | voice | video | thumb')
    .requiredOption('--file <path>', '文件路径')
    .action(async (cmdOpts) => {
      const opts = program.opts<GlobalOptions>();

      const form = new FormData();
      form.append('media', createReadStream(cmdOpts.file), basename(cmdOpts.file));

      const resp = await request<MediaUploadResponse>({
        method: 'POST',
        path: '/cgi-bin/media/upload',
        params: { type: cmdOpts.type },
        data: form,
        headers: form.getHeaders(),
        configPath: opts.config,
      });

      output({
        type: resp.type,
        media_id: resp.media_id,
        created_at: new Date(resp.created_at * 1000).toISOString(),
      }, { format: opts.format, outputFile: opts.output, quiet: opts.quiet });
      success(`临时素材上传成功: ${resp.media_id}`, opts.quiet);
    });

  media
    .command('upload-permanent')
    .description('上传永久素材')
    .requiredOption('--type <type>', '素材类型: image | voice | video | thumb')
    .requiredOption('--file <path>', '文件路径')
    .option('--title <title>', '视频素材标题（仅 video 类型需要）')
    .option('--description <desc>', '视频素材描述（仅 video 类型需要）')
    .action(async (cmdOpts) => {
      const opts = program.opts<GlobalOptions>();

      const form = new FormData();
      form.append('media', createReadStream(cmdOpts.file), basename(cmdOpts.file));

      if (cmdOpts.type === 'video') {
        form.append('description', JSON.stringify({
          title: cmdOpts.title || basename(cmdOpts.file),
          introduction: cmdOpts.description || '',
        }));
      }

      const resp = await request<PermanentMediaUploadResponse>({
        method: 'POST',
        path: '/cgi-bin/material/add_material',
        params: { type: cmdOpts.type },
        data: form,
        headers: form.getHeaders(),
        configPath: opts.config,
      });

      output({
        media_id: resp.media_id,
        url: resp.url,
      }, { format: opts.format, outputFile: opts.output, quiet: opts.quiet });
      success(`永久素材上传成功: ${resp.media_id}`, opts.quiet);
    });

  media
    .command('upload-img')
    .description('上传图文消息内的图片（返回 URL）')
    .requiredOption('--file <path>', '图片文件路径')
    .action(async (cmdOpts) => {
      const opts = program.opts<GlobalOptions>();

      const form = new FormData();
      form.append('media', createReadStream(cmdOpts.file), basename(cmdOpts.file));

      const resp = await request<UploadImgResponse>({
        method: 'POST',
        path: '/cgi-bin/media/uploadimg',
        data: form,
        headers: form.getHeaders(),
        configPath: opts.config,
      });

      output({ url: resp.url }, { format: opts.format, outputFile: opts.output, quiet: opts.quiet });
      success(`图片上传成功: ${resp.url}`, opts.quiet);
    });

  media
    .command('list')
    .description('获取素材列表')
    .requiredOption('--type <type>', '素材类型: image | voice | video | news')
    .option('--offset <n>', '起始位置', '0')
    .option('--count <n>', '获取数量 (最大20)', '20')
    .action(async (cmdOpts) => {
      const opts = program.opts<GlobalOptions>();

      const resp = await apiPost<MediaListResponse>(
        '/cgi-bin/material/batchget_material',
        {
          type: cmdOpts.type,
          offset: parseInt(cmdOpts.offset),
          count: parseInt(cmdOpts.count),
        },
        undefined,
        opts.config,
      );

      output({
        total_count: resp.total_count,
        item_count: resp.item_count,
        items: resp.item?.map(item => ({
          media_id: item.media_id,
          name: item.name,
          update_time: new Date(item.update_time * 1000).toISOString(),
          url: item.url,
        })),
      }, { format: opts.format, outputFile: opts.output, quiet: opts.quiet });
    });

  media
    .command('get')
    .description('获取素材详情')
    .argument('<media_id>', '素材 media_id')
    .action(async (mediaId: string) => {
      const opts = program.opts<GlobalOptions>();

      const resp = await apiPost<WechatApiResponse & Record<string, unknown>>(
        '/cgi-bin/material/get_material',
        { media_id: mediaId },
        undefined,
        opts.config,
      );

      output(resp, { format: opts.format, outputFile: opts.output, quiet: opts.quiet });
    });

  media
    .command('delete')
    .description('删除永久素材')
    .argument('<media_id>', '素材 media_id')
    .action(async (mediaId: string) => {
      const opts = program.opts<GlobalOptions>();

      await apiPost<WechatApiResponse>(
        '/cgi-bin/material/del_material',
        { media_id: mediaId },
        undefined,
        opts.config,
      );

      success(`素材 ${mediaId} 已删除`, opts.quiet);
    });

  media
    .command('count')
    .description('获取素材总量统计')
    .action(async () => {
      const opts = program.opts<GlobalOptions>();

      const resp = await apiGet<MediaCountResponse>(
        '/cgi-bin/material/get_materialcount',
        undefined,
        opts.config,
      );

      output({
        image: resp.image_count,
        voice: resp.voice_count,
        video: resp.video_count,
        news: resp.news_count,
      }, { format: opts.format, outputFile: opts.output, quiet: opts.quiet });
    });
}
